import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QuoteForm } from '../interfaces/quote-form.interface';
import { QuoteItemForm } from '../interfaces/quote-item-form.interface';
import { QuoteItem } from '../interfaces/quote-item.interface';
import { QuoteSystemForm } from '../interfaces/quote-system-form.interface';
import { QuoteSystem } from '../interfaces/quote-system.interface';
import { Quote } from '../interfaces/quote.interface';

@Injectable()
export class QuoteFormService {
  private readonly formBuilder = inject(FormBuilder);

  toQuoteForm(quote: Quote): FormGroup<QuoteForm> {
    return this.formBuilder.nonNullable.group({
      name: [quote.name],
      customerName: [quote.customerName, [Validators.required]],
      customerEmail: [quote.customerEmail, [Validators.required, Validators.email]],
      price: [quote.price],
      systems: this.formBuilder.array(
        quote.systems.map((system) => this.toQuoteSystemForm(system)),
      ),
    });
  }

  toQuoteSystemForm(system: QuoteSystem): FormGroup<QuoteSystemForm> {
    return this.formBuilder.nonNullable.group({
      name: [system.name],
      price: [system.price],
      items: this.formBuilder.array(system.items.map((item) => this.toQuoteItemForm(item))),
    });
  }

  toQuoteItemForm(item: QuoteItem): FormGroup<QuoteItemForm> {
    return this.formBuilder.nonNullable.group({
      productId: [item.productId],
      productVersion: [item.productVersion],
      itemNumber: [item.itemNumber],
      name: [item.name],
      description: [item.description],
      productCode: [item.productCode],
      price: [item.price],
    });
  }
}
