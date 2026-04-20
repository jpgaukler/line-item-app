import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { QuoteItemForm } from './quote-item-form.interface';

export interface QuoteSystemForm {
  name: FormControl<string>;
  price: FormControl<number>;
  items: FormArray<FormGroup<QuoteItemForm>>;
}
