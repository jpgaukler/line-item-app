import { ProductInputOption } from './product-input-option.interface';

export interface ProductInput {
  name: string;
  allowCustomOption: boolean;
  defaultOptionIndex: number;
  options: ProductInputOption[];
}
