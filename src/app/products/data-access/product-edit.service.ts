import { moveItemInArray } from '@angular/cdk/drag-drop';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, forkJoin, Subject, switchMap } from 'rxjs';
import { ProductHttpService } from '../../shared/data-access/product.http.service';
import { ProductAdder } from '../interfaces/product-adder.interface';
import { ProductCode, ProductPriceDictionary } from '../interfaces/product-code-price-dictionary';
import { Product } from '../interfaces/product.interface';
import { buildProductCodeHash, generateProductCodes } from '../utils/product-utils';

interface ProductEditState {
  product: Product;
  priceDictionary: ProductPriceDictionary;
  loaded: boolean;
  error: string | null;
}

@Injectable()
export class ProductEditService {
  private readonly productHttpService = inject(ProductHttpService);

  // state
  private state = signal<ProductEditState>({
    product: {
      id: '',
      name: '',
      description: '',
      productCodeFormula: '',
      inputs: [],
      adders: [],
    },
    priceDictionary: {
      productId: '',
      productCodeHash: '',
      prices: {},
    },
    loaded: false,
    error: null,
  });

  // selectors
  product = computed(() => this.state().product);
  priceDictionary = computed(() => this.state().priceDictionary);
  productCodeHash = computed(() => buildProductCodeHash(this.state().product));
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

  // sources
  loadProduct$ = new Subject<{ productId: string }>();
  updateProduct$ = new Subject<Product>();
  generatePriceDictionary$ = new Subject<void>();
  updatePrice$ = new Subject<{ productCode: string; price: number }>();

  createAdder$ = new Subject<void>();
  updateAdder$ = new Subject<{ index: number; adder: ProductAdder }>();
  reorderAdder$ = new Subject<{ previousIndex: number; currentIndex: number }>();
  removeAdder$ = new Subject<{ index: number }>();

  constructor() {
    // reducers
    this.loadProduct$
      .pipe(
        switchMap((next) =>
          forkJoin({
            product: this.productHttpService.getProductById(next.productId),
            priceDictionary: this.productHttpService.getPriceDictionaryByProductId(next.productId),
          }),
        ),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (data) => {
          this.state.update((state) => ({
            ...state,
            product: data.product,
            priceDictionary: data.priceDictionary ?? {
              ...state.priceDictionary,
              productId: data.product.id,
            },
            loaded: true,
          }));
        },
        error: (err) => this.state.update((state) => ({ ...state, error: err })),
      });

    this.updateProduct$.pipe(takeUntilDestroyed()).subscribe((next) => {
      this.state.update((state) => ({ ...state, product: next }));
    });

    this.generatePriceDictionary$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.state.update((state) => {
        const productCodes: string[] = generateProductCodes(state.product);
        const prices: Record<ProductCode, number> = Object.fromEntries(
          productCodes.map((productCode) => [
            productCode,
            state.priceDictionary?.prices[productCode] ?? 0,
          ]),
        );

        return {
          ...state,
          priceDictionary: {
            ...state.priceDictionary,
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
          ...state.priceDictionary.prices,
          [next.productCode]: next.price,
        };

        return {
          ...state,
          priceDictionary: {
            ...state.priceDictionary,
            prices: updatedPrices,
          },
        };
      });
    });

    this.createAdder$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.state.update((state) => ({
        ...state,
        product: {
          ...state.product,
          adders: [
            ...state.product.adders,
            {
              name: `Adder (${state.product.adders.length + 1})`,
              defaultOptionIndex: 0,
              allowCustomValue: false,
              options: [
                {
                  displayText: 'Option 1',
                  price: 0,
                },
              ],
            },
          ],
        },
      }));
    });

    this.updateAdder$.pipe(takeUntilDestroyed()).subscribe((next) => {
      this.state.update((state) => ({
        ...state,
        product: {
          ...state.product,
          adders: state.product.adders.map((adder, index) =>
            index === next.index ? next.adder : adder,
          ),
        },
      }));
    });

    this.reorderAdder$
      .pipe(
        filter((next) => next.previousIndex !== next.currentIndex),
        takeUntilDestroyed(),
      )
      .subscribe((next) => {
        this.state.update((state) => {
          const updatedAdders = [...state.product.adders];
          moveItemInArray(updatedAdders, next.previousIndex, next.currentIndex);

          return {
            ...state,
            product: {
              ...state.product,
              adders: updatedAdders,
            },
          };
        });
      });

    this.removeAdder$.pipe(takeUntilDestroyed()).subscribe((next) => {
      this.state.update((state) => ({
        ...state,
        product: {
          ...state.product,
          adders: state.product.adders.filter((_, index) => index !== next.index),
        },
      }));
    });

    // effects
    effect(() => {
      if (!this.loaded()) {
        return;
      }

      const dictionary = this.priceDictionary();
      const product = this.product();

      if (product) {
        this.productHttpService.saveProduct(product);
      }

      if (dictionary) {
        this.productHttpService.savePriceDictionary(dictionary);
      }
    });
  }
}
