import { ProductInputOption } from './product-input-option.interface';

export interface ProductInput {
  name: string;
  allowCustomValue: boolean;
  defaultOptionIndex: number;
  options: ProductInputOption[];
}
