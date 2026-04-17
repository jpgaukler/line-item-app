import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ProductSelectionOptionForm } from './product-selection-option-form.interface';

export interface ProductSelectionForm {
  name: FormControl<string>;
  allowCustomValue: FormControl<boolean>;
  defaultValue: FormControl<string>;
  options: FormArray<FormGroup<ProductSelectionOptionForm>>;
}
