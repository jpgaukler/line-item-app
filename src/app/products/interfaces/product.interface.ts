import { ProductSelection } from './product-selection.interface';

export interface Product {
  id: string;
  name: string;
  description: string;
  productCodeFormula: string;
  selections: ProductSelection[];
}

export const MAX_PRODUCT_NAME_LENGTH = 30;
export const MAX_PRODUCT_DESCRIPTION_LENGTH = 200;
