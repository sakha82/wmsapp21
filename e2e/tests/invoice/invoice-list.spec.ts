import { test, expect } from '../../fixtures';
import { InvoiceListPage } from '../../pages/invoice/invoice-list.page';
import { t } from '../../utils/translations';

test.describe('Invoice List', () => {
  let listPage: InvoiceListPage;

  test.beforeEach(async ({ page }) => {
    listPage = new InvoiceListPage(page);
    await listPage.goto();
  });

  test('page loads successfully and grid loads data', async ({ page }) => {
    await expect(page).toHaveURL(/\/sv\/invoice/);
    await expect(listPage.table.root).toBeVisible();
  });

  test('loading indicator disappears after data loads', async ({ page }) => {
    await expect(page.locator('app-generic-loader .p-progress-spinner')).toBeHidden();
  });

  test('no duplicate invoice rows appear on the current page', async () => {
    await listPage.table.expectNoDuplicateRows();
  });

  test('sorting by invoice id toggles sort order', async () => {
    const idHeader = t('id');
    await listPage.table.sortBy(idHeader);
    expect(await listPage.table.isSortedBy(idHeader)).toBe(true);

    const firstIdAscending = (await listPage.table.rows.first().locator('td').first().innerText()).trim();

    await listPage.table.sortBy(idHeader);
    const firstIdDescending = (await listPage.table.rows.first().locator('td').first().innerText()).trim();

    expect(firstIdAscending).not.toBe(firstIdDescending);
  });

  test('create invoice button navigates to the crud form', async ({ page }) => {
    await listPage.clickCreateInvoice();
    await expect(page).toHaveURL(/\/sv\/invoice\/crud$/);
  });
});
