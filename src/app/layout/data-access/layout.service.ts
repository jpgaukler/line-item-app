import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { LocalStorageService } from '../../shared/data-access/local-storage.service';

export interface LayoutState {
  sidebarOpen: boolean;
}

const DEFAULT_LAYOUT_STATE: Readonly<LayoutState> = {
  sidebarOpen: false,
};

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private readonly localStorageService = inject(LocalStorageService);

  // state
  private state = signal<LayoutState>(DEFAULT_LAYOUT_STATE);

  // selectors
  sidebarOpen = computed(() => this.state().sidebarOpen);

  // sources
  private loadLayoutState = this.localStorageService.loadLayoutState();
  toggleSidebar$ = new Subject<void>();

  constructor() {
    // reducers
    this.loadLayoutState.pipe(takeUntilDestroyed()).subscribe({
      next: (value) => {
        if (value !== null) {
          this.state.set(value);
        }
      },
    });

    this.toggleSidebar$.pipe(takeUntilDestroyed()).subscribe({
      next: () => {
        this.state.update((state) => ({
          ...state,
          sidebarOpen: !state.sidebarOpen,
        }));

        this.localStorageService.saveLayoutState(this.state());
      },
    });
  }
}
