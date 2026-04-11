import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { LocalStorageService } from '../../shared/data-access/local-storage.service';
import { LayoutBreadcrumb } from '../interfaces/layout-breadcrumb.interface';

interface LayoutState {
  sidebarOpen: boolean;
  breadcrumbs: LayoutBreadcrumb[];
}

const DEFAULT_LAYOUT_STATE: Readonly<LayoutState> = {
  sidebarOpen: false,
  breadcrumbs: [],
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
  breadcrumbs = computed(() => this.state().breadcrumbs);

  // sources
  private loadSidebarState = this.localStorageService.loadSidebarState();
  toggleSidebar$ = new Subject<void>();
  updateBreadcrumbs$ = new Subject<LayoutBreadcrumb[]>();

  constructor() {
    // reducers
    this.loadSidebarState.pipe(takeUntilDestroyed()).subscribe({
      next: (value) => {
        if (value !== null) {
          this.state.update((state) => ({
            ...state,
            sidebarOpen: value,
          }));
        }
      },
    });

    this.toggleSidebar$.pipe(takeUntilDestroyed()).subscribe({
      next: () => {
        this.state.update((state) => ({
          ...state,
          sidebarOpen: !state.sidebarOpen,
        }));

        this.localStorageService.saveSidebarState(this.sidebarOpen());
      },
    });

    this.updateBreadcrumbs$.pipe(takeUntilDestroyed()).subscribe({
      next: (value) => {
        this.state.update((state) => ({
          ...state,
          breadcrumbs: value,
        }));
      },
    });
  }
}
