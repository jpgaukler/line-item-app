import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { ProductsComponent } from './products/products.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      // {
      //     path: 'quotes',
      //     title: 'Quotes',
      //     component: HomeComponent,
      // },
      {
        path: 'products',
        title: 'Products • Cadflair',
        component: ProductsComponent,
      },
      // {
      //     path: 'product-groups/:id',
      //     title: 'Product Groups',
      //     component: ProductGroupsComponent,
      // },
      // {
      //     path: 'product-definition',
      //     title: 'Product Definition',
      //     component: ProductDefinitionComponent,
      // },
      // { path: '**', redirectTo: 'home' }, // catch-all for unknown routes, redirect to home
      // { path: '', redirectTo: 'home' }, // redirect to home when the path is empty
    ],
  },
];
