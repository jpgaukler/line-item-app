import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ProductSelectionForm } from './product-selection-form.interface';

export interface ProductForm {
  id: FormControl<string>;
  name: FormControl<string>;
  description: FormControl<string>;
  productCodeDefinition: FormControl<string>;
  selections: FormArray<FormGroup<ProductSelectionForm>>;
}

export const duplicateSelectionNameValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const name = control.value;
  const currentGroup = control?.parent as FormGroup<ProductSelectionForm>;
  const selectionsArray = currentGroup?.parent as FormArray<FormGroup<ProductSelectionForm>>;

  if (!name || !selectionsArray) return null;

  // Find duplicates: check if any OTHER selection has the same name
  const isDuplicate = selectionsArray.controls.some(
    (group) => group !== currentGroup && group.controls.name.value === name,
  );

  return isDuplicate ? { duplicateSelectionName: true } : null;
};
