import { test, expect } from '../../fixtures';
import { EmployeeCrudPage } from '../../pages/employee/employee-crud.page';
import { EmployeeListPage } from '../../pages/employee/employee-list.page';
import { buildEmployee } from '../../utils/data-builders/employee.builder';

test.describe('Edit Employee', () => {
  test('updating an employee persists the new values', async ({ page }) => {
    const crudPage = new EmployeeCrudPage(page);
    await crudPage.gotoCreate();
    const original = buildEmployee();
    await crudPage.fillForm(original);
    await crudPage.submit();
    await expect(page).toHaveURL(/\/sv\/employee$/, { timeout: 15_000 });

    const listPage = new EmployeeListPage(page);
    await listPage.editEmployee(original.fullName);
    await expect(page).toHaveURL(/\/sv\/employee\/crud\/\d+$/);

    const updatedTelephone = '0709999999';
    await crudPage.telephoneInput.fill(updatedTelephone);
    await crudPage.submit();

    await expect(page).toHaveURL(/\/sv\/employee$/, { timeout: 15_000 });
    await listPage.editEmployee(original.fullName);
    await expect(crudPage.telephoneInput).toHaveValue(updatedTelephone);
  });

  test('cancelling an edit discards changes', async ({ page }) => {
    const crudPage = new EmployeeCrudPage(page);
    await crudPage.gotoCreate();
    const original = buildEmployee();
    await crudPage.fillForm(original);
    await crudPage.submit();
    await expect(page).toHaveURL(/\/sv\/employee$/, { timeout: 15_000 });

    const listPage = new EmployeeListPage(page);
    await listPage.editEmployee(original.fullName);
    await crudPage.telephoneInput.fill('0700000000');
    await crudPage.cancel();

    await expect(page).toHaveURL(/\/sv\/employee$/);
  });

  test('validation still applies when editing an existing employee', async ({ page }) => {
    const crudPage = new EmployeeCrudPage(page);
    await crudPage.gotoCreate();
    const original = buildEmployee();
    await crudPage.fillForm(original);
    await crudPage.submit();
    await expect(page).toHaveURL(/\/sv\/employee$/, { timeout: 15_000 });

    const listPage = new EmployeeListPage(page);
    await listPage.editEmployee(original.fullName);

    await crudPage.fullNameInput.fill('');
    await crudPage.submit();

    await expect(crudPage.fieldInvalid('fullName')).toBeVisible();
    await expect(page).toHaveURL(/\/sv\/employee\/crud\/\d+$/);
  });
});
