import { ProductAdderOption } from './product-adder-option.interface';

export interface ProductAdder {
  name: string;
  allowCustomOption: boolean;
  defaultOptionIndex: number;
  options: ProductAdderOption[];
}
