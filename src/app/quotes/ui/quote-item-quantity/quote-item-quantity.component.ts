import { Component, model, output } from '@angular/core';

@Component({
  selector: 'app-quote-item-quantity',
  imports: [],
  templateUrl: './quote-item-quantity.component.html',
})
export class QuoteItemQuantityComponent {
  quantity = model.required<number>();
  deleteClick = output();

  increment() {
    this.quantity.update((q) => q + 1);
  }

  decrement() {
    if (this.quantity() === 1) {
      this.deleteClick.emit();
      return;
    }

    this.quantity.update((q) => q - 1);
  }
}
