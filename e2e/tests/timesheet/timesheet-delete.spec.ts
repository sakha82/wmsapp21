import { test, expect } from '../../fixtures';
import { TimesheetListPage } from '../../pages/timesheet/timesheet-list.page';
import { EmployeeCrudPage } from '../../pages/employee/employee-crud.page';
import { buildEmployee } from '../../utils/data-builders/employee.builder';
import { buildTimesheet } from '../../utils/data-builders/timesheet.builder';

test.describe('Timesheet Delete', () => {
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

  test('deleting without a comment shows a validation error', async () => {
    await listPage.openDeleteForEmployee(employeeName);
    await listPage.deleteSubmitButton.click();
    await expect(listPage.deleteCommentsTextarea).toHaveClass(/ng-invalid/);
  });

  test('a soft-delete marks the timesheet row inactive', async () => {
    await listPage.openDeleteForEmployee(employeeName);
    await listPage.submitDelete('E2E delete reason');

    await expect(async () => {
      // The trash-can action only renders while isActive — once deleted it's gone from the row.
      await expect(listPage.rowByEmployee(employeeName).getByTestId('timesheet-delete-open-button')).toHaveCount(0);
    }).toPass({ timeout: 15_000 });
  });
});
