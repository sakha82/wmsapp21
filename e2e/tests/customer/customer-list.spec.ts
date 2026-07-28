import { test, expect } from '../../fixtures';
import { CustomerListPage } from '../../pages/customer/customer-list.page';
import { t } from '../../utils/translations';

test.describe('Customer List', () => {
  let listPage: CustomerListPage;

  test.beforeEach(async ({ page }) => {
    listPage = new CustomerListPage(page);
    await listPage.goto();
  });

  test('page loads successfully and grid loads data', async ({ page }) => {
    await expect(page).toHaveURL(/\/sv\/customer$/);
    await expect(listPage.table.root).toBeVisible();
    expect(await listPage.table.rowCount()).toBeGreaterThan(0);
  });

  test('loading indicator disappears after data loads', async ({ page }) => {
    await expect(page.locator('app-generic-loader .p-progress-spinner')).toBeHidden();
  });

  test('no duplicate customer rows appear', async () => {
    await listPage.table.expectNoDuplicateRows();
  });

  test('sorting by customer id toggles sort order', async () => {
    const idHeader = t('id');
    await listPage.table.sortBy(idHeader);
    expect(await listPage.table.isSortedBy(idHeader)).toBe(true);

    const firstIdAscending = (await listPage.table.rows.first().locator('td').first().innerText()).trim();

    await listPage.table.sortBy(idHeader);
    const firstIdDescending = (await listPage.table.rows.first().locator('td').first().innerText()).trim();

    expect(firstIdAscending).not.toBe(firstIdDescending);
  });

  test('pagination navigates to the next page when more than one page exists', async () => {
    const nextButton = listPage.table.root.locator('.p-paginator-next');
    const isDisabled = await nextButton.isDisabled();
    test.skip(isDisabled, 'Not enough customers in this environment to exercise pagination.');

    const firstPageReport = await listPage.table.currentPageReportText();
    await listPage.table.goToNextPage();
    const secondPageReport = await listPage.table.currentPageReportText();

    expect(secondPageReport).not.toBe(firstPageReport);
  });

  test('customer name filter returns matching results', async () => {
    const firstRowName = (await listPage.table.rows.first().locator('td').nth(1).innerText()).trim();
    const searchTerm = firstRowName.slice(0, Math.min(4, firstRowName.length));

    await listPage.searchByName(searchTerm);
    await expect(async () => {
      const names = await listPage.table.rows.locator('td:nth-child(2)').allInnerTexts();
      expect(names.length).toBeGreaterThan(0);
      for (const name of names) {
        expect(name.toLowerCase()).toContain(searchTerm.toLowerCase());
      }
    }).toPass();
  });

  test('empty/no-match search shows no rows', async () => {
    await listPage.searchByName('zzz-no-such-customer-zzz');
    await expect(listPage.table.rows).toHaveCount(0);
  });

  test('clearing the name search restores the full list', async () => {
    const originalCount = await listPage.table.rowCount();

    await listPage.searchByName('zzz-no-such-customer-zzz');
    await expect(listPage.table.rows).toHaveCount(0);

    await listPage.clearNameSearch();
    await expect(async () => {
      expect(await listPage.table.rowCount()).toBe(originalCount);
    }).toPass();
  });

  test('customer type filter narrows the list and clear restores it', async () => {
    const originalCount = await listPage.table.rowCount();
    const optionText = await listPage.customerTypeFilter.root.locator('.p-select-label').innerText();
    test.skip(!optionText, 'No customer types configured in this environment.');

    await listPage.customerTypeFilter.open();
    const firstOption = listPage.page.getByRole('option').first();
    const label = (await firstOption.innerText()).trim();
    await firstOption.click();

    await expect(async () => {
      const rowCount = await listPage.table.rowCount();
      expect(rowCount).toBeLessThanOrEqual(originalCount);
    }).toPass();

    await listPage.customerTypeFilter.clear();
    await expect(async () => {
      expect(await listPage.table.rowCount()).toBe(originalCount);
    }).toPass();

    void label; // kept for potential per-row assertion once type is surfaced in a column consistently
  });
});
