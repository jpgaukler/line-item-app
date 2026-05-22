import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { ProductAdder } from '../../interfaces/product-adder.interface';
import { ProductAdderOptionComponent } from '../product-adder-option/product-adder-option.component';

// function duplicateNameValidator(
//   getCurrentIndex: () => number,
//   getAdders: () => ProductAdder[],
// ): ValidatorFn {
//   return (control: AbstractControl): ValidationErrors | null => {
//     const name = control.value?.trim();

//     if (!name || !getAdders || !getCurrentIndex) return null;

//     const currentIndex = getCurrentIndex();
//     const adders = getAdders();

//     return adders.some(
//       (adder, index) => index !== currentIndex && adder.name?.toLowerCase() === name.toLowerCase(),
//     )
//       ? { duplicateName: true }
//       : null;
//   };
// }

@Component({
  selector: 'app-product-adder',
  imports: [CommonModule, ProductAdderOptionComponent, CdkDrag, CdkDropList, FormField],
  templateUrl: './product-adder.component.html',
})
export class ProductAdderComponent {
  adderForm = input.required<FieldTree<ProductAdder>>();
  removeClick = output<void>();

  addOption() {
    this.adderForm()
      .options()
      .value.update((options) => ({
        ...options,
        options: [...options, { displayText: `Option ${options.length + 1}`, price: 0 }],
      }));
  }

  removeOption(index: number) {
    this.adderForm()
      .options()
      .value.update((options) => options.filter((_, i) => i !== index));
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
