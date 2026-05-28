import { QuoteItemAdder } from './quote-item-adder.interface';
import { QuoteItemInput } from './quote-item-input.interface';

/** Key format for tracking the state of items on a quote. This matches the format of cryto.randomUUID() */
export type QuoteItemKey = `${string}-${string}-${string}-${string}-${string}`;

export interface QuoteItem {
  productId: string;
  // productVersion: number;
  // itemNumber: string;
  name: string;
  description: string;
  productCode: string;
  basePrice: number;
  quantity: number;
  inputs: QuoteItemInput[];
  adders: QuoteItemAdder[];
}
