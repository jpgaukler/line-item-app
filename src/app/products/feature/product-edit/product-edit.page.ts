import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnDestroy, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutService } from '../../../layout/data-access/layout.service';
import { ButtonDirective } from '../../../shared/ui/button-primary.directive';
import { ProductEditService } from '../../data-access/product-edit.service';
import { ProductFormService } from '../../data-access/product-form.service';
import { ProductForm } from '../../interfaces/product-form.interface';
import { ProductSelectionOptionForm } from '../../interfaces/product-selection-option-form.interface';
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
    selections: [],
  });

  get selectionsArray() {
    return this.productForm.controls.selections;
  }

  optionsAt(selectionIndex: number) {
    return this.productForm.controls.selections.at(selectionIndex).controls.options;
  }

  defaultOptionAt(selectionIndex: number) {
    return this.productForm.controls.selections.at(selectionIndex).controls.defaultOptionIndex;
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

  addSelection(): void {
    this.selectionsArray.push(
      this.productFormService.toProductSelectionForm({
        name: `Selection (${this.selectionsArray.length + 1})`,
        defaultOptionIndex: 0,
        allowCustomValue: false,
        options: [{ displayText: 'Option (1)', value: 'Value (1)' }],
      }),
    );

    this.productForm.markAsDirty();
  }

  removeSelection(selectionIndex: number): void {
    this.selectionsArray.removeAt(selectionIndex);
    this.productForm.markAsDirty();
  }

  addOption(selectionIndex: number): void {
    const optionsArray = this.optionsAt(selectionIndex);

    optionsArray.push(
      this.productFormService.toProductSelectionOptionForm({
        displayText: `Option (${optionsArray.length + 1})`,
        value: `Value (${optionsArray.length + 1})`,
      }),
    );

    this.productForm.markAsDirty();
  }

  removeOption(selectionIndex: number, optionIndex: number): void {
    const optionsArray = this.optionsAt(selectionIndex);

    if (optionsArray.length <= 1) {
      return;
    }

    optionsArray.removeAt(optionIndex);

    const defaultOptionControl = this.defaultOptionAt(selectionIndex);
    const currentDefaultIndex = defaultOptionControl.value;

    if (currentDefaultIndex === optionIndex) {
      defaultOptionControl.setValue(currentDefaultIndex - 1);
    }

    this.productForm.markAsDirty();
  }

  setDefaultOption(selectionIndex: number, optionIndex: number): void {
    const defaultOptionControl = this.defaultOptionAt(selectionIndex);
    defaultOptionControl.setValue(optionIndex);
    this.productForm.markAsDirty();
  }

  reorderOption(
    selectionIndex: number,
    event: CdkDragDrop<FormGroup<ProductSelectionOptionForm>>,
  ): void {
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;

    if (previousIndex === currentIndex) {
      return;
    }

    const optionsArray = this.optionsAt(selectionIndex);
    const defaultOptionControl = this.defaultOptionAt(selectionIndex);

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

    // remove controlId properties
    const raw = this.productForm.getRawValue();
    const product: Product = {
      ...raw,
      selections: raw.selections.map(({ controlId, options, ...selection }) => ({
        ...selection,
        options: options.map(({ controlId, ...option }) => option),
      })),
    };

    this.productEditService.updateProduct$.next(product);
  }

  reset(): void {
    this.initializeProductForm(this.productEditService.product());
  }
}
