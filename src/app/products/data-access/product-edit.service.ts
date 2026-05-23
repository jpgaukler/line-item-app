import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  applyEach,
  debounce,
  form,
  maxLength,
  min,
  minLength,
  required,
  validate,
} from '@angular/forms/signals';
import { Subject, switchMap } from 'rxjs';
import { ProductHttpService } from '../../shared/data-access/product.http.service';
import { ProductCode } from '../interfaces/product-price-dictionary.interface';
import { Product } from '../interfaces/product.interface';
import {
  buildProductCodeHash,
  generateProductCodes,
  uniqueInArray,
  validateProductCodeFormula,
} from '../utils/product-utils';

interface ProductEditState {
  product: Product;
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
      priceDictionary: {
        productCodeHash: '',
        prices: {},
      },
    },
    loaded: false,
    error: null,
  });

  private form = form(this.state, (form) => {
    const product = form.product;
    debounce(form, 300);

    // product validators
    required(product.name);
    required(product.description);
    required(product.productCodeFormula);
    validate(product.productCodeFormula, (context) => {
      const formula = context.value();

      if (!formula || formula.trim() === '') {
        return null;
      }

      const inputsList = context.valueOf(product.inputs) ?? [];
      const inputNames = inputsList.map((input) => input.name);
      const invalidFields = validateProductCodeFormula(formula, inputNames);

      return invalidFields.length > 0
        ? {
            kind: 'invalidFormula',
            message: `Unknown fields: ${invalidFields.join(', ')}`,
          }
        : null;
    });

    // input validators
    applyEach(product.inputs, (input) => {
      required(input.name, { message: 'Required' });
      minLength(input.name, 1);
      maxLength(input.name, 30);
      uniqueInArray(input.name, product.inputs);

      // option validators
      applyEach(input.options, (option) => {
        required(option.displayText, { message: 'Required' });
        minLength(option.displayText, 1);
        maxLength(option.displayText, 100);
        uniqueInArray(option.displayText, input.options);

        required(option.value, { message: 'Required' });
        minLength(option.value, 1);
        maxLength(option.value, 5);
        uniqueInArray(option.value, input.options);
      });
    });

    // adder validators
    applyEach(product.adders, (adder) => {
      required(adder.name, { message: 'Required' });
      minLength(adder.name, 1);
      maxLength(adder.name, 30);
      uniqueInArray(adder.name, product.adders);

      // option validators
      applyEach(adder.options, (option) => {
        required(option.displayText, { message: 'Required' });
        minLength(option.displayText, 1);
        maxLength(option.displayText, 100);
        uniqueInArray(option.displayText, adder.options);

        required(option.price, { message: 'Required' });
        min(option.price, 0, { message: 'Price cannot be negative' });
      });
    });

    applyEach(product.priceDictionary.prices, (price) => {
      required(price, { message: 'Required' });
      min(price, 0, { message: 'Price cannot be negative' });
    });
  });

  // selectors
  productForm = computed(() => this.form.product);
  product = computed(() => this.state().product);
  priceDictionary = computed(() => this.state().product.priceDictionary);
  isPriceDictionaryOutOfDate = computed(
    () =>
      buildProductCodeHash(this.state().product) !==
      this.state().product.priceDictionary.productCodeHash,
  );
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

  // sources
  loadProduct$ = new Subject<{ productId: string }>();
  generatePriceDictionary$ = new Subject<void>();

  constructor() {
    // reducers
    this.loadProduct$
      .pipe(
        switchMap((next) => this.productHttpService.getProductById(next.productId)),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (data) => {
          this.state.update((state) => ({
            ...state,
            product: data,
            loaded: true,
          }));
        },
        error: (err) => this.state.update((state) => ({ ...state, error: err })),
      });

    this.generatePriceDictionary$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.state.update((state) => {
        const productCodes: string[] = generateProductCodes(state.product);
        const prices: Record<ProductCode, number> = Object.fromEntries(
          productCodes.map((productCode) => [
            productCode,
            state.product.priceDictionary?.prices[productCode] ?? 0,
          ]),
        );

        return {
          ...state,
          product: {
            ...state.product,
            priceDictionary: {
              productCodeHash: buildProductCodeHash(state.product),
              prices: prices,
            },
          },
        };
      });
    });

    // effects
    effect(() => {
      if (!this.loaded()) {
        return;
      }

      const product = this.product();

      if (product) {
        this.productHttpService.updateProduct(product);
      }
    });
  }
}
