import { test } from '../../fixtures';

test.describe('Delete Supplier', () => {
  // supplier-list has no delete action (no delete button, no confirmationService.confirm() call
  // for removing a supplier record) as of this writing - same gap as Customer/Employee/Invoice.
  // Un-skip and implement once a delete flow ships.
  test.skip('supplier deletion is not yet implemented in the Supplier module UI', () => {});
});
