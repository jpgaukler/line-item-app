import { ProductSelection } from './product-selection.interface';

export interface Product {
  name: string;
  description: string;
  productCodeDefinition: string;
  selections: ProductSelection[];
}
