import { FormGroup } from '@angular/forms';

/** Work order form control names that are required when creating or updating a booking.
 * vehicleManufacturer is no longer a form control - it's read-only, sourced from the Vehicle
 * record once vehiclePlate resolves (see WorkOrderCrudComponent.vehicleDetails) - a required
 * vehiclePlate is what actually guarantees a vehicle now, via the DB FK. */
export const WORKORDER_REQUIRED_FIELDS = [
  'vehiclePlate',
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

export function collectWorkOrderValidationFieldLabels(
  form: FormGroup,
  translate: (key: string) => string
): string[] {
  const missing: string[] = [];

  if (isWorkOrderControlEmpty(form, 'vehiclePlate')) {
    missing.push(translate('vehiclePlate'));
  }
  if (isWorkOrderControlEmpty(form, 'customerId')) {
    missing.push(translate('customerName'));
  }
  if (isWorkOrderControlEmpty(form, 'employeeId')) {
    missing.push(translate('mechanic'));
  }

  return missing;
}

export function isWorkOrderFormValid(form: FormGroup): boolean {
  if (form.invalid) {
    return false;
  }
  return WORKORDER_REQUIRED_FIELDS.every(
    (name) => !isWorkOrderControlEmpty(form, name)
  );
}
