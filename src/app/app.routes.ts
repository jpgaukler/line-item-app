import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { ProductsComponent } from './products/products.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'products',
        title: 'Products • Cadflair',
        component: ProductsComponent,
      },
      {
        path: 'preferences',
        title: 'Preferences • Cadflair',
        component: PreferencesComponent,
      },
      // { path: '**', redirectTo: 'home' }, // catch-all for unknown routes, redirect to home
      // { path: '', redirectTo: 'home' }, // redirect to home when the path is empty
    ],
  },
];
