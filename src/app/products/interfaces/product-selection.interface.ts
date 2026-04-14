import { ProductSelectionOption } from './product-selection-option.interface';

export interface ProductSelection {
  id: string;
  name: string;
  allowCustomValue: boolean;
  defaultOptionId: string;
  options: ProductSelectionOption[];
}
