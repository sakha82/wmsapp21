import { test } from '../../fixtures';

test.describe('Delete Offer', () => {
  // Neither offer-list nor offer-detail expose a delete action (no delete button, no
  // confirmationService.confirm() call for removing an offer record) as of this writing —
  // same gap as the Customer/Employee/Invoice modules. Un-skip and implement once a delete flow ships.
  test.skip('offer deletion is not yet implemented in the Offer module UI', () => {});
});
