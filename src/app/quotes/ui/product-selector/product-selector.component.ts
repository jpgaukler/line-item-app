import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Product } from '../../../products/interfaces/product.interface';
import { ButtonDirective } from '../../../shared/ui/button-primary.directive';

@Component({
  selector: 'app-product-selector',
  imports: [CommonModule, ButtonDirective],
  templateUrl: './product-selector.component.html',
})
export class ProductSelectorComponent {
  itemNumber = input.required<string>();
  products = input.required<Product[]>();
  productClick = output<Product>();
}
