import { test } from '../../fixtures';

test.describe('Digital Service Detail', () => {
  // DigitalServiceListComponent.redirectToVehicleDetailComponent() (which navigates to
  // /sv/digitalservice/details/:vehiclePlate/:userId, the PDF-viewer detail page) is defined but
  // never called from digitalservice-list.component.html - there is no click target anywhere in
  // the list/tree that reaches it. The detail route is real and renders, but is unreachable via
  // the UI as of this writing; flagged in COMPLETED_TASKS.md rather than guessing which element
  // should trigger it (a product/UX decision, not an E2E-authoring one). Un-skip once a real
  // entry point exists.
  test.skip('digital service detail page has no reachable entry point in the UI yet', () => {});
});
