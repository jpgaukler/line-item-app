import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap } from 'rxjs';
import { ProductHttpService } from '../../shared/data-access/product.http.service';
import { ProductAdder } from '../interfaces/product-adder.interface';
import { Product } from '../interfaces/product.interface';

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
    },
    loaded: false,
    error: null,
  });

  // selectors
  product = computed(() => this.state().product);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

  // sources
  loadProduct$ = new Subject<{ productId: string }>();
  updateProduct$ = new Subject<Product>();
  updateAdder$ = new Subject<{ index: number; adder: ProductAdder }>();

  constructor() {
    // reducers
    this.loadProduct$
      .pipe(
        switchMap((next) => this.productHttpService.getProductById(next.productId)),
        takeUntilDestroyed(),
      )
      .subscribe({
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

    // effects
    effect(() => {
      if (this.loaded()) {
        this.productHttpService.saveProduct(this.product());
      }
    });
  }
}
