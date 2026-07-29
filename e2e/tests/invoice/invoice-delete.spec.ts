import { test } from '../../fixtures';

test.describe('Delete Invoice', () => {
  // Neither invoice-list nor invoice-detail expose a delete action (no delete button, no
  // confirmationService.confirm() call for removing an invoice record) as of this writing —
  // same gap as the Customer/Employee modules. Un-skip and implement once a delete flow ships.
  test.skip('invoice deletion is not yet implemented in the Invoice module UI', () => {});
});
