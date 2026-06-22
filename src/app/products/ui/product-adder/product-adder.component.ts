import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { IconXmarkComponent } from '../../../shared/ui/icons/icon-x-mark.component';
import { ProductAdder } from '../../interfaces/product-adder.interface';
import { ProductAdderOptionComponent } from '../product-adder-option/product-adder-option.component';

@Component({
  selector: 'app-product-adder',
  imports: [
    CommonModule,
    ProductAdderOptionComponent,
    CdkDrag,
    CdkDropList,
    FormField,
    IconXmarkComponent,
  ],
  templateUrl: './product-adder.component.html',
})
export class ProductAdderComponent {
  adderForm = input.required<FieldTree<ProductAdder>>();
  removeClick = output<void>();

  addOption() {
    this.adderForm()
      .options()
      .value.update((options) => [
        ...options,
        {
          displayText: `Option ${options.length + 1}`,
          price: 0,
        },
      ]);
  }

  removeOption(index: number) {
    const optionsArray = this.adderForm().options().value();

    if (optionsArray.length <= 1) {
      return;
    }

    // remove option
    this.adderForm()
      .options()
      .value.update((options) => options.filter((_, i) => i !== index));

    // fix default if the default was removed or after the removed index
    const defaultOptionIndex = this.adderForm().defaultOptionIndex().value();
    if (defaultOptionIndex > 0 && defaultOptionIndex >= index) {
      this.adderForm()
        .defaultOptionIndex()
        .value.set(defaultOptionIndex - 1);
    }
  }

  reorderOption(event: CdkDragDrop<any>) {
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;

    if (previousIndex === currentIndex) {
      return;
    }

    // Move the options FormGroup
    const updatedOptions = [...this.adderForm().options().value()];
    moveItemInArray(updatedOptions, previousIndex, currentIndex);

    // Fix the default option index
    let defaultOptionIndex = this.adderForm().defaultOptionIndex().value();
    const currentDefaultIndex = defaultOptionIndex;

    if (currentDefaultIndex === previousIndex) {
      // The default was moved
      defaultOptionIndex = currentIndex;
    } else if (previousIndex < currentIndex) {
      // non-default moved down - items between shift up
      if (currentDefaultIndex > previousIndex && currentDefaultIndex <= currentIndex) {
        defaultOptionIndex = currentDefaultIndex - 1;
      }
    } else if (previousIndex > currentIndex) {
      // non-default moved up - items between shift down
      if (currentDefaultIndex >= currentIndex && currentDefaultIndex < previousIndex) {
        defaultOptionIndex = currentDefaultIndex + 1;
      }
    }

    this.adderForm().options().value.set(updatedOptions);
    this.adderForm().defaultOptionIndex().value.set(defaultOptionIndex);
  }
}
