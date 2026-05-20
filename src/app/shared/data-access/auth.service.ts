import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService as Auth0Service, User } from '@auth0/auth0-angular';
import { Subject, switchMap } from 'rxjs';

interface AuthState {
  isAuthenticated: boolean;
  loaded: boolean;
  user: User | null;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth0Service = inject(Auth0Service);

  // state
  private state = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    loaded: false,
    error: null,
  });

  // sources
  signup$ = new Subject<void>();
  login$ = new Subject<void>();
  logout$ = new Subject<void>();
  isAuthenticated$ = this.auth0Service.isAuthenticated$;
  isLoading$ = this.auth0Service.isLoading$;
  user$ = this.auth0Service.user$;
  error$ = this.auth0Service.error$;

  // selectors
  isAuthenticated = computed(() => this.state().isAuthenticated);
  user = computed(() => this.state().user);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

  constructor() {
    // reducers
    this.isAuthenticated$
      .pipe(takeUntilDestroyed())
      .subscribe((isAuthenticated) =>
        this.state.update((state) => ({ ...state, isAuthenticated })),
      );

    this.isLoading$
      .pipe(takeUntilDestroyed())
      .subscribe((isLoading) => this.state.update((state) => ({ ...state, loaded: !isLoading })));

    this.user$
      .pipe(takeUntilDestroyed())
      .subscribe((user) => this.state.update((state) => ({ ...state, user: user ?? null })));

    this.error$
      .pipe(takeUntilDestroyed())
      .subscribe((error) =>
        this.state.update((state) => ({ ...state, error: error.message ?? 'Auth error' })),
      );

    this.signup$
      .pipe(
        switchMap(() =>
          this.auth0Service.loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } }),
        ),
        takeUntilDestroyed(),
      )
      .subscribe();

    this.login$
      .pipe(
        switchMap(() => this.auth0Service.loginWithRedirect()),
        takeUntilDestroyed(),
      )
      .subscribe();

    this.logout$
      .pipe(
        switchMap(() =>
          this.auth0Service.logout({ logoutParams: { returnTo: window.location.origin } }),
        ),
        takeUntilDestroyed(),
      )
      .subscribe();
  }
}
