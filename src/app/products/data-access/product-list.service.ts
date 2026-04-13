import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { ProductHttpService } from '../../shared/data-access/product.http.service';
import { AddProduct, Product } from '../interfaces/product.interface';

interface ProductListState {
  products: Product[];
  loaded: boolean;
  error: string | null;
}

@Injectable()
export class ProductListService {
  private readonly productHttpService = inject(ProductHttpService);

  // state
  private state = signal<ProductListState>({
    products: [],
    loaded: false,
    error: null,
  });

  // selectors
  products = computed(() => this.state().products.sort((a, b) => a.name.localeCompare(b.name)));
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

  addProduct$ = new Subject<AddProduct>();
  deleteProduct$ = new Subject<Product>();

  // sources
  private productsLoaded$ = this.productHttpService.getProducts();

  constructor() {
    // reducers
    this.productsLoaded$.pipe(takeUntilDestroyed()).subscribe({
      next: (products: Product[]) =>
        this.state.update((state) => ({
          ...state,
          products: products,
          loaded: true,
        })),
      error: (err) => this.state.update((state) => ({ ...state, error: err })),
    });

    this.addProduct$.pipe(takeUntilDestroyed()).subscribe((added: AddProduct) =>
      this.state.update((state) => ({
        ...state,
        products: [
          ...state.products,
          { ...added, id: crypto.randomUUID(), productCodeDefinition: '', selections: [] },
        ],
      })),
    );

    this.deleteProduct$.pipe(takeUntilDestroyed()).subscribe((deleted: Product) =>
      this.state.update((state) => ({
        ...state,
        products: state.products.filter((product) => product.id !== deleted.id),
      })),
    );

    // effects
    effect(() => {
      if (this.loaded()) {
        this.productHttpService.saveProducts(this.products());
      }
    });
  }
}
