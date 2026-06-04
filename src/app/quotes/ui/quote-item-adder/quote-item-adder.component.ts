import { Component, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductAdderOption } from '../../../products/interfaces/product-adder-option.interface';
import { ProductAdder } from '../../../products/interfaces/product-adder.interface';
import { QuoteItemAdder } from '../../interfaces/quote-item-adder.interface';
import { QuoteItemAdderCustomComponent } from '../quote-item-adder-custom/quote-item-adder-custom.component';
import { QuoteItemAdderDropdownComponent } from '../quote-item-adder-dropdown/quote-item-adder-dropdown.component';

@Component({
  selector: 'app-quote-item-adder',
  imports: [FormsModule, QuoteItemAdderDropdownComponent, QuoteItemAdderCustomComponent],
  templateUrl: './quote-item-adder.component.html',
})
export class QuoteItemAdderComponent {
  productAdder = input.required<ProductAdder>();
  quoteItemAdder = model.required<QuoteItemAdder>();
  showCustom = signal<boolean>(false);
  customDisplayText = signal<string>('');
  customPrice = signal<number>(0);

  selectedOptionChange(option: ProductAdderOption) {
    this.quoteItemAdder.update((inputs) => ({
      ...inputs,
      displayText: option.displayText,
      price: option.price,
    }));
  }

  showCustomClick() {
    this.customDisplayText.set(this.quoteItemAdder().displayText);
    this.customPrice.set(this.quoteItemAdder().price);
    this.showCustom.set(true);
  }

  saveCustomClick() {
    this.quoteItemAdder.update((input) => ({
      ...input,
      displayText: this.customDisplayText(),
      price: this.customPrice(),
    }));

    this.showCustom.set(false);
  }

  cancelCustomClick() {
    this.showCustom.set(false);
  }
}
