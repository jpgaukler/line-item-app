import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { PreferencesPage } from './preferences/preferences.page';
import { ProfileEditComponent } from './profile/feature/profile-edit/profile-edit.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'products',
        loadChildren: () => import('./products/products.routes').then((i) => i.PRODUCT_ROUTES),
      },
      {
        path: 'quotes',
        loadChildren: () => import('./quotes/quotes.routes').then((i) => i.QUOTE_ROUTES),
      },
      {
        path: 'preferences',
        title: 'Preferences • Line-Item',
        component: PreferencesPage,
      },
      {
        path: 'profile',
        title: 'Profile • Line-Item',
        component: ProfileEditComponent,
      },

      // { path: '**', redirectTo: 'home' }, // catch-all for unknown routes, redirect to home
      // { path: '', redirectTo: 'home' }, // redirect to home when the path is empty
    ],
  },
];
