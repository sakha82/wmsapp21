import { test, expect } from '../../fixtures';
import { ProductListPage } from '../../pages/product/product-list.page';
import { t } from '../../utils/translations';

test.describe('Product List', () => {
  let listPage: ProductListPage;

  test.beforeEach(async ({ page }) => {
    listPage = new ProductListPage(page);
    await listPage.goto();
  });

  test('page loads successfully and grid loads data', async ({ page }) => {
    await expect(page).toHaveURL(/\/sv\/product/);
    await expect(listPage.table.root).toBeVisible();
  });

  test('loading indicator disappears after data loads', async ({ page }) => {
    await expect(page.locator('app-generic-loader .p-progress-spinner')).toBeHidden();
  });

  test('no duplicate product rows appear on the current page', async () => {
    // The first column is a workshop/base-catalog icon (V/B), not a unique id - the productName
    // column (3rd td) is the one that should never repeat within a page.
    await listPage.table.expectNoDuplicateRows('td:nth-child(3)');
  });

  test('sorting by product name toggles sort order', async () => {
    const nameHeader = t('productService');
    await listPage.table.sortBy(nameHeader);
    expect(await listPage.table.isSortedBy(nameHeader)).toBe(true);

    const firstNameAscending = (await listPage.table.rows.first().locator('td').nth(2).innerText()).trim();

    await listPage.table.sortBy(nameHeader);
    const firstNameDescending = (await listPage.table.rows.first().locator('td').nth(2).innerText()).trim();

    expect(firstNameAscending).not.toBe(firstNameDescending);
  });

  test('create product button opens the create dialog', async () => {
    await listPage.openCreateDialog();
    await expect(listPage.submitButton).toBeVisible();
  });
});
