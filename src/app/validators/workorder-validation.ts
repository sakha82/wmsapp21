import { FormGroup } from '@angular/forms';

/** Work order form control names that are required when creating or updating a booking. */
export const WORKORDER_REQUIRED_FIELDS = [
  'vehiclePlate',
  'vehicleManufacturer',
  'customerId',
  'employeeId',
] as const;

export type WorkOrderRequiredField = (typeof WORKORDER_REQUIRED_FIELDS)[number];

export function isWorkOrderControlEmpty(
  form: FormGroup,
  controlName: WorkOrderRequiredField
): boolean {
  const value = form.get(controlName)?.value;
  if (controlName === 'customerId' || controlName === 'employeeId') {
    return value == null || value === 0 || value === '';
  }
  if (typeof value === 'string') {
    return !value.trim();
  }
  return value == null || value === '';
}

export function isWorkOrderFieldInvalid(
  form: FormGroup,
  controlName: WorkOrderRequiredField,
  formSubmitted: boolean
): boolean {
  if (!formSubmitted) {
    return false;
  }
  return isWorkOrderControlEmpty(form, controlName);
}

export function isWorkOrderServicesMissing(
  selectedProducts: unknown[],
  formSubmitted: boolean
): boolean {
  return formSubmitted && selectedProducts.length === 0;
}

export function collectWorkOrderValidationFieldLabels(
  form: FormGroup,
  selectedProducts: unknown[],
  translate: (key: string) => string
): string[] {
  const missing: string[] = [];

  if (isWorkOrderControlEmpty(form, 'vehiclePlate')) {
    missing.push(translate('vehiclePlate'));
  }
  if (isWorkOrderControlEmpty(form, 'vehicleManufacturer')) {
    missing.push(translate('vehicleMake'));
  }
  if (isWorkOrderControlEmpty(form, 'customerId')) {
    missing.push(translate('customerName'));
  }
  if (isWorkOrderControlEmpty(form, 'employeeId')) {
    missing.push(translate('mechanic'));
  }
  if (selectedProducts.length === 0) {
    missing.push(translate('service'));
  }

  return missing;
}

export function isWorkOrderFormValid(
  form: FormGroup,
  selectedProducts: unknown[]
): boolean {
  if (form.invalid) {
    return false;
  }
  if (selectedProducts.length === 0) {
    return false;
  }
  return WORKORDER_REQUIRED_FIELDS.every(
    (name) => !isWorkOrderControlEmpty(form, name)
  );
}
