import { test, expect } from '../../fixtures';
import { TimesheetListPage } from '../../pages/timesheet/timesheet-list.page';
import { EmployeeCrudPage } from '../../pages/employee/employee-crud.page';
import { buildEmployee } from '../../utils/data-builders/employee.builder';
import { buildTimesheet } from '../../utils/data-builders/timesheet.builder';

test.describe('Timesheet Comments', () => {
  let listPage: TimesheetListPage;
  let employeeName: string;

  test.beforeEach(async ({ page }) => {
    const crudPage = new EmployeeCrudPage(page);
    await crudPage.gotoCreate();
    const employee = buildEmployee();
    employeeName = employee.fullName;
    await crudPage.fillForm(employee);
    await crudPage.submit();
    await expect(page).toHaveURL(/\/sv\/employee$/, { timeout: 15_000 });

    listPage = new TimesheetListPage(page);
    await listPage.goto();
    await listPage.openCheckinDialog();
    await listPage.fillCheckinForm(buildTimesheet(employeeName));
    await listPage.submitCheckin();
    // The list is sorted by startdate/intervalId, not newest-first, and this dev environment
    // accumulates rows across runs - filter down to this employee to reliably find the new row.
    await listPage.filterByEmployee(employeeName);
    await expect(listPage.page.locator('body')).toContainText(employeeName, { timeout: 15_000 });
  });

  test('updating the comment on a timesheet persists it', async () => {
    await listPage.openCommentsForEmployee(employeeName);
    const updated = `E2E updated comment ${Date.now()}`;
    await listPage.commentsTextarea.fill(updated);
    await listPage.commentsSubmitButton.click();
    // updateComment() reloads the list asynchronously (fire-and-forget, not awaited by the
    // component) before re-rendering the row's bound timesheet object - reopening the popover
    // before that reload lands would read the pre-update value straight off the stale row.
    await listPage.waitForLoadingComplete();

    await listPage.openCommentsForEmployee(employeeName);
    await expect(listPage.commentsTextarea).toHaveValue(updated);
  });
});
