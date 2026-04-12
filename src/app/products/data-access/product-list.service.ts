import { inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from '../../shared/data-access/local-storage.service';
import { Product } from '../interfaces/product.interface';

interface ProductListState {
  products: Product[];
  loaded: boolean;
  error: string | null;
}

const DEFAULT_PRODUCTS_STATE: Readonly<ProductListState> = {
  products: [],
  loaded: false,
  error: null,
};

@Injectable({
  providedIn: 'root',
})
export class ProductListService {
  private readonly localStorageService = inject(LocalStorageService);

  // state
  private state = signal<ProductListState>(DEFAULT_PRODUCTS_STATE);

  // selectors
  // sidebarOpen = computed(() => this.state().sidebarOpen);

  // sources
  // private loadProductsState = this.localStorageService.loadLayoutState();
  // toggleSidebar$ = new Subject<void>();

  constructor() {
    // reducers
    // this.loadProductsState.pipe(takeUntilDestroyed()).subscribe({
    //   next: (value) => {
    //     if (value !== null) {
    //       this.state.set(value);
    //     }
    //   },
    // });
  }
}
