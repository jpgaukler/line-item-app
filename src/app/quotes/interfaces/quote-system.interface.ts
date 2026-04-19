import { QuoteItem } from './quote-item.interface';

export interface QuoteSystem {
  name: string;
  price: number;
  items: QuoteItem[];
}
