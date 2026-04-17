import { FormControl } from '@angular/forms';

export interface ProductSelectionOptionForm {
  displayText: FormControl<string>;
  value: FormControl<string>;
}
