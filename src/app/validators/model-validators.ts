import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MessageService } from 'primeng/api';

/** Red error toast matching invoice CRUD validation UX. */
export function showValidationErrorToast(
  messageService: MessageService,
  translate: (key: string) => string,
  detailKey = 'fillRequiredFieldsCorrectly',
  life?: number
): void {
  messageService.add({
    severity: 'error',
    summary: translate('error'),
    detail: translate(detailKey),
    ...(life != null ? { life } : {}),
  });
}

/** CustomerId / OfferId style: must be > 0 when provided on update. */
export function requiredPositiveIdValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value == null || value === '' || Number(value) <= 0) {
      return { requiredPositiveId: true };
    }
    return null;
  };
}

/** Backend adjustment rule: between -0.99 and 0.99, max 2 decimals. */
export function adjustmentValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value == null || control.value === '') {
      return null;
    }
    const val = Number(control.value);
    if (Number.isNaN(val)) {
      return { adjustmentInvalid: true };
    }
    const abs = Math.abs(val);
    if (abs > 0.99) {
      return { adjustmentRange: true };
    }
    if (Math.abs(abs * 100 - Math.trunc(abs * 100)) > Number.EPSILON) {
      return { adjustmentDecimals: true };
    }
    return null;
  };
}

/** Product VatPercentage: 0-100. */
export function vatPercentageValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value == null || control.value === '') {
      return null;
    }
    const val = Number(control.value);
    if (Number.isNaN(val) || val < 0 || val > 100) {
      return { vatPercentageRange: true };
    }
    return null;
  };
}

export function isFormControlInvalid(
  form: AbstractControl,
  fieldName: string,
  formSubmitted = false
): boolean {
  const control = form.get(fieldName);
  if (!control) {
    return false;
  }
  return control.invalid && (control.touched || formSubmitted);
}
