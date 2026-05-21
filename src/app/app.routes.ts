import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { PreferencesPage } from './preferences/preferences.page';
import { ProductEditAddersPage } from './products/feature/product-edit-adders/product-edit-adders.page';
import { ProductEditPriceDictionaryPage } from './products/feature/product-edit-price-dictionary/product-edit-price-dictionary.page';
import { ProductEditPage } from './products/feature/product-edit/product-edit.page';
import { ProductListPage } from './products/feature/product-list/product-list.page';
import { ProductNewPage } from './products/feature/product-new/product-new.page';
import { ProfileEditComponent } from './profile/feature/profile-edit/profile-edit.component';
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
        path: 'products/:productId/edit',
        title: 'Edit Product • Line-Item',
        component: ProductEditPage,
      },
      {
        path: 'products/:productId/edit/adders',
        title: 'Edit Product Adders• Line-Item',
        component: ProductEditAddersPage,
      },
      {
        path: 'products/:productId/edit/prices',
        title: 'Edit Product • Line-Item',
        component: ProductEditPriceDictionaryPage,
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

      // profile
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
