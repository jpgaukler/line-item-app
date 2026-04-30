import { CommonModule } from '@angular/common';
import { Component, input, model } from '@angular/core';
import { Product } from '../../../products/interfaces/product.interface';
import { QuoteItemSelection } from '../../interfaces/quote-item-selection.interface';
import { QuoteItem } from '../../interfaces/quote-item.interface';
import { evaluateProductCodeFormula } from '../../utils/quote-utils';
import { DragHandleComponent } from '../drag-handle/drag-handle.component';
import { QuoteItemSelectComponent } from '../quote-item-select/quote-item-select.component';

@Component({
  selector: 'app-quote-item',
  imports: [CommonModule, DragHandleComponent, QuoteItemSelectComponent],
  templateUrl: './quote-item.component.html',
})
export class QuoteItemComponent {
  systemIndex = input.required<number>();
  itemIndex = input.required<number>();
  item = model.required<QuoteItem>();
  product = model.required<Product>();

  selectionChange(updatedSelection: QuoteItemSelection): void {
    this.item.update((item) => {
      const updatedSelections = item.selections.map((selection) =>
        selection.name === updatedSelection.name ? updatedSelection : selection,
      );

      return {
        ...item,
        productCode: evaluateProductCodeFormula(
          this.product().productCodeFormula,
          updatedSelections,
        ),
        selections: updatedSelections,
      };
    });
  }
}
