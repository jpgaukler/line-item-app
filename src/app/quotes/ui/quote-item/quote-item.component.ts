import { CommonModule } from '@angular/common';
import { Component, input, model } from '@angular/core';
import { Product } from '../../../products/interfaces/product.interface';
import { QuoteItemInput } from '../../interfaces/quote-item-input.interface';
import { QuoteItem } from '../../interfaces/quote-item.interface';
import { evaluateProductCodeFormula } from '../../utils/quote-utils';
import { DragHandleComponent } from '../drag-handle/drag-handle.component';
import { QuoteItemInputComponent } from '../quote-item-input/quote-item-input.component';

@Component({
  selector: 'app-quote-item',
  imports: [CommonModule, DragHandleComponent, QuoteItemInputComponent],
  templateUrl: './quote-item.component.html',
})
export class QuoteItemComponent {
  systemIndex = input.required<number>();
  itemIndex = input.required<number>();
  item = model.required<QuoteItem>();
  product = model.required<Product>();

  inputChange(updatedInput: QuoteItemInput): void {
    this.item.update((item) => {
      const updatedInputs = item.inputs.map((input) =>
        input.name === updatedInput.name ? updatedInput : input,
      );

      return {
        ...item,
        productCode: evaluateProductCodeFormula(this.product().productCodeFormula, updatedInputs),
        inputs: updatedInputs,
      };
    });
  }
}
