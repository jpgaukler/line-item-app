import { inject, Injectable } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { validateProductCodeFormula } from '../../quotes/utils/quote-utils';
import { ProductForm } from '../interfaces/product-form.interface';
import { ProductSelectionForm } from '../interfaces/product-selection-form.interface';
import { ProductSelectionOptionForm } from '../interfaces/product-selection-option-form.interface';
import { ProductSelectionOption } from '../interfaces/product-selection-option.interface';
import { ProductSelection } from '../interfaces/product-selection.interface';
import {
  MAX_PRODUCT_DESCRIPTION_LENGTH,
  MAX_PRODUCT_NAME_LENGTH,
  Product,
} from '../interfaces/product.interface';

@Injectable()
export class ProductFormService {
  private readonly formBuilder = inject(FormBuilder);

  toProductForm(product: Product): FormGroup<ProductForm> {
    return this.formBuilder.nonNullable.group({
      id: [product.id],
      name: [product.name, [Validators.required, Validators.maxLength(MAX_PRODUCT_NAME_LENGTH)]],
      description: [
        product.description,
        [Validators.required, Validators.maxLength(MAX_PRODUCT_DESCRIPTION_LENGTH)],
      ],
      productCodeFormula: [
        product.productCodeFormula,
        ProductFormService.productCodeFormulaValidator,
      ],
      selections: this.formBuilder.array(
        product.selections.map((selection) => this.toProductSelectionForm(selection)),
      ),
    });
  }

  toProduct(productForm: FormGroup<ProductForm>): Product {
    // remove controlId properties
    const raw = productForm.getRawValue();
    return {
      ...raw,
      selections: raw.selections.map(({ controlId, options, ...selection }) => ({
        ...selection,
        options: options.map(({ controlId, ...option }) => option),
      })),
    };
  }

  toProductSelectionForm(selection: ProductSelection): FormGroup<ProductSelectionForm> {
    return this.formBuilder.nonNullable.group({
      controlId: [crypto.randomUUID() as string],
      name: [
        selection.name,
        [Validators.required, ProductFormService.duplicateSelectionNameValidator],
      ],
      defaultOptionIndex: [selection.defaultOptionIndex],
      allowCustomValue: [selection.allowCustomValue],
      options: this.formBuilder.array(
        selection.options.map((option) => this.toProductSelectionOptionForm(option)),
      ),
    });
  }

  toProductSelectionOptionForm(
    option: ProductSelectionOption,
  ): FormGroup<ProductSelectionOptionForm> {
    return this.formBuilder.nonNullable.group({
      controlId: [crypto.randomUUID() as string],
      displayText: [
        option.displayText,
        [Validators.required, ProductFormService.duplicateOptionDisplayTextValidator],
      ],
      value: [
        option.value,
        [Validators.required, ProductFormService.duplicateOptionValueValidator],
      ],
    });
  }

  private static duplicateSelectionNameValidator: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const name: string = control.value;
    const currentGroup = control?.parent as FormGroup<ProductSelectionForm>;
    const selectionsArray = currentGroup?.parent as FormArray<FormGroup<ProductSelectionForm>>;

    if (!name || !selectionsArray) return null;

    // Find duplicates: check if any OTHER selection has the same name
    const isDuplicate = selectionsArray.controls.some(
      (group) =>
        group !== currentGroup &&
        group.controls.name.value.toLocaleLowerCase() === name.toLocaleLowerCase(),
    );

    return isDuplicate ? { duplicateSelectionName: true } : null;
  };

  private static duplicateOptionValueValidator: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const value: string = control.value;
    const currentGroup = control?.parent as FormGroup<ProductSelectionOptionForm>;
    const optionsArray = currentGroup?.parent as FormArray<FormGroup<ProductSelectionOptionForm>>;

    if (!value || !optionsArray) return null;

    // Find duplicates: check if any OTHER option has the same value
    const isDuplicate = optionsArray.controls.some(
      (group) =>
        group !== currentGroup &&
        group.controls.value.value.toLocaleLowerCase() === value.toLocaleLowerCase(),
    );

    return isDuplicate ? { duplicateOptionValue: true } : null;
  };

  private static duplicateOptionDisplayTextValidator: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const displayText: string = control.value;
    const currentGroup = control?.parent as FormGroup<ProductSelectionOptionForm>;
    const optionsArray = currentGroup?.parent as FormArray<FormGroup<ProductSelectionOptionForm>>;

    if (!displayText || !optionsArray) return null;

    // Find duplicates: check if any OTHER option has the same display text
    const isDuplicate = optionsArray.controls.some(
      (group) =>
        group !== currentGroup &&
        group.controls.displayText.value.toLocaleLowerCase() === displayText.toLocaleLowerCase(),
    );

    return isDuplicate ? { duplicateOptionDisplayText: true } : null;
  };

  private static productCodeFormulaValidator: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const formula: string = control.value;
    const form = control?.parent as FormGroup<ProductForm>;

    if (!formula || !form) {
      return null;
    }

    const selectionNames: string[] =
      form.controls.selections.controls.map(
        (selection: FormGroup<ProductSelectionForm>) => selection.controls.name.value,
      ) ?? [];
    const invalidFields: string[] = validateProductCodeFormula(formula, selectionNames);

    if (invalidFields.length > 0) {
      return {
        invalidFormula: {
          invalidFields: invalidFields,
        },
      };
    }

    return null;
  };
}
