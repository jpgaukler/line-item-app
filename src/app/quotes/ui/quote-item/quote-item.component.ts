import { CommonModule } from '@angular/common';
import { Component, input, model, output, signal } from '@angular/core';
import { ProductAdder } from '../../../products/interfaces/product-adder.interface';
import { Product } from '../../../products/interfaces/product.interface';
import { calculateProductCode } from '../../../products/utils/product-utils';
import { ButtonDirective } from '../../../shared/ui/button-primary.directive';
import { IconDragHandleComponent } from '../../../shared/ui/icons/icon-drag-handle.component';
import { QuoteItemAdder } from '../../interfaces/quote-item-adder.interface';
import { QuoteItemInput } from '../../interfaces/quote-item-input.interface';
import { QuoteItem } from '../../interfaces/quote-item.interface';
import { QuoteItemAdderComponent } from '../quote-item-adder/quote-item-adder.component';
import { QuoteItemInputComponent } from '../quote-item-input/quote-item-input.component';
import { QuoteItemQuantityComponent } from '../quote-item-quantity/quote-item-quantity.component';

@Component({
  selector: 'app-quote-item',
  imports: [
    CommonModule,
    ButtonDirective,
    IconDragHandleComponent,
    QuoteItemInputComponent,
    QuoteItemAdderComponent,
    QuoteItemQuantityComponent,
  ],
  templateUrl: './quote-item.component.html',
})
export class QuoteItemComponent {
  systemIndex = input.required<number>();
  itemIndex = input.required<number>();
  item = model.required<QuoteItem>();
  product = model.required<Product>();
  deleteClick = output();
  showAdders = signal<boolean>(false);

  inputChange(updatedInput: QuoteItemInput): void {
    this.item.update((item) => {
      const updatedInputs = item.inputs.map((input) =>
        input.name === updatedInput.name ? updatedInput : input,
      );

      return {
        ...item,
        productCode: calculateProductCode(
          this.product(),
          Object.fromEntries(updatedInputs.map((input) => [input.name, input.value])),
        ),
        inputs: updatedInputs,
      };
    });
  }

  quantityChange(newQuantity: number): void {
    this.item.update((item) => ({
      ...item,
      quantity: newQuantity,
    }));
  }

  insertAdder(productAdder: ProductAdder): void {
    this.item.update((item) => ({
      ...item,
      adders: [
        ...item.adders,
        {
          name: productAdder.name,
          displayText: productAdder.options[productAdder.defaultOptionIndex].displayText,
          price: productAdder.options[productAdder.defaultOptionIndex].price,
        },
      ],
    }));

    this.showAdders.set(false);
  }

  adderChange(adderIndex: number, updatedAdder: QuoteItemAdder): void {
    this.item.update((item) => ({
      ...item,
      adders: item.adders.map((adder, index) => (index === adderIndex ? updatedAdder : adder)),
    }));
  }
}
