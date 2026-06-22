import { Routes } from '@angular/router';
import { QuoteNewPage } from './feature/quote-new/quote-new.page';

export const QUOTE_ROUTES: Routes = [
  {
    path: 'new',
    title: 'New Quote • Line-Item',
    component: QuoteNewPage,
  },
];
