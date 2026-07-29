import { test } from '../../fixtures';

test.describe('Delete Employee', () => {
  // employee-list.component.ts's deleteEmployee() soft-deletes (isActive:false via
  // updateEmployee) but is never called from employee-list.component.html — no delete
  // button exists in the UI. Same gap as the Customer module (see customer-delete.spec.ts).
  // Un-skip and implement once a delete/deactivate action ships in the Employee module.
  test.skip('employee deletion is not yet implemented in the Employee module UI', () => {});
});
