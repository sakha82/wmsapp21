import { test } from '../../fixtures';

test.describe('Delete Customer', () => {
  // customer-crud.component.ts / customer-detail.component.ts expose no delete
  // action (no delete button, no confirmationService.confirm() call for a
  // customer record) as of this writing. docs/automated-test-plan.md scopes
  // this suite as "If supported:" — it isn't yet, so this is a placeholder
  // rather than an assertion against a feature that doesn't exist. Un-skip
  // and implement once a delete flow ships in the Customer module.
  test.skip('customer deletion is not yet implemented in the Customer module', () => {});
});
