import { Component, model, output } from '@angular/core';
import { IconMinusComponent } from '../../../shared/ui/icons/icon-minus.component';
import { IconPlusComponent } from '../../../shared/ui/icons/icon-plus.component';
import { IconTrashComponent } from '../../../shared/ui/icons/icon-trash.component';

@Component({
  selector: 'app-quote-item-quantity',
  imports: [IconPlusComponent, IconMinusComponent, IconTrashComponent],
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
