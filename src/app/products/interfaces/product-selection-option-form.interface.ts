import { FormControl } from '@angular/forms';

export interface ProductSelectionOptionForm {
  id: FormControl<string>;
  displayText: FormControl<string>;
  value: FormControl<string>;
}
