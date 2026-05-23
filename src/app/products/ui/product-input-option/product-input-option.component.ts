import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldTree, FormField } from '@angular/forms/signals';
import { ProductInputOption } from '../../interfaces/product-input-option.interface';

@Component({
  selector: 'app-product-input-option',
  imports: [FormsModule, CommonModule, FormField],
  templateUrl: './product-input-option.component.html',
})
export class ProductInputOptionComponent {
  optionForm = input.required<FieldTree<ProductInputOption>>();
  isDefaultOption = input.required<boolean>();
  setDefaultClick = output<void>();
  removeClick = output<void>();
}
