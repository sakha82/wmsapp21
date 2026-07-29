import { test, expect } from '../../fixtures';
import { SupplierListPage } from '../../pages/supplier/supplier-list.page';

test.describe('Supplier List', () => {
  let listPage: SupplierListPage;

  test.beforeEach(async ({ page }) => {
    listPage = new SupplierListPage(page);
    await listPage.goto();
  });

  test('page loads successfully and grid loads data', async ({ page }) => {
    await expect(page).toHaveURL(/\/sv\/supplier/);
    await expect(listPage.table.root).toBeVisible();
  });

  test('loading indicator disappears after data loads', async ({ page }) => {
    await expect(page.locator('app-generic-loader .p-progress-spinner')).toBeHidden();
  });

  test('no duplicate supplier rows appear on the current page', async () => {
    await listPage.table.expectNoDuplicateRows();
  });

  test('column filter narrows the list by supplier name', async ({ page }) => {
    const data = { supplierName: `E2E Filter Target ${Date.now()}` };
    await listPage.openCreateDialog();
    await listPage.fillForm(data);
    await listPage.submit();
    await expect(listPage.row(data.supplierName)).toBeVisible({ timeout: 15_000 });

    await listPage.nameFilterInput.fill(data.supplierName);

    await expect(listPage.table.rows).toHaveCount(1, { timeout: 15_000 });
    await expect(listPage.row(data.supplierName)).toBeVisible();
  });

  test('create supplier button opens the create dialog', async () => {
    await listPage.openCreateDialog();
    await expect(listPage.submitButton).toBeVisible();
  });
});
