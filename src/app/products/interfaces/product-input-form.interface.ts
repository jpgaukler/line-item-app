import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ProductInputOptionForm } from './product-input-option-form.interface';

export interface ProductInputForm {
  /**
   * This is a unique id generated when constructing the FormGroup, used only for tracking in HTML for loop.
   */
  controlId: FormControl<string>;
  name: FormControl<string>;
  allowCustomValue: FormControl<boolean>;
  defaultOptionIndex: FormControl<number>;
  options: FormArray<FormGroup<ProductInputOptionForm>>;
}
