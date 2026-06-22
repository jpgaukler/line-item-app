import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductAdder } from '../../../products/interfaces/product-adder.interface';
import { IconCheckmarkComponent } from '../../../shared/ui/icons/icon-checkmark.component';
import { IconXmarkComponent } from '../../../shared/ui/icons/icon-x-mark.component';

@Component({
  selector: 'app-quote-item-adder-custom',
  imports: [FormsModule, IconCheckmarkComponent, IconXmarkComponent],
  templateUrl: './quote-item-adder-custom.component.html',
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class QuoteItemAdderCustomComponent implements AfterViewInit {
  private el = inject(ElementRef);
  customDisplayTextElement = viewChild.required<ElementRef<HTMLInputElement>>(
    'customDisplayTextElement',
  );

  customDisplayText = model.required<string>();
  customPrice = model.required<number>();
  productAdder = input.required<ProductAdder>();
  saveClick = output();
  cancelClick = output();

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      this.customDisplayTextElement().nativeElement.select();
    });
  }

  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.el.nativeElement.contains(event.target);

    // Close if the click was outside
    if (!clickedInside) {
      this.cancelClick.emit();
    }
  }
}
