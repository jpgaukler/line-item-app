import { FormControl } from '@angular/forms';

export interface ProductSelectionOptionForm {
  /**
   * This is a unique id generated when constructing the FormGroup, used only for tracking in HTML for loop.
   */
  controlId: FormControl<string>;
  displayText: FormControl<string>;
  value: FormControl<string>;
}
