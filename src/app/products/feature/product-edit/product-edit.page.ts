import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutService } from '../../../layout/data-access/layout.service';
import { ButtonPrimaryDirective } from '../../../shared/ui/button-primary.directive';
import { ProductEditFormService } from '../../data-access/product-edit-form.service';
import { ProductEditService } from '../../data-access/product-edit.service';
import { ProductForm } from '../../interfaces/product-form.interface';
import {
  MAX_PRODUCT_DESCRIPTION_LENGTH,
  MAX_PRODUCT_NAME_LENGTH,
} from '../../interfaces/product.interface';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule, ButtonPrimaryDirective, ReactiveFormsModule],
  templateUrl: './product-edit.page.html',
  providers: [ProductEditService, ProductEditFormService],
})
export class ProductEditPage implements OnDestroy {
  private readonly layoutService = inject(LayoutService);
  public readonly formBuilder = inject(FormBuilder);
  public readonly productEditFormService = inject(ProductEditFormService);
  public readonly productEditService = inject(ProductEditService);

  maxNameLength = MAX_PRODUCT_NAME_LENGTH;
  maxDescriptionLength = MAX_PRODUCT_DESCRIPTION_LENGTH;

  productForm: FormGroup<ProductForm> = this.productEditFormService.toProductForm({
    id: '',
    name: '',
    description: '',
    productCodeDefinition: '',
    selections: [],
  });

  get selectionsArray() {
    return this.productForm.controls.selections;
  }

  optionsAt(selectionIndex: number) {
    return this.productForm.controls.selections.at(selectionIndex).controls.options;
  }

  constructor() {
    this.layoutService.updateBreadcrumbs$.next([
      { label: 'Home', url: '/' },
      { label: 'Products', url: '/products' },
      { label: 'Edit Product', url: '/products/edit' },
    ]);

    effect(() => {
      if (this.productEditService.loaded()) {
        console.log('running effect');
        this.productForm = this.productEditFormService.toProductForm(
          this.productEditService.product(),
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.layoutService.clearBreadcrumbs$.next();
  }

  addSelection(): void {
    const defaultOptionId = crypto.randomUUID();

    this.selectionsArray.push(
      this.productEditFormService.toProductSelectionForm({
        name: `Selection (${this.selectionsArray.length + 1})`,
        defaultOptionId: defaultOptionId,
        allowCustomValue: false,
        options: [{ id: defaultOptionId, displayText: 'Option (1)', value: '1' }],
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
      this.productEditFormService.toProductSelectionOptionForm({
        id: crypto.randomUUID(),
        displayText: `Option (${optionsArray.length + 1})`,
        value: `${optionsArray.length + 1}`,
      }),
    );

    this.productForm.markAsDirty();
  }

  removeOption(selectionIndex: number, optionIndex: number): void {
    const optionsArray = this.optionsAt(selectionIndex);
    optionsArray.removeAt(optionIndex);
    this.productForm.markAsDirty();
  }

  submit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.productEditService.updateProduct$.next(this.productForm.getRawValue());
  }

  reset(): void {
    this.productForm = this.productEditFormService.toProductForm(this.productEditService.product());
  }
}
