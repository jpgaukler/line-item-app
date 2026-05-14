import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Subject, switchMap } from 'rxjs';
import { ProductHttpService } from '../../shared/data-access/product.http.service';
import {
  ProductCode,
  ProductCodePriceDictionary,
} from '../interfaces/product-code-price-dictionary';
import { Product } from '../interfaces/product.interface';
import { buildProductCodeHash, generateProductCodes } from '../utils/product-utils';

interface ProductEditPriceDictionaryState {
  product: Product;
  productCodeHash: string;
  productCodePriceDictionary: ProductCodePriceDictionary;
  loaded: boolean;
  error: string | null;
}

@Injectable()
export class ProductEditPriceDictionaryService {
  private readonly productHttpService = inject(ProductHttpService);
  private readonly activatedRoute = inject(ActivatedRoute);

  // state
  private state = signal<ProductEditPriceDictionaryState>({
    product: {
      id: '',
      name: '',
      description: '',
      productCodeFormula: '',
      inputs: [],
    },
    productCodeHash: '',
    productCodePriceDictionary: {
      productId: '',
      productCodeHash: '',
      prices: {},
    },
    loaded: false,
    error: null,
  });

  // selectors
  product = computed(() => this.state().product);
  productCodePriceDictionary = computed(() => this.state().productCodePriceDictionary);
  productCodeHash = computed(() => this.state().productCodeHash);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

  // sources
  private pageLoaded$ = this.activatedRoute.paramMap.pipe(
    switchMap((params) =>
      forkJoin({
        product: this.productHttpService.getProductById(params.get('productId')!),
        productCodePriceDictionary:
          this.productHttpService.getProductCodePriceDictionaryByProductId(
            params.get('productId')!,
          ),
      }),
    ),
  );
  generateProductCodePriceDictionary$ = new Subject<void>();
  updatePrice$ = new Subject<{ productCode: string; price: number }>();

  constructor() {
    // reducers
    this.pageLoaded$.pipe(takeUntilDestroyed()).subscribe({
      next: (data) => {
        this.state.update((state) => ({
          ...state,
          product: data.product,
          productCodeHash: buildProductCodeHash(data.product),
          productCodePriceDictionary: data.productCodePriceDictionary ?? {
            ...state.productCodePriceDictionary,
            productId: data.product.id,
          },
          loaded: true,
        }));
      },
      error: (err) => this.state.update((state) => ({ ...state, error: err })),
    });

    this.generateProductCodePriceDictionary$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.state.update((state) => {
        const productCodes: string[] = generateProductCodes(state.product);
        const prices: Record<ProductCode, number> = Object.fromEntries(
          productCodes.map((productCode) => [
            productCode,
            state.productCodePriceDictionary?.prices[productCode] ?? 0,
          ]),
        );

        return {
          ...state,
          productCodePriceDictionary: {
            ...state.productCodePriceDictionary,
            productId: state.product.id,
            productCodeHash: buildProductCodeHash(this.state().product),
            prices: prices,
          },
        };
      });
    });

    this.updatePrice$.pipe(takeUntilDestroyed()).subscribe((next) => {
      this.state.update((state) => {
        const updatedPrices: Record<ProductCode, number> = {
          ...state.productCodePriceDictionary.prices,
          [next.productCode]: next.price,
        };

        return {
          ...state,
          productCodePriceDictionary: {
            ...state.productCodePriceDictionary,
            prices: updatedPrices,
          },
        };
      });
    });

    // effects
    effect(() => {
      if (this.loaded()) {
        const dictionary = this.productCodePriceDictionary();

        if (dictionary) {
          this.productHttpService.saveProductCodePriceDictionary(dictionary);
        }
      }
    });
  }
}
