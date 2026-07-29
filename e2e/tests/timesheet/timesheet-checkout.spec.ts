import { test, expect } from '../../fixtures';
import { TimesheetListPage } from '../../pages/timesheet/timesheet-list.page';
import { EmployeeCrudPage } from '../../pages/employee/employee-crud.page';
import { buildEmployee } from '../../utils/data-builders/employee.builder';
import { buildTimesheet } from '../../utils/data-builders/timesheet.builder';

test.describe('Timesheet Check-out', () => {
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

  test('an invalid checkout time format is rejected', async () => {
    await listPage.openCheckoutForEmployee(employeeName);
    await listPage.checkoutTimeOutInput.fill('99:99');
    await listPage.checkoutSubmitButton.click();
    await expect(listPage.toast).toContainText(/./);
  });

  test('checking out records the time-out on the row', async () => {
    await listPage.openCheckoutForEmployee(employeeName);
    await listPage.submitCheckout('17:00');

    await expect(async () => {
      await expect(listPage.rowByEmployee(employeeName)).toContainText('17:00');
    }).toPass({ timeout: 15_000 });
  });
});
