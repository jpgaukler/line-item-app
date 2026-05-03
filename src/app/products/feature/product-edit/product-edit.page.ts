import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnDestroy, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutService } from '../../../layout/data-access/layout.service';
import { ButtonDirective } from '../../../shared/ui/button-primary.directive';
import { ProductEditService } from '../../data-access/product-edit.service';
import { ProductFormService } from '../../data-access/product-form.service';
import { ProductForm } from '../../interfaces/product-form.interface';
import { ProductInputOptionForm } from '../../interfaces/product-input-option-form.interface';
import {
  MAX_PRODUCT_DESCRIPTION_LENGTH,
  MAX_PRODUCT_NAME_LENGTH,
  Product,
} from '../../interfaces/product.interface';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule, ButtonDirective, ReactiveFormsModule, CdkDropList, CdkDrag],
  templateUrl: './product-edit.page.html',
  providers: [ProductEditService, ProductFormService],
})
export class ProductEditPage implements OnDestroy {
  private readonly layoutService = inject(LayoutService);
  private readonly productFormService = inject(ProductFormService);
  public readonly productEditService = inject(ProductEditService);

  showDebug = signal<boolean>(false);

  maxNameLength = MAX_PRODUCT_NAME_LENGTH;
  maxDescriptionLength = MAX_PRODUCT_DESCRIPTION_LENGTH;

  productForm: FormGroup<ProductForm> = this.productFormService.toProductForm({
    id: '',
    name: '',
    description: '',
    productCodeFormula: '',
    inputs: [],
  });

  get inputsArray() {
    return this.productForm.controls.inputs;
  }

  optionsAt(inputIndex: number) {
    return this.productForm.controls.inputs.at(inputIndex).controls.options;
  }

  defaultOptionAt(inputIndex: number) {
    return this.productForm.controls.inputs.at(inputIndex).controls.defaultOptionIndex;
  }

  constructor() {
    this.layoutService.updateBreadcrumbs$.next([
      { label: 'Home', url: '/' },
      { label: 'Products', url: '/products' },
      { label: 'Edit Product', url: '/products/edit' },
    ]);

    effect(() => {
      if (this.productEditService.loaded()) {
        this.initializeProductForm(this.productEditService.product());
      }
    });
  }

  ngOnDestroy(): void {
    this.layoutService.clearBreadcrumbs$.next();
  }

  initializeProductForm(product: Product): void {
    this.productForm = this.productFormService.toProductForm(product);
  }

  addInput(): void {
    this.inputsArray.push(
      this.productFormService.toProductInputForm({
        name: `Input (${this.inputsArray.length + 1})`,
        defaultOptionIndex: 0,
        allowCustomValue: false,
        options: [{ displayText: 'Option (1)', value: 'Value (1)' }],
      }),
    );

    this.productForm.markAsDirty();
  }

  removeInput(inputIndex: number): void {
    this.inputsArray.removeAt(inputIndex);
    this.productForm.markAsDirty();
  }

  addOption(inputIndex: number): void {
    const optionsArray = this.optionsAt(inputIndex);

    optionsArray.push(
      this.productFormService.toProductInputOptionForm({
        displayText: `Option (${optionsArray.length + 1})`,
        value: `Value (${optionsArray.length + 1})`,
      }),
    );

    this.productForm.markAsDirty();
  }

  removeOption(inputIndex: number, optionIndex: number): void {
    const optionsArray = this.optionsAt(inputIndex);

    if (optionsArray.length <= 1) {
      return;
    }

    optionsArray.removeAt(optionIndex);

    const defaultOptionControl = this.defaultOptionAt(inputIndex);
    const currentDefaultIndex = defaultOptionControl.value;

    if (currentDefaultIndex === optionIndex) {
      defaultOptionControl.setValue(currentDefaultIndex - 1);
    }

    this.productForm.markAsDirty();
  }

  setDefaultOption(inputIndex: number, optionIndex: number): void {
    const defaultOptionControl = this.defaultOptionAt(inputIndex);
    defaultOptionControl.setValue(optionIndex);
    this.productForm.markAsDirty();
  }

  reorderOption(inputIndex: number, event: CdkDragDrop<FormGroup<ProductInputOptionForm>>): void {
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;

    if (previousIndex === currentIndex) {
      return;
    }

    const optionsArray = this.optionsAt(inputIndex);
    const defaultOptionControl = this.defaultOptionAt(inputIndex);

    // Move the options FormGroup
    moveItemInArray(optionsArray.controls, previousIndex, currentIndex);
    optionsArray.updateValueAndValidity(); // required because Angular doesn't detect this mutation automatically

    // Fix the default option index
    const currentDefaultIndex = defaultOptionControl.value;

    if (currentDefaultIndex === previousIndex) {
      // The default itself was moved
      defaultOptionControl.setValue(currentIndex);
    } else if (previousIndex < currentIndex) {
      // non-default moved down - items between shift up
      if (currentDefaultIndex > previousIndex && currentDefaultIndex <= currentIndex) {
        defaultOptionControl.setValue(currentDefaultIndex - 1);
      }
    } else if (previousIndex > currentIndex) {
      // non-default moved up - items between shift down
      if (currentDefaultIndex >= currentIndex && currentDefaultIndex < previousIndex) {
        defaultOptionControl.setValue(currentDefaultIndex + 1);
      }
    }

    this.productForm.markAsDirty();
  }

  submit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.productEditService.updateProduct$.next(
      this.productFormService.toProduct(this.productForm),
    );
  }

  reset(): void {
    this.initializeProductForm(this.productEditService.product());
  }
}
