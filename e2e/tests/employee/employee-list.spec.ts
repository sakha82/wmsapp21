import { test, expect } from '../../fixtures';
import { EmployeeListPage } from '../../pages/employee/employee-list.page';
import { t } from '../../utils/translations';

test.describe('Employee List', () => {
  let listPage: EmployeeListPage;

  test.beforeEach(async ({ page }) => {
    listPage = new EmployeeListPage(page);
    await listPage.goto();
  });

  test('page loads successfully and grid loads data', async ({ page }) => {
    await expect(page).toHaveURL(/\/sv\/employee$/);
    await expect(listPage.table.root).toBeVisible();
    expect(await listPage.table.rowCount()).toBeGreaterThan(0);
  });

  test('loading indicator disappears after data loads', async ({ page }) => {
    await expect(page.locator('app-generic-loader .p-progress-spinner')).toBeHidden();
  });

  test('no duplicate employee rows appear', async () => {
    await listPage.table.expectNoDuplicateRows();
  });

  test('sorting by employee id toggles sort order', async () => {
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
    test.skip(isDisabled, 'Not enough employees in this environment to exercise pagination.');

    const firstPageReport = await listPage.table.currentPageReportText();
    await listPage.table.goToNextPage();
    const secondPageReport = await listPage.table.currentPageReportText();

    expect(secondPageReport).not.toBe(firstPageReport);
  });

  test('"only active employees" filter narrows the list', async () => {
    const originalCount = await listPage.table.rowCount();

    await listPage.toggleOnlyActiveEmployees();
    await expect(async () => {
      const rowCount = await listPage.table.rowCount();
      expect(rowCount).toBeLessThanOrEqual(originalCount);
    }).toPass();

    await listPage.toggleOnlyActiveEmployees();
    await expect(async () => {
      expect(await listPage.table.rowCount()).toBe(originalCount);
    }).toPass();
  });
});
