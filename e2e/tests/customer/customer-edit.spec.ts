import { test, expect } from '../../fixtures';
import { CustomerCrudPage } from '../../pages/customer/customer-crud.page';
import { CustomerDetailPage } from '../../pages/customer/customer-detail.page';
import { buildCustomer } from '../../utils/data-builders/customer.builder';

test.describe('Edit Customer', () => {
  test('updating a customer persists the new values', async ({ page }) => {
    const crudPage = new CustomerCrudPage(page);
    await crudPage.gotoCreate();
    const original = buildCustomer();
    await crudPage.fillForm(original);
    await crudPage.submit();
    await expect(page).toHaveURL(/\/sv\/customer\/details\/(\d+)/, { timeout: 15_000 });
    const customerId = page.url().match(/\/details\/(\d+)/)?.[1];
    expect(customerId).toBeTruthy();

    const detailPage = new CustomerDetailPage(page);
    await detailPage.clickEditCustomer();
    await expect(page).toHaveURL(/\/sv\/customer\/crud(;customerId=\d+)?$/);

    const updatedTelephone = '0709999999';
    await crudPage.telephoneInput.fill(updatedTelephone);
    await crudPage.submit();

    await expect(page).toHaveURL(new RegExp(`/sv/customer/details/${customerId}$`), { timeout: 15_000 });
    await expect(page.locator('body')).toContainText(updatedTelephone);
  });

  test('cancelling an edit discards changes', async ({ page }) => {
    const crudPage = new CustomerCrudPage(page);
    await crudPage.gotoCreate();
    const original = buildCustomer();
    await crudPage.fillForm(original);
    await crudPage.submit();
    await expect(page).toHaveURL(/\/sv\/customer\/details\/(\d+)/, { timeout: 15_000 });

    const detailPage = new CustomerDetailPage(page);
    await detailPage.clickEditCustomer();
    await crudPage.telephoneInput.fill('0700000000');
    await crudPage.cancel();

    await expect(page).toHaveURL(/\/sv\/customer$/);
  });

  test('validation still applies when editing an existing customer', async ({ page }) => {
    const crudPage = new CustomerCrudPage(page);
    await crudPage.gotoCreate();
    const original = buildCustomer();
    await crudPage.fillForm(original);
    await crudPage.submit();
    await expect(page).toHaveURL(/\/sv\/customer\/details\/(\d+)/, { timeout: 15_000 });

    const detailPage = new CustomerDetailPage(page);
    await detailPage.clickEditCustomer();

    await crudPage.customerNameInput.fill('');
    await crudPage.submit();

    await expect(crudPage.fieldInvalid('customerName')).toBeVisible();
    await expect(page).toHaveURL(/\/sv\/customer\/crud(;customerId=\d+)?$/);
  });
});
