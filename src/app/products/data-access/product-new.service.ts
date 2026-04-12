import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { LocalStorageService } from '../../shared/data-access/local-storage.service';
import { Product } from '../interfaces/product.interface';

interface ProductNewState {
  product: Product;
  loaded: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ProductNewService {
  private readonly localStorageService = inject(LocalStorageService);

  // state
  private state = signal<ProductNewState>({
    product: { id: '', name: '', description: '', productCodeDefinition: '', selections: [] },
    loaded: false,
    error: null,
  });

  // selectors
  name = computed(() => this.state().product.name);
  description = computed(() => this.state().product.description);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

  // sources
  updateName$ = new Subject<string>();
  updateDescription$ = new Subject<string>();
  submitProduct$ = new Subject<void>();

  constructor() {
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
  }
}
