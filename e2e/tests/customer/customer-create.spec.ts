import { test, expect } from '../../fixtures';
import { CustomerCrudPage } from '../../pages/customer/customer-crud.page';
import { buildCustomer } from '../../utils/data-builders/customer.builder';

test.describe('Create Customer', () => {
  let crudPage: CustomerCrudPage;

  test.beforeEach(async ({ page }) => {
    crudPage = new CustomerCrudPage(page);
    await crudPage.gotoCreate();
  });

  test('create screen opens with the expected fields', async () => {
    await expect(crudPage.customerNameInput).toBeVisible();
    await expect(crudPage.emailInput).toBeVisible();
    await expect(crudPage.telephoneInput).toBeVisible();
    await expect(crudPage.organizationNoInput).toBeVisible();
    await expect(crudPage.addressInput).toBeVisible();
    await expect(crudPage.submitButton).toBeVisible();
    await expect(crudPage.cancelButton).toBeVisible();
  });

  test('submitting without a customer name shows a validation error', async () => {
    await crudPage.submit();
    await expect(crudPage.toast).toContainText(/./); // a toast is shown
    await expect(crudPage.fieldInvalid('customerName')).toBeVisible();
  });

  test('submitting without email or telephone shows the contact-required error', async () => {
    await crudPage.customerNameInput.fill(buildCustomer().customerName);
    await crudPage.submit();
    await expect(crudPage.fieldInvalid('email')).toBeVisible();
  });

  test('customer name over 255 characters is rejected', async () => {
    const tooLong = 'A'.repeat(256);
    await crudPage.customerNameInput.fill(tooLong);
    await crudPage.telephoneInput.fill('0701234567');
    await crudPage.submit();
    await expect(crudPage.fieldInvalid('customerName')).toBeVisible();
  });

  test('invalid email format is rejected', async () => {
    const data = buildCustomer();
    await crudPage.customerNameInput.fill(data.customerName);
    await crudPage.emailInput.fill('not-an-email');
    await crudPage.submit();
    await expect(crudPage.fieldInvalid('email')).toBeVisible();
  });

  test('cancel button returns to the customer list without saving', async ({ page }) => {
    await crudPage.customerNameInput.fill(buildCustomer().customerName);
    await crudPage.cancel();
    await expect(page).toHaveURL(/\/sv\/customer$/);
  });

  test('valid data creates the customer and redirects to its detail page', async ({ page }) => {
    const data = buildCustomer();
    await crudPage.fillForm(data);
    await crudPage.submit();

    await expect(page).toHaveURL(/\/sv\/customer\/details\/\d+/, { timeout: 15_000 });
    await expect(page.locator('body')).toContainText(data.customerName);
  });

  test('creating a customer with a name that already exists is rejected', async ({ page }) => {
    const data = buildCustomer();
    await crudPage.fillForm(data);
    await crudPage.submit();
    await expect(page).toHaveURL(/\/sv\/customer\/details\/\d+/, { timeout: 15_000 });

    // Attempt to create a second customer with the exact same name.
    await crudPage.gotoCreate();
    await crudPage.fillForm(data);
    await crudPage.submit();

    await expect(page).toHaveURL(/\/sv\/customer\/crud$/);
    await expect(crudPage.toast).toContainText('Duplicate Customer');
  });
});
