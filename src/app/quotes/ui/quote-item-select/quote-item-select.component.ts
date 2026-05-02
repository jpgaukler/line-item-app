import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductSelectionOption } from '../../../products/interfaces/product-selection-option.interface';
import { ProductSelection } from '../../../products/interfaces/product-selection.interface';
import { QuoteItemSelection } from '../../interfaces/quote-item-selection.interface';

@Component({
  selector: 'app-quote-item-select',
  imports: [CommonModule, FormsModule],
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

  optionClick(option: ProductSelectionOption) {
    this.quoteItemSelection.update((selection) => ({
      ...selection,
      displayText: option.displayText,
      value: option.value,
    }));

    this.isOpen.set(false);
  }

  toggleCustomValue(): void {
    this.quoteItemSelection.update((selection) => {
      const isCustom = !selection.isCustomValue;
      const matchingOption = this.productSelection().options.find(
        (i) => i.value === selection.value,
      );

      return {
        ...selection,
        isCustomValue: isCustom,
        displayText: isCustom
          ? selection.displayText
          : (matchingOption?.displayText ?? this.productSelection().options[0].displayText),
        value: isCustom
          ? selection.value
          : (matchingOption?.value ?? this.productSelection().options[0].value),
      };
    });
  }

  displayTextChange(displayText: string): void {
    this.quoteItemSelection.update((selection) => ({
      ...selection,
      displayText: displayText,
    }));
  }

  valueChange(value: string): void {
    this.quoteItemSelection.update((selection) => ({
      ...selection,
      value: value,
    }));
  }

  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.el.nativeElement.contains(event.target);

    // Close if the click was outside
    if (!clickedInside && this.isOpen()) {
      this.isOpen.set(false);
    }
  }
}
