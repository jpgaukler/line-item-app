import { Routes } from '@angular/router';
import { ProductEditAddersPage } from './feature/product-edit-adders/product-edit-adders.page';
import { ProductEditPriceDictionaryPage } from './feature/product-edit-price-dictionary/product-edit-price-dictionary.page';
import { ProductEditPage } from './feature/product-edit/product-edit.page';
import { ProductListPage } from './feature/product-list/product-list.page';
import { ProductNewPage } from './feature/product-new/product-new.page';

export const PRODUCT_ROUTES: Routes = [
  {
    path: '',
    title: 'Products • Line-Item',
    component: ProductListPage,
  },
  {
    path: 'new',
    title: 'New Product • Line-Item',
    component: ProductNewPage,
  },
  {
    path: ':productId/edit',
    title: 'Edit Product • Line-Item',
    component: ProductEditPage,
  },
  {
    path: ':productId/edit/adders',
    title: 'Edit Product Adders• Line-Item',
    component: ProductEditAddersPage,
  },
  {
    path: ':productId/edit/prices',
    title: 'Edit Product • Line-Item',
    component: ProductEditPriceDictionaryPage,
  },
];
