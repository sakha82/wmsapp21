import { test } from '../../fixtures';

test.describe('Delete Digital Service', () => {
  // digitalservice-list has no delete action for a service record (only a PDF
  // attach/replace dialog) as of this writing - same gap as Customer/Employee/Invoice/Supplier.
  // Un-skip and implement once a delete flow ships.
  test.skip('digital service deletion is not yet implemented in the DigitalService module UI', () => {});
});
