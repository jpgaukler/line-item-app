import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ProductSelectionOptionForm } from './product-selection-option-form.interface';

export interface ProductSelectionForm {
  /**
   * This is a unique id generated when constructing the FormGroup, used only for tracking in HTML for loop.
   */
  controlId: FormControl<string>;
  name: FormControl<string>;
  allowCustomValue: FormControl<boolean>;
  defaultOptionIndex: FormControl<number>;
  options: FormArray<FormGroup<ProductSelectionOptionForm>>;
}
