import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ProductSelectionOptionForm } from './product-selection-option-form.interface';

export interface ProductSelectionForm {
  name: FormControl<string>;
  allowCustomValue: FormControl<boolean>;
  defaultOptionId: FormControl<string>;
  options: FormArray<FormGroup<ProductSelectionOptionForm>>;
}

export const duplicateOptionValueValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value;
  const currentGroup = control?.parent as FormGroup<ProductSelectionOptionForm>;
  const optionsArray = currentGroup?.parent as FormArray<FormGroup<ProductSelectionOptionForm>>;

  if (!value || !optionsArray) return null;

  // Find duplicates: check if any OTHER option has the same name
  const isDuplicate = optionsArray.controls.some(
    (group) => group !== currentGroup && group.controls.value.value === value,
  );

  return isDuplicate ? { duplicateOptionValue: true } : null;
};
