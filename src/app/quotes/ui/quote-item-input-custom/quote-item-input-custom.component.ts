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
import { ProductInput } from '../../../products/interfaces/product-input.interface';
import { IconCheckmarkComponent } from '../../../shared/ui/icons/icon-checkmark.component';
import { IconMinusComponent } from '../../../shared/ui/icons/icon-minus.component';
import { IconXmarkComponent } from '../../../shared/ui/icons/icon-x-mark.component';

@Component({
  selector: 'app-quote-item-input-custom',
  imports: [FormsModule, IconCheckmarkComponent, IconXmarkComponent, IconMinusComponent],
  templateUrl: './quote-item-input-custom.component.html',
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class QuoteItemInputCustomComponent implements AfterViewInit {
  private el = inject(ElementRef);
  customDisplayTextElement = viewChild.required<ElementRef<HTMLInputElement>>(
    'customDisplayTextElement',
  );

  customDisplayText = model.required<string>();
  customValue = model.required<string>();
  productInput = input.required<ProductInput>();
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
