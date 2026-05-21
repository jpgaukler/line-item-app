import { ProductAdderOption } from './product-adder-option.interface';

export interface ProductAdder {
  name: string;
  allowCustomValue: boolean;
  defaultOptionIndex: number;
  options: ProductAdderOption[];
}
