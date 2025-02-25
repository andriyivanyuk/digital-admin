import { ValidatorFn, AbstractControl } from '@angular/forms';

export function minImageCountValidator(min: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value || !Array.isArray(control.value)) {
      return { minImageCount: { valid: false } };
    }
    return control.value.length >= min
      ? null
      : { minImageCount: { valid: false } };
  };
}
