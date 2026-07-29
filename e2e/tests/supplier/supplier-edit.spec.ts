import { test, expect } from '../../fixtures';
import { SupplierListPage } from '../../pages/supplier/supplier-list.page';
import { buildSupplier } from '../../utils/data-builders/supplier.builder';

test.describe('Edit Supplier', () => {
  let listPage: SupplierListPage;
  let supplierName: string;

  test.beforeEach(async ({ page }) => {
    listPage = new SupplierListPage(page);
    await listPage.goto();

    const data = buildSupplier();
    supplierName = data.supplierName;
    await listPage.openCreateDialog();
    await listPage.fillForm(data);
    await listPage.submit();
    await expect(listPage.row(supplierName)).toBeVisible({ timeout: 15_000 });
  });

  test('updating the address persists the change', async () => {
    const updatedAddress = `E2E updated address ${Date.now()}`;
    await listPage.openEditDialog(supplierName);
    await expect(listPage.supplierNameInput).toHaveValue(supplierName);
    await listPage.fillForm({ supplierAddress: updatedAddress });
    await listPage.submit();

    await expect(listPage.submitButton).toBeHidden();
    await expect(listPage.row(supplierName)).toContainText(updatedAddress, { timeout: 15_000 });
  });

  test('cancelling an edit discards changes', async () => {
    await listPage.openEditDialog(supplierName);
    await listPage.fillForm({ supplierAddress: 'SHOULD NOT SAVE' });
    await listPage.cancel();

    await expect(listPage.row(supplierName)).not.toContainText('SHOULD NOT SAVE');
  });
});
