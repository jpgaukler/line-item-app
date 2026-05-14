import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Subject, switchMap } from 'rxjs';
import { ProductHttpService } from '../../shared/data-access/product.http.service';
import { Product } from '../interfaces/product.interface';

interface ProductEditState {
  product: Product;
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
    loaded: false,
    error: null,
  });

  // selectors
  product = computed(() => this.state().product);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

  // sources
  private loadProduct$ = this.activatedRoute.paramMap.pipe(
    switchMap((params) => this.productHttpService.getProductById(params.get('productId')!)),
  );
  updateProduct$ = new Subject<Product>();

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

    // effects
    effect(() => {
      if (this.loaded()) {
        this.productHttpService.saveProduct(this.product());
      }
    });
  }
}
