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
import { ProductInputForm } from '../interfaces/product-input-form.interface';
import { ProductInputOptionForm } from '../interfaces/product-input-option-form.interface';
import { ProductInputOption } from '../interfaces/product-input-option.interface';
import { ProductInput } from '../interfaces/product-input.interface';
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
      inputs: this.formBuilder.array(product.inputs.map((input) => this.toProductInputForm(input))),
    });
  }

  toProduct(productForm: FormGroup<ProductForm>): Product {
    // remove controlId properties
    const raw = productForm.getRawValue();
    return {
      ...raw,
      inputs: raw.inputs.map(({ controlId, options, ...input }) => ({
        ...input,
        options: options.map(({ controlId, ...option }) => option),
      })),
    };
  }

  toProductInputForm(input: ProductInput): FormGroup<ProductInputForm> {
    return this.formBuilder.nonNullable.group({
      controlId: [crypto.randomUUID() as string],
      name: [input.name, [Validators.required, ProductFormService.duplicateInputNameValidator]],
      defaultOptionIndex: [input.defaultOptionIndex],
      allowCustomValue: [input.allowCustomValue],
      options: this.formBuilder.array(
        input.options.map((option) => this.toProductInputOptionForm(option)),
      ),
    });
  }

  toProductInputOptionForm(option: ProductInputOption): FormGroup<ProductInputOptionForm> {
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

  private static duplicateInputNameValidator: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const name: string = control.value;
    const currentGroup = control?.parent as FormGroup<ProductInputForm>;
    const inputsArray = currentGroup?.parent as FormArray<FormGroup<ProductInputForm>>;

    if (!name || !inputsArray) return null;

    // Find duplicates: check if any OTHER input has the same name
    const isDuplicate = inputsArray.controls.some(
      (group) =>
        group !== currentGroup &&
        group.controls.name.value.toLocaleLowerCase() === name.toLocaleLowerCase(),
    );

    return isDuplicate ? { duplicateInputName: true } : null;
  };

  private static duplicateOptionValueValidator: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const value: string = control.value;
    const currentGroup = control?.parent as FormGroup<ProductInputOptionForm>;
    const optionsArray = currentGroup?.parent as FormArray<FormGroup<ProductInputOptionForm>>;

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
    const currentGroup = control?.parent as FormGroup<ProductInputOptionForm>;
    const optionsArray = currentGroup?.parent as FormArray<FormGroup<ProductInputOptionForm>>;

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

    const inputNames: string[] =
      form.controls.inputs.controls.map(
        (input: FormGroup<ProductInputForm>) => input.controls.name.value,
      ) ?? [];
    const invalidFields: string[] = validateProductCodeFormula(formula, inputNames);

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
