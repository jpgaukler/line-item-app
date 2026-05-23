import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { ProductInput } from '../../interfaces/product-input.interface';
import { ProductInputOptionComponent } from '../product-input-option/product-input-option.component';

@Component({
  selector: 'app-product-input',
  imports: [CommonModule, CdkDrag, CdkDropList, FormField, ProductInputOptionComponent],
  templateUrl: './product-input.component.html',
})
export class ProductInputComponent {
  inputForm = input.required<FieldTree<ProductInput>>();
  removeClick = output<void>();

  addOption() {
    this.inputForm()
      .options()
      .value.update((options) => [
        ...options,
        {
          displayText: `Option (${options.length + 1})`,
          value: `Value (${options.length + 1})`,
        },
      ]);
  }

  removeOption(index: number) {
    const optionsArray = this.inputForm().options().value();

    if (optionsArray.length <= 1) {
      return;
    }

    // remove option
    this.inputForm()
      .options()
      .value.update((options) => options.filter((_, i) => i !== index));

    // fix default if the default was removed
    const defaultOptionIndex = this.inputForm().defaultOptionIndex().value();
    if (defaultOptionIndex === index) {
      this.inputForm()
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
    const updatedOptions = [...this.inputForm().options().value()];
    moveItemInArray(updatedOptions, previousIndex, currentIndex);

    // Fix the default option index
    let defaultOptionIndex = this.inputForm().defaultOptionIndex().value();
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

    this.inputForm().options().value.set(updatedOptions);
    this.inputForm().defaultOptionIndex().value.set(defaultOptionIndex);
  }
}
