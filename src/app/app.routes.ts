import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      // {
      //     path: 'home',
      //     title: 'Home',
      //     component: HomeComponent,
      // },
      // {
      //     path: 'product-groups',
      //     title: 'Product Groups',
      //     component: ProductGroupsComponent,
      // },
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
