import { ProductSelectionOption } from './product-selection-option.interface';

export interface ProductSelection {
  name: string;
  allowCustomValue: boolean;
  defaultValue: string;
  options: ProductSelectionOption[];
}
