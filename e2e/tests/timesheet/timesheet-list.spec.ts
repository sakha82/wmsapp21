import { test, expect } from '../../fixtures';
import { TimesheetListPage } from '../../pages/timesheet/timesheet-list.page';

test.describe('Timesheet List', () => {
  let listPage: TimesheetListPage;

  test.beforeEach(async ({ page }) => {
    listPage = new TimesheetListPage(page);
    await listPage.goto();
  });

  test('page loads successfully', async ({ page }) => {
    // The filter FormGroup's default values (year/date range/paging/sort) get synced into the
    // URL via SharedService.updateFiltersInNavigation on init, so query params are expected here.
    await expect(page).toHaveURL(/\/sv\/employment/);
    await expect(listPage.table.root).toBeVisible();
  });

  test('loading indicator disappears after data loads', async ({ page }) => {
    await expect(page.locator('app-generic-loader .p-progress-spinner')).toBeHidden();
  });

  test('check-in button opens the register-time dialog', async ({ page }) => {
    await listPage.openCheckinDialog();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(listPage.dialogSubmitButton).toBeVisible();
  });

  test('cancelling the register-time dialog closes it without saving', async ({ page }) => {
    await listPage.openCheckinDialog();
    await listPage.cancelCheckin();
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('no duplicate timesheet rows appear on the current page', async () => {
    await listPage.table.expectNoDuplicateRows();
  });
});
