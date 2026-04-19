import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Product } from '../../products/interfaces/product.interface';
import { ProductHttpService } from '../../shared/data-access/product.http.service';
import { Quote } from '../interfaces/quote.interface';

interface QuoteNewState {
  products: Product[];
  quote: Quote;
  loaded: boolean;
  error: string | null;
}

@Injectable()
export class QuoteNewService {
  private readonly productHttpService = inject(ProductHttpService);

  // state
  private state = signal<QuoteNewState>({
    products: [],
    quote: {
      name: '',
      customerName: '',
      customerEmail: '',
      systems: [],
      price: 0,
    },
    loaded: false,
    error: null,
  });

  // selectors
  products = computed(() => this.state().products.sort((a, b) => a.name.localeCompare(b.name)));
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

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
  }
}
