import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { QuoteSystemForm } from './quote-system-form.interface';

export interface QuoteForm {
  name: FormControl<string>;
  customerName: FormControl<string>;
  customerEmail: FormControl<string>;
  price: FormControl<number>;
  systems: FormArray<FormGroup<QuoteSystemForm>>;
}
