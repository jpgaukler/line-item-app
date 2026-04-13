import { computed, inject, Injectable, signal } from '@angular/core';
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
    product: { id: '', name: '', description: '', productCodeDefinition: '', selections: [] },
    loaded: false,
    error: null,
  });

  // selectors
  product = computed(() => this.state().product);
  name = computed(() => this.state().product.name);
  description = computed(() => this.state().product.description);
  productCodeDefinition = computed(() => this.state().product.productCodeDefinition);
  selections = computed(() => this.state().product.selections);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

  // sources
  private loadProduct$ = this.activatedRoute.paramMap.pipe(
    switchMap((params) => this.productHttpService.getProductById(params.get('productId')!)),
  );
  updateName$ = new Subject<string>();
  updateDescription$ = new Subject<string>();
  updateProductCodeDefinition$ = new Subject<string>();

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

    this.updateName$.pipe(takeUntilDestroyed()).subscribe((name: string) =>
      this.state.update((state) => ({
        ...state,
        product: {
          ...state.product,
          name: name,
        },
      })),
    );

    this.updateDescription$.pipe(takeUntilDestroyed()).subscribe((description: string) =>
      this.state.update((state) => ({
        ...state,
        product: {
          ...state.product,
          description: description,
        },
      })),
    );

    this.updateProductCodeDefinition$
      .pipe(takeUntilDestroyed())
      .subscribe((productCodeDefinition: string) =>
        this.state.update((state) => ({
          ...state,
          product: {
            ...state.product,
            productCodeDefinition: productCodeDefinition,
          },
        })),
      );
  }
}
