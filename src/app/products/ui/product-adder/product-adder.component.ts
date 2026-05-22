import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductAdderOption } from '../../interfaces/product-adder-option.interface';
import { ProductAdder } from '../../interfaces/product-adder.interface';
import { ProductAdderOptionComponent } from '../product-adder-option/product-adder-option.component';

@Component({
  selector: 'app-product-adder',
  imports: [FormsModule, CommonModule, ProductAdderOptionComponent, CdkDrag, CdkDropList],
  templateUrl: './product-adder.component.html',
})
export class ProductAdderComponent {
  adder = model.required<ProductAdder>();
  removeClick = output<void>();

  updateName(name: string) {
    this.adder.update((current) => ({
      ...current,
      name: name,
    }));
  }

  updateDefaultOptionIndex(index: number) {
    this.adder.update((current) => ({
      ...current,
      defaultOptionIndex: index,
    }));
  }

  updateAllowCustomValue(allow: boolean) {
    this.adder.update((current) => ({
      ...current,
      allowCustomValue: allow,
    }));
  }

  addOption() {
    this.adder.update((current) => ({
      ...current,
      options: [
        ...current.options,
        { displayText: `Option ${current.options.length + 1}`, price: 0 },
      ],
    }));
  }

  updateOption(index: number, updated: ProductAdderOption) {
    this.adder.update((current) => ({
      ...current,
      options: current.options.map((option, i) => (i === index ? updated : option)),
    }));
  }

  removeOption(index: number) {
    this.adder.update((current) => ({
      ...current,
      options: current.options.filter((_, i) => i !== index),
    }));
  }

  reorderOption(event: CdkDragDrop<ProductAdderOption>) {
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;

    if (previousIndex === currentIndex) {
      return;
    }

    // Move the options FormGroup
    const updatedOptions = [...this.adder().options];
    moveItemInArray(updatedOptions, previousIndex, currentIndex);

    // Fix the default option index
    let defaultOptionIndex = this.adder().defaultOptionIndex;
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

    this.adder.update((current) => ({
      ...current,
      options: updatedOptions,
      defaultOptionIndex: defaultOptionIndex,
    }));
  }
}
