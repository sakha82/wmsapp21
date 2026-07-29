import { test, expect } from '../../fixtures';
import { EmployeeCrudPage } from '../../pages/employee/employee-crud.page';
import { buildEmployee } from '../../utils/data-builders/employee.builder';

test.describe('Create Employee', () => {
  let crudPage: EmployeeCrudPage;

  test.beforeEach(async ({ page }) => {
    crudPage = new EmployeeCrudPage(page);
    await crudPage.gotoCreate();
  });

  test('create screen opens with the expected fields', async () => {
    await expect(crudPage.fullNameInput).toBeVisible();
    await expect(crudPage.personNumberInput).toBeVisible();
    await expect(crudPage.emailInput).toBeVisible();
    await expect(crudPage.telephoneInput).toBeVisible();
    await expect(crudPage.submitButton).toBeVisible();
    await expect(crudPage.cancelButton).toBeVisible();
  });

  test('submitting without required fields shows validation errors', async () => {
    await crudPage.submit();
    await expect(crudPage.fieldInvalid('fullName')).toBeVisible();
    await expect(crudPage.fieldInvalid('personNumber')).toBeVisible();
    await expect(crudPage.fieldInvalid('telephone')).toBeVisible();
  });

  test('a person number that is not exactly 12 digits is rejected', async () => {
    const data = buildEmployee();
    await crudPage.fillForm({ ...data, personNumber: '12345' });
    await crudPage.submit();
    await expect(crudPage.toast).toContainText(/./);
    await expect(crudPage.page).toHaveURL(/\/sv\/employee\/crud$/);
  });

  test('invalid email format is rejected', async () => {
    const data = buildEmployee();
    await crudPage.fillForm({ ...data, email: 'not-an-email' });
    await crudPage.submit();
    await expect(crudPage.fieldInvalid('email')).toBeVisible();
  });

  test('cancel button returns to the employee list without saving', async ({ page }) => {
    const data = buildEmployee();
    await crudPage.fillForm(data);
    await crudPage.cancel();
    await expect(page).toHaveURL(/\/sv\/employee$/);
  });

  test('valid data creates the employee and redirects to the list', async ({ page }) => {
    const data = buildEmployee();
    await crudPage.fillForm(data);
    await crudPage.submit();

    await expect(page).toHaveURL(/\/sv\/employee$/, { timeout: 15_000 });
    await expect(page.locator('body')).toContainText(data.fullName);
  });

  test('creating an employee with a full name that already exists is rejected', async ({ page }) => {
    const data = buildEmployee();
    await crudPage.fillForm(data);
    await crudPage.submit();
    await expect(page).toHaveURL(/\/sv\/employee$/, { timeout: 15_000 });

    // Attempt to create a second employee with the exact same full name.
    await crudPage.gotoCreate();
    await crudPage.fillForm({ ...buildEmployee(), fullName: data.fullName });
    await crudPage.submit();

    await expect(page).toHaveURL(/\/sv\/employee\/crud$/);
    await expect(crudPage.toast).toContainText(/./);
  });
});
