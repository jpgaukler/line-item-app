import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, Subject } from 'rxjs';
import { LocalStorageService } from '../../shared/data-access/local-storage.service';
import { LayoutBreadcrumb } from '../interfaces/layout-breadcrumb.interface';

type Theme = 'light' | 'dark' | 'system';

interface LayoutState {
  sidebarOpen: boolean;
  showAppInformation: boolean;
  theme: Theme;
  breadcrumbs: LayoutBreadcrumb[];
  loaded: boolean;
  error: string | null;
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
    showAppInformation: false,
    theme: 'system',
    breadcrumbs: [],
    loaded: false,
    error: null,
  });

  // selectors
  sidebarOpen = computed(() => this.state().sidebarOpen);
  showAppInformation = computed(() => this.state().showAppInformation);
  breadcrumbs = computed(() => this.state().breadcrumbs);
  theme = computed(() => this.state().theme);
  loaded = computed(() => this.state().loaded);

  // sources
  private loadState$ = forkJoin({
    sidebarOpen: this.localStorageService.loadJson<boolean>(SIDEBAR_STATE_KEY),
    theme: this.localStorageService.loadString(THEME_STATE_KEY),
  });
  toggleSidebar$ = new Subject<void>();
  toggleAppInformation$ = new Subject<void>();
  setDarkTheme$ = new Subject<void>();
  setLightTheme$ = new Subject<void>();
  setSystemTheme$ = new Subject<void>();
  updateBreadcrumbs$ = new Subject<LayoutBreadcrumb[]>();
  clearBreadcrumbs$ = new Subject<void>();

  constructor() {
    // reducers
    this.loadState$.pipe(takeUntilDestroyed()).subscribe({
      next: (value) =>
        this.state.update((state) => ({
          ...state,
          sidebarOpen: value.sidebarOpen ?? state.sidebarOpen,
          theme: (value.theme as Theme) ?? state.theme,
          loaded: true,
        })),
      error: (err) => this.state.update((state) => ({ ...state, error: err })),
    });

    this.setDarkTheme$.pipe(takeUntilDestroyed()).subscribe({
      next: () => {
        this.state.update((state) => ({
          ...state,
          theme: 'dark',
        }));
      },
    });

    this.setLightTheme$.pipe(takeUntilDestroyed()).subscribe({
      next: () => {
        this.state.update((state) => ({
          ...state,
          theme: 'light',
        }));
      },
    });

    this.setSystemTheme$.pipe(takeUntilDestroyed()).subscribe({
      next: () => {
        this.state.update((state) => ({
          ...state,
          theme: 'system',
        }));
      },
    });

    this.toggleSidebar$.pipe(takeUntilDestroyed()).subscribe({
      next: () => {
        this.state.update((state) => ({
          ...state,
          sidebarOpen: !state.sidebarOpen,
        }));
      },
    });

    this.toggleAppInformation$.pipe(takeUntilDestroyed()).subscribe({
      next: () => {
        this.state.update((state) => ({
          ...state,
          showAppInformation: !state.showAppInformation,
        }));
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

    effect(() => {
      if (this.loaded()) {
        this.localStorageService.setItem(SIDEBAR_STATE_KEY, String(this.sidebarOpen()));
      }
    });

    effect(() => {
      if (this.loaded()) {
        switch (this.theme()) {
          case 'light':
            this.localStorageService.setItem(THEME_STATE_KEY, 'light');
            document.documentElement.classList.remove('dark');
            break;
          case 'dark':
            this.localStorageService.setItem(THEME_STATE_KEY, 'dark');
            document.documentElement.classList.add('dark');
            break;
          case 'system':
            this.localStorageService.removeItem(THEME_STATE_KEY);
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.classList.toggle('dark', prefersDark);
            break;
        }
      }
    });
  }
}
