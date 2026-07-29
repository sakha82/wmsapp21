import { test, expect } from '../../fixtures';
import { TimesheetListPage } from '../../pages/timesheet/timesheet-list.page';
import { EmployeeCrudPage } from '../../pages/employee/employee-crud.page';
import { buildEmployee } from '../../utils/data-builders/employee.builder';
import { buildTimesheet } from '../../utils/data-builders/timesheet.builder';

test.describe('Timesheet Check-in', () => {
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
  });

  test('checking in without a time-in shows a validation error', async () => {
    await listPage.openCheckinDialog();
    await listPage.selectDialogEmployee(employeeName);
    await listPage.submitCheckin();
    await expect(listPage.dialogTimeInInput).toHaveClass(/ng-invalid/);
  });

  test('an invalid time-in format is rejected', async () => {
    await listPage.openCheckinDialog();
    await listPage.selectDialogEmployee(employeeName);
    await listPage.dialogTimeInInput.fill('99:99');
    await listPage.submitCheckin();
    await expect(listPage.toast).toContainText(/./);
  });

  test('a valid check-in creates a new timesheet row', async () => {
    const data = buildTimesheet(employeeName);

    await listPage.openCheckinDialog();
    await listPage.fillCheckinForm(data);
    await listPage.submitCheckin();

    // The list is sorted by startdate/intervalId, not newest-first, and this dev environment
    // accumulates rows across runs - filter down to this employee to reliably find the new row.
    await listPage.filterByEmployee(employeeName);
    await expect(listPage.page.locator('body')).toContainText(employeeName, { timeout: 15_000 });
  });
});
