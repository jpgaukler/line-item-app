import { ProductSelectionOption } from './product-selection-option.interface';

export interface ProductSelection {
  name: string;
  options: ProductSelectionOption[];
  defaultValue: string;
  allowCustomValue: boolean;
}
