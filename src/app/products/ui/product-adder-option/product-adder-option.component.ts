import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldTree, FormField } from '@angular/forms/signals';
import { ProductAdderOption } from '../../interfaces/product-adder-option.interface';

@Component({
  selector: 'app-product-adder-option',
  imports: [FormsModule, CommonModule, FormField],
  templateUrl: './product-adder-option.component.html',
})
export class ProductAdderOptionComponent {
  optionForm = input.required<FieldTree<ProductAdderOption>>();
  isDefaultOption = input.required<boolean>();
  setDefaultClick = output<void>();
  removeClick = output<void>();
}
