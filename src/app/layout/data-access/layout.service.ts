import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { LocalStorageService } from '../../shared/data-access/local-storage.service';
import { LayoutBreadcrumb } from '../interfaces/layout-breadcrumb.interface';

interface LayoutState {
  sidebarOpen: boolean;
  breadcrumbs: LayoutBreadcrumb[];
}

const SIDEBAR_STATE_KEY = 'sidebar-open';
const THEME_STATE_KEY = 'theme';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private readonly localStorageService = inject(LocalStorageService);

  // state
  private state = signal<LayoutState>({
    sidebarOpen: false,
    breadcrumbs: [],
  });

  // selectors
  sidebarOpen = computed(() => this.state().sidebarOpen);
  breadcrumbs = computed(() => this.state().breadcrumbs);

  // sources
  private loadSidebarState$ = this.localStorageService.loadItem<boolean>(SIDEBAR_STATE_KEY);
  toggleSidebar$ = new Subject<void>();
  setDarkTheme$ = new Subject<void>();
  setLightTheme$ = new Subject<void>();
  setSystemTheme$ = new Subject<void>();
  updateBreadcrumbs$ = new Subject<LayoutBreadcrumb[]>();
  clearBreadcrumbs$ = new Subject<void>();

  constructor() {
    // reducers
    this.setDarkTheme$.pipe(takeUntilDestroyed()).subscribe({
      next: () => {
        document.documentElement.classList.add('dark');
        this.localStorageService.setItem(THEME_STATE_KEY, 'dark');
      },
    });

    this.setLightTheme$.pipe(takeUntilDestroyed()).subscribe({
      next: () => {
        document.documentElement.classList.remove('dark');
        this.localStorageService.setItem(THEME_STATE_KEY, 'light');
      },
    });

    this.setSystemTheme$.pipe(takeUntilDestroyed()).subscribe({
      next: () => {
        this.localStorageService.removeItem(THEME_STATE_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);
      },
    });

    this.loadSidebarState$.pipe(takeUntilDestroyed()).subscribe({
      next: (isOpen) => {
        if (isOpen !== null) {
          this.state.update((state) => ({
            ...state,
            sidebarOpen: isOpen === true,
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

        this.localStorageService.setItem(SIDEBAR_STATE_KEY, String(this.sidebarOpen()));
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

    this.clearBreadcrumbs$.pipe(takeUntilDestroyed()).subscribe({
      next: () => {
        this.state.update((state) => ({
          ...state,
          breadcrumbs: [],
        }));
      },
    });
  }
}
