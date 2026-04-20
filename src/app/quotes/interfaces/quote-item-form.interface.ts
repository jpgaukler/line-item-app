import { FormControl } from '@angular/forms';

export interface QuoteItemForm {
  productId: FormControl<number>;
  productVersion: FormControl<number>;
  itemNumber: FormControl<string>;
  name: FormControl<string>;
  description: FormControl<string>;
  productCode: FormControl<string>;
  price: FormControl<number>;
  // selections: QuoteItemSelection[];
}
