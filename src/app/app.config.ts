import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideEnvironmentInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { AuthService, provideAuth0 } from '@auth0/auth0-angular';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAuth0({
      domain: environment.auth0.domain,
      clientId: environment.auth0.clientId,
      authorizationParams: {
        redirect_uri: window.location.origin,
        // audience: environment.auth0.audience,
      },
      // httpInterceptor: {
      //   allowedList: [`${environment.apiBaseUrl}/api/*`],
      // },
      useRefreshTokens: true,
      cacheLocation: 'localstorage',
    }),
    provideEnvironmentInitializer(() => {
      inject(AuthService); // inject AuthService before bootstrap to handle Auth0 redirects
    }),
    // provideHttpClient(withInterceptors([authHttpInterceptorFn])),
  ],
};
