import { ProductAdder } from './product-adder.interface';
import { ProductInput } from './product-input.interface';
import { ProductPriceDictionary } from './product-price-dictionary.interface';

export interface Product {
  id: string;
  name: string;
  description: string;
  productCodeFormula: string;
  inputs: ProductInput[];
  adders: ProductAdder[];
  priceDictionary: ProductPriceDictionary;
}

export type NewProduct = Pick<Product, 'name' | 'description'>;

export const MAX_PRODUCT_NAME_LENGTH = 30;
export const MAX_PRODUCT_DESCRIPTION_LENGTH = 200;
