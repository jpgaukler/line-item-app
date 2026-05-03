import { CommonModule } from '@angular/common';
import { Component, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductInputOption } from '../../../products/interfaces/product-input-option.interface';
import { ProductInput } from '../../../products/interfaces/product-input.interface';
import { QuoteItemInput } from '../../interfaces/quote-item-input.interface';
import { QuoteItemInputCustomComponent } from '../quote-item-input-custom/quote-item-input-custom.component';
import { QuoteItemInputDropdownComponent } from '../quote-item-input-dropdown/quote-item-input-dropdown.component';

@Component({
  selector: 'app-quote-item-input',
  imports: [
    CommonModule,
    FormsModule,
    QuoteItemInputCustomComponent,
    QuoteItemInputDropdownComponent,
  ],
  templateUrl: './quote-item-input.component.html',
})
export class QuoteItemInputComponent {
  productInput = input.required<ProductInput>();
  quoteItemInput = model.required<QuoteItemInput>();
  showCustom = signal<boolean>(false);
  customDisplayText = signal<string>('');
  customValue = signal<string>('');

  selectedOptionChange(option: ProductInputOption) {
    this.quoteItemInput.update((inputs) => ({
      ...inputs,
      isCustomValue: false,
      displayText: option.displayText,
      value: option.value,
    }));
  }

  showCustomClick() {
    this.customDisplayText.set(this.quoteItemInput().displayText);
    this.customValue.set(this.quoteItemInput().value);
    this.showCustom.set(true);
  }

  saveCustomClick() {
    this.quoteItemInput.update((input) => {
      const displayText = this.customDisplayText();
      const value = this.customValue();
      const existingOption = this.productInput().options.find((i) => i.value === value);

      return {
        ...input,
        isCustomValue: existingOption === undefined,
        displayText: displayText,
        value: value,
      };
    });

    this.showCustom.set(false);
  }

  cancelCustomClick() {
    this.showCustom.set(false);
  }
}
