import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnDestroy } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LayoutService } from '../../../layout/data-access/layout.service';
import { ButtonPrimaryDirective } from '../../../shared/ui/button-primary.directive';
import { ProductEditService } from '../../data-access/product-edit.service';
import { ProductSelectionOption } from '../../interfaces/product-selection-option.interface';
import { ProductSelection } from '../../interfaces/product-selection.interface';
import {
  MAX_PRODUCT_DESCRIPTION_LENGTH,
  MAX_PRODUCT_NAME_LENGTH,
  Product,
} from '../../interfaces/product.interface';

interface ProductForm {
  id: FormControl<string>;
  name: FormControl<string>;
  description: FormControl<string>;
  productCodeDefinition: FormControl<string>;
  selections: FormArray<FormGroup<ProductSelectionForm>>;
}

interface ProductSelectionForm {
  id: FormControl<string>;
  name: FormControl<string>;
  allowCustomValue: FormControl<boolean>;
  defaultOptionId: FormControl<string>;
  options: FormArray<FormGroup<ProductSelectionOptionForm>>;
}

interface ProductSelectionOptionForm {
  id: FormControl<string>;
  displayText: FormControl<string>;
  value: FormControl<string>;
}

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule, ButtonPrimaryDirective, ReactiveFormsModule],
  templateUrl: './product-edit.page.html',
  providers: [ProductEditService],
})
export class ProductEditPage implements OnDestroy {
  private readonly layoutService = inject(LayoutService);
  public readonly formBuilder = inject(FormBuilder);
  public readonly productEditService = inject(ProductEditService);

  maxNameLength = MAX_PRODUCT_NAME_LENGTH;
  maxDescriptionLength = MAX_PRODUCT_DESCRIPTION_LENGTH;

  productForm: FormGroup<ProductForm> = this.buildProductForm({
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
        this.productForm = this.buildProductForm(this.productEditService.product());
      }
    });
  }

  ngOnDestroy(): void {
    this.layoutService.clearBreadcrumbs$.next();
  }

  buildProductForm(product: Product): FormGroup {
    return this.formBuilder.group({
      id: product.id,
      name: [product.name, [Validators.required, Validators.maxLength(MAX_PRODUCT_NAME_LENGTH)]],
      description: [
        product.description,
        [Validators.required, Validators.maxLength(MAX_PRODUCT_DESCRIPTION_LENGTH)],
      ],
      productCodeDefinition: [product.productCodeDefinition],
      selections: this.formBuilder.array(
        product.selections.map((selection) => this.buildProductSelectionForm(selection)),
      ),
    });
  }

  buildProductSelectionForm(selection: ProductSelection): FormGroup {
    return this.formBuilder.group({
      id: selection.id,
      name: [selection.name, [Validators.required]],
      defaultOptionId: selection.defaultOptionId,
      allowCustomValue: selection.allowCustomValue,
      options: this.formBuilder.array(
        selection.options.map((option) => this.buildProductSelectionOptionForm(option)),
      ),
    });
  }

  buildProductSelectionOptionForm(option: ProductSelectionOption): FormGroup {
    return this.formBuilder.group({
      id: option.id,
      displayText: [option.displayText, [Validators.required]],
      value: [option.value, [Validators.required]],
    });
  }

  addSelection(): void {
    const newSelectionId = crypto.randomUUID();
    const defaultOptionId = crypto.randomUUID();

    this.selectionsArray.push(
      this.buildProductSelectionForm({
        id: newSelectionId,
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
      this.buildProductSelectionOptionForm({
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
    this.productForm = this.buildProductForm(this.productEditService.product());
  }
}
