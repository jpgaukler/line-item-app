import { QuoteItemSelection } from './quote-item-selection.interface';

export interface QuoteItem {
  productId: string;
  // productVersion: number;
  // itemNumber: string;
  name: string;
  description: string;
  productCode: string;
  price: number;
  selections: QuoteItemSelection[];
}
