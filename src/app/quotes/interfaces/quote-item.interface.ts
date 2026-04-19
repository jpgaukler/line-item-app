import { QuoteItemSelection } from './quote-item-selection.interface';

export interface QuoteItem {
  productId: number;
  productVersion: number;
  itemNumber: string;
  name: string;
  description: string;
  productCode: string;
  price: number;
  selections: QuoteItemSelection[];
}
