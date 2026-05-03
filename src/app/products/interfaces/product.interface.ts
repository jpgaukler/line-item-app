import { ProductInput } from './product-input.interface';

export interface Product {
  id: string;
  name: string;
  description: string;
  productCodeFormula: string;
  inputs: ProductInput[];
}

export const MAX_PRODUCT_NAME_LENGTH = 30;
export const MAX_PRODUCT_DESCRIPTION_LENGTH = 200;
