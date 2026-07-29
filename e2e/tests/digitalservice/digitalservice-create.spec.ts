import { test, expect } from '../../fixtures';
import { DigitalServiceListPage } from '../../pages/digitalservice/digitalservice-list.page';
import { buildDigitalService } from '../../utils/data-builders/digitalservice.builder';

test.describe('Create Digital Service', () => {
  let listPage: DigitalServiceListPage;

  test.beforeEach(async ({ page }) => {
    listPage = new DigitalServiceListPage(page);
    await listPage.goto();
  });

  test('create dialog opens with the expected fields', async () => {
    await listPage.openCreateDialog();
    await expect(listPage.userIdInput).toBeVisible();
    await expect(listPage.vehiclePlateInput).toBeVisible();
    await expect(listPage.submitButton).toBeVisible();
    await expect(listPage.cancelButton).toBeVisible();
  });

  test('submitting an empty form is rejected', async () => {
    await listPage.openCreateDialog();
    await listPage.submit();
    await expect(listPage.userIdInput).toHaveClass(/ng-invalid/);
    // The confirm dialog never appears for an invalid form.
    await expect(listPage.page.locator('.p-confirmdialog')).toBeHidden();
  });

  test('cancel button closes the dialog without saving', async () => {
    await listPage.openCreateDialog();
    await listPage.fillForm(buildDigitalService());
    await listPage.cancel();
    await expect(listPage.submitButton).toBeHidden();
  });

  test('valid data creates the digital service and it appears in the list', async () => {
    const data = buildDigitalService();
    await listPage.openCreateDialog();
    await listPage.fillForm(data);
    await listPage.submit();

    // A review confirm dialog appears before the actual create - see
    // DigitalServiceListComponent.confirmDigitalService().
    await expect(listPage.page.locator('.p-confirmdialog')).toBeVisible();
    await listPage.confirmCreate();

    await expect(listPage.toast).toContainText(/./);
    await expect(listPage.submitButton).toBeHidden();
    await listPage.searchFor(data.vehiclePlate);
    await expect(listPage.parentRow(data.vehiclePlate)).toBeVisible({ timeout: 15_000 });
  });

  test('rejecting the confirm dialog does not create the record', async () => {
    const data = buildDigitalService();
    await listPage.openCreateDialog();
    await listPage.fillForm(data);
    await listPage.submit();
    await listPage.rejectCreate();

    await listPage.searchFor(data.vehiclePlate);
    await expect(listPage.parentRow(data.vehiclePlate)).toHaveCount(0);
  });
});
