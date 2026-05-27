import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductAdderOption } from '../../../products/interfaces/product-adder-option.interface';
import { ProductAdder } from '../../../products/interfaces/product-adder.interface';
import { QuoteItemAdder } from '../../interfaces/quote-item-adder.interface';

@Component({
  selector: 'app-quote-item-adder-dropdown',
  imports: [CommonModule, FormsModule],
  templateUrl: './quote-item-adder-dropdown.component.html',
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class QuoteItemAdderDropdownComponent {
  private el = inject(ElementRef);

  productAdder = input.required<ProductAdder>();
  quoteItemAdder = input.required<QuoteItemAdder>();
  selectedOptionChange = output<ProductAdderOption>();
  dropdownOpen = signal<boolean>(false);
  showCustomClick = output();
  isCustomValue = computed(
    () => false,
    // isCustomProductInputValue(this.productInput(), this.quoteItemInput().value),
  );

  optionClick(option: ProductAdderOption) {
    this.dropdownOpen.set(false);
    this.selectedOptionChange.emit(option);
  }

  showCustom() {
    this.dropdownOpen.set(false);
    this.showCustomClick.emit();
  }

  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.el.nativeElement.contains(event.target);

    // Close if the click was outside
    if (!clickedInside && this.dropdownOpen()) {
      this.dropdownOpen.set(false);
    }
  }
}
