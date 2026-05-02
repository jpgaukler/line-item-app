import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, input, model, signal } from '@angular/core';
import { ProductSelectionOption } from '../../../products/interfaces/product-selection-option.interface';
import { ProductSelection } from '../../../products/interfaces/product-selection.interface';
import { QuoteItemSelection } from '../../interfaces/quote-item-selection.interface';

@Component({
  selector: 'app-quote-item-select',
  imports: [CommonModule],
  templateUrl: './quote-item-select.component.html',
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class QuoteItemSelectComponent {
  private el = inject(ElementRef);

  productSelection = input.required<ProductSelection>();
  quoteItemSelection = model.required<QuoteItemSelection>();
  isOpen = signal<boolean>(false);
  isEditingCustomText = signal<boolean>(false);

  optionClick(option: ProductSelectionOption) {
    this.quoteItemSelection.update((selection) => ({
      ...selection,
      displayText: option.displayText,
      value: option.value,
    }));

    this.isOpen.set(false);
  }

  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.el.nativeElement.contains(event.target);

    // Close if the click was outside
    if (!clickedInside && this.isOpen()) {
      this.isOpen.set(false);
    }
  }
}
