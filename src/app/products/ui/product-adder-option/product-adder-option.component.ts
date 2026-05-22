import { CommonModule } from '@angular/common';
import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductAdderOption } from '../../interfaces/product-adder-option.interface';

@Component({
  selector: 'app-product-adder-option',
  imports: [FormsModule, CommonModule],
  templateUrl: './product-adder-option.component.html',
})
export class ProductAdderOptionComponent {
  option = model.required<ProductAdderOption>();
  isDefaultOption = input.required<boolean>();
  setDefaultClick = output<void>();
  removeClick = output<void>();

  updateDisplayText(displayText: string) {
    this.option.update((current) => ({
      ...current,
      displayText: displayText,
    }));
  }

  updatePrice(price: number) {
    this.option.update((current) => ({
      ...current,
      price: price,
    }));
  }
}
