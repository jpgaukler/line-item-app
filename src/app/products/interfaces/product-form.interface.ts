import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ProductInputForm } from './product-input-form.interface';

export interface ProductForm {
  id: FormControl<string>;
  name: FormControl<string>;
  description: FormControl<string>;
  productCodeFormula: FormControl<string>;
  inputs: FormArray<FormGroup<ProductInputForm>>;
}
