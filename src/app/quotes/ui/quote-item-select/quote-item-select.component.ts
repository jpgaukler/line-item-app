import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
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
  customDisplayTextElement = viewChild<ElementRef<HTMLInputElement>>('customDisplayTextElement');

  productSelection = input.required<ProductSelection>();
  quoteItemSelection = model.required<QuoteItemSelection>();
  dropdownOpen = signal<boolean>(false);
  showCustomInputs = signal<boolean>(false);
  customDisplayText = signal<string>('');
  customValue = signal<string>('');

  constructor() {
    effect(() => {
      const input = this.customDisplayTextElement();
      if (input) {
        queueMicrotask(() => {
          input.nativeElement.select();
        });
      }
    });
  }

  optionClick(option: ProductSelectionOption) {
    this.quoteItemSelection.update((selection) => ({
      ...selection,
      isCustomValue: false,
      displayText: option.displayText,
      value: option.value,
    }));

    this.dropdownOpen.set(false);
  }

  enterCustomValueClick(): void {
    this.customDisplayText.set(this.quoteItemSelection().displayText);
    this.customValue.set(this.quoteItemSelection().value);
    this.showCustomInputs.set(true);
    this.dropdownOpen.set(false);
  }

  saveCustomValueClick(): void {
    this.quoteItemSelection.update((selection) => {
      const displayText = this.customDisplayText();
      const value = this.customValue();
      const existingOption = this.productSelection().options.find((i) => i.value === value);

      return {
        ...selection,
        isCustomValue: existingOption === undefined,
        displayText: displayText,
        value: value,
      };
    });

    this.showCustomInputs.set(false);
  }

  cancelCustomValueClick(): void {
    this.showCustomInputs.set(false);
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
    if (!clickedInside && this.dropdownOpen()) {
      this.dropdownOpen.set(false);
    }
  }
}
