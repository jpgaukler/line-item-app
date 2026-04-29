import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { PreferencesPage } from './preferences/preferences.page';
import { ProductEditPage } from './products/feature/product-edit/product-edit.page';
import { ProductListPage } from './products/feature/product-list/product-list.page';
import { ProductNewPage } from './products/feature/product-new/product-new.page';
import { QuoteNewPage } from './quotes/feature/quote-new/quote-new.page';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      // products
      {
        path: 'products',
        title: 'Products • Line-Item',
        component: ProductListPage,
      },
      {
        path: 'products/new',
        title: 'New Product • Line-Item',
        component: ProductNewPage,
      },
      {
        path: 'products/:productId',
        title: 'Edit Product • Line-Item',
        component: ProductEditPage,
      },

      // quotes
      {
        path: 'quotes/new',
        title: 'New Quote • Line-Item',
        component: QuoteNewPage,
      },

      // preferences
      {
        path: 'preferences',
        title: 'Preferences • Line-Item',
        component: PreferencesPage,
      },

      // { path: '**', redirectTo: 'home' }, // catch-all for unknown routes, redirect to home
      // { path: '', redirectTo: 'home' }, // redirect to home when the path is empty
    ],
  },
];
