import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductInputOption } from '../../../products/interfaces/product-input-option.interface';
import { ProductInput } from '../../../products/interfaces/product-input.interface';
import { isCustomProductInputValue } from '../../../products/utils/product-utils';
import { IconChevronDownComponent } from '../../../shared/ui/icons/icon-chevron-down.component';
import { QuoteItemInput } from '../../interfaces/quote-item-input.interface';

@Component({
  selector: 'app-quote-item-input-dropdown',
  imports: [CommonModule, FormsModule, IconChevronDownComponent],
  templateUrl: './quote-item-input-dropdown.component.html',
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class QuoteItemInputDropdownComponent {
  private el = inject(ElementRef);

  productInput = input.required<ProductInput>();
  quoteItemInput = input.required<QuoteItemInput>();
  selectedOptionChange = output<ProductInputOption>();
  dropdownOpen = signal<boolean>(false);
  showCustomClick = output();
  isCustomValue = computed(() =>
    isCustomProductInputValue(this.productInput(), this.quoteItemInput().value),
  );

  optionClick(option: ProductInputOption) {
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
