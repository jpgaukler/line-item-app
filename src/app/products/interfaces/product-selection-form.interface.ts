import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ProductSelectionOptionForm } from './product-selection-option-form.interface';

export interface ProductSelectionForm {
  name: FormControl<string>;
  allowCustomValue: FormControl<boolean>;
  defaultOptionIndex: FormControl<number>;
  options: FormArray<FormGroup<ProductSelectionOptionForm>>;
}
