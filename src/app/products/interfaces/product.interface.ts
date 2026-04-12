import { ProductSelection } from './product-selection.interface';

export interface Product {
  id: string;
  name: string;
  description: string;
  productCodeDefinition: string;
  selections: ProductSelection[];
}
