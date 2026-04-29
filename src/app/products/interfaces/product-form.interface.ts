import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ProductSelectionForm } from './product-selection-form.interface';

export interface ProductForm {
  id: FormControl<string>;
  name: FormControl<string>;
  description: FormControl<string>;
  productCodeFormula: FormControl<string>;
  selections: FormArray<FormGroup<ProductSelectionForm>>;
}
