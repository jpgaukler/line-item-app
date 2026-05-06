import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Subject, switchMap } from 'rxjs';
import { ProductHttpService } from '../../shared/data-access/product.http.service';
import { ProductCodePriceDictionary } from '../interfaces/product-code-price-dictionary';
import { Product } from '../interfaces/product.interface';
import { buildProductsInputsHash, generateProductCodes } from '../utils/product-utils';

interface ProductEditState {
  product: Product;
  productCodePriceDictionary: ProductCodePriceDictionary;
  loaded: boolean;
  error: string | null;
}

@Injectable()
export class ProductEditService {
  private readonly productHttpService = inject(ProductHttpService);
  private readonly activatedRoute = inject(ActivatedRoute);

  // state
  private state = signal<ProductEditState>({
    product: {
      id: '',
      name: '',
      description: '',
      productCodeFormula: '',
      inputs: [],
    },
    productCodePriceDictionary: {
      productInputsHash: '',
      prices: {},
    },
    loaded: false,
    error: null,
  });

  // selectors
  product = computed(() => this.state().product);
  productCodePriceDictionary = computed(() =>
    Object.entries(this.state().productCodePriceDictionary.prices).map(([productCode, price]) => ({
      productCode,
      price,
    })),
  );
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

  // sources
  private loadProduct$ = this.activatedRoute.paramMap.pipe(
    switchMap((params) => this.productHttpService.getProductById(params.get('productId')!)),
  );
  updateProduct$ = new Subject<Product>();
  generateProductCodePriceDictionary$ = new Subject<void>();

  constructor() {
    // reducers
    this.loadProduct$.pipe(takeUntilDestroyed()).subscribe({
      next: (product: Product) => {
        this.state.update((state) => ({
          ...state,
          product: product,
          loaded: true,
        }));
      },
      error: (err) => this.state.update((state) => ({ ...state, error: err })),
    });

    this.updateProduct$.pipe(takeUntilDestroyed()).subscribe((next) => {
      this.state.update((state) => ({ ...state, product: next }));
    });

    this.generateProductCodePriceDictionary$.pipe(takeUntilDestroyed()).subscribe(async () => {
      const currentState = this.state();
      const inputsHash = await buildProductsInputsHash(currentState.product.inputs);
      const productCodes = generateProductCodes(currentState.product);
      const prices = Object.fromEntries(
        productCodes.map((productCode) => [
          productCode,
          currentState.productCodePriceDictionary.prices[productCode] ?? 0,
        ]),
      );

      this.state.update((state) => ({
        ...state,
        productCodePriceDictionary: {
          productInputsHash: inputsHash,
          prices: prices,
        },
      }));
    });

    // effects
    effect(() => {
      if (this.loaded()) {
        this.productHttpService.saveProduct(this.product());
      }
    });
  }
}
