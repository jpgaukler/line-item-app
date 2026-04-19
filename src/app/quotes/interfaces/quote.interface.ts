import { QuoteSystem } from './quote-system.interface';

export interface Quote {
  name: string;
  customerName: string;
  customerEmail: string;
  systems: QuoteSystem[];
  price: number;
}
