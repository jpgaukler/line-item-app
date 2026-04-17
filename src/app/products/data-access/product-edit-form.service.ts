import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { duplicateSelectionNameValidator } from '../interfaces/product-form.interface';
import { duplicateOptionValueValidator } from '../interfaces/product-selection-form.interface';
import { ProductSelectionOption } from '../interfaces/product-selection-option.interface';
import { ProductSelection } from '../interfaces/product-selection.interface';
import {
  MAX_PRODUCT_DESCRIPTION_LENGTH,
  MAX_PRODUCT_NAME_LENGTH,
  Product,
} from '../interfaces/product.interface';

@Injectable()
export class ProductEditFormService {
  public readonly formBuilder = inject(FormBuilder);

  toProductForm(product: Product): FormGroup {
    return this.formBuilder.group({
      id: product.id,
      name: [product.name, [Validators.required, Validators.maxLength(MAX_PRODUCT_NAME_LENGTH)]],
      description: [
        product.description,
        [Validators.required, Validators.maxLength(MAX_PRODUCT_DESCRIPTION_LENGTH)],
      ],
      productCodeDefinition: [product.productCodeDefinition],
      selections: this.formBuilder.array(
        product.selections.map((selection) => this.toProductSelectionForm(selection)),
      ),
    });
  }

  toProductSelectionForm(selection: ProductSelection): FormGroup {
    return this.formBuilder.group({
      name: [selection.name, [Validators.required, duplicateSelectionNameValidator]],
      defaultOptionId: selection.defaultValue,
      allowCustomValue: selection.allowCustomValue,
      options: this.formBuilder.array(
        selection.options.map((option) => this.toProductSelectionOptionForm(option)),
      ),
    });
  }

  toProductSelectionOptionForm(option: ProductSelectionOption): FormGroup {
    return this.formBuilder.group({
      displayText: [option.displayText, [Validators.required]],
      value: [option.value, [Validators.required, duplicateOptionValueValidator]],
    });
  }
}
