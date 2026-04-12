import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { PreferencesPage } from './preferences/preferences.page';
import { ProductEditPage } from './products/feature/product-edit/product-edit.page';
import { ProductListPage } from './products/feature/product-list/product-list.page';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'products',
        title: 'Products • Cadflair',
        component: ProductListPage,
      },
      {
        path: 'products/:productId',
        title: 'Edit Product • Cadflair',
        component: ProductEditPage,
      },
      {
        path: 'preferences',
        title: 'Preferences • Cadflair',
        component: PreferencesPage,
      },
      // { path: '**', redirectTo: 'home' }, // catch-all for unknown routes, redirect to home
      // { path: '', redirectTo: 'home' }, // redirect to home when the path is empty
    ],
  },
];
