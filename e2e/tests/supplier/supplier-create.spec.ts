import { test, expect } from '../../fixtures';
import { SupplierListPage } from '../../pages/supplier/supplier-list.page';
import { buildSupplier } from '../../utils/data-builders/supplier.builder';

test.describe('Create Supplier', () => {
  let listPage: SupplierListPage;

  test.beforeEach(async ({ page }) => {
    listPage = new SupplierListPage(page);
    await listPage.goto();
  });

  test('create dialog opens with the expected fields', async () => {
    await listPage.openCreateDialog();
    await expect(listPage.supplierNameInput).toBeVisible();
    await expect(listPage.submitButton).toBeVisible();
    await expect(listPage.cancelButton).toBeVisible();
  });

  test('cancel button closes the dialog without saving', async () => {
    await listPage.openCreateDialog();
    await listPage.fillForm(buildSupplier());
    await listPage.cancel();
    await expect(listPage.submitButton).toBeHidden();
  });

  test('valid data creates the supplier and it appears in the list', async () => {
    const data = buildSupplier();
    await listPage.openCreateDialog();
    await listPage.fillForm(data);
    await listPage.submit();

    await expect(listPage.toast).toContainText(/./);
    await expect(listPage.submitButton).toBeHidden();
    await expect(listPage.row(data.supplierName)).toBeVisible({ timeout: 15_000 });
  });
});
