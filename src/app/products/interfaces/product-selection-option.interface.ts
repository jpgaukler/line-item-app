import { ProductSelection } from './product-selection.interface';

export interface ProductSelectionOption {
  value: string;
  displayText: string;
}

export type AddProductSelectionOption = ProductSelection['name'];
