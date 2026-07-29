import { test, expect } from '../../fixtures';
import { OfferCrudPage } from '../../pages/offer/offer-crud.page';
import { CustomerCrudPage } from '../../pages/customer/customer-crud.page';
import { buildCustomer } from '../../utils/data-builders/customer.builder';
import { buildOffer } from '../../utils/data-builders/offer.builder';

test.describe('Create Offer', () => {
  let crudPage: OfferCrudPage;
  let customerName: string;

  test.beforeEach(async ({ page }) => {
    const customerCrud = new CustomerCrudPage(page);
    await customerCrud.gotoCreate();
    const customer = buildCustomer();
    customerName = customer.customerName;
    await customerCrud.fillForm(customer);
    await customerCrud.submit();
    await expect(page).toHaveURL(/\/sv\/customer\/details\/\d+/, { timeout: 15_000 });

    crudPage = new OfferCrudPage(page);
    await crudPage.gotoCreate();
  });

  test('create screen opens with the expected fields', async () => {
    await expect(crudPage.customerAutocompleteInput).toBeVisible();
    await expect(crudPage.validFromInput).toBeVisible();
    await expect(crudPage.vehiclePlateInput).toBeVisible();
    await expect(crudPage.submitButton).toBeVisible();
    await expect(crudPage.cancelButton).toBeVisible();
  });

  test('submitting without a customer selected is rejected', async () => {
    const data = buildOffer();
    await crudPage.fillValidFrom(data.validFrom);
    await crudPage.vehiclePlateInput.fill(data.vehiclePlate);
    await crudPage.useTextOnlyDetailRow(data.detailText);
    await crudPage.submit();
    await expect(crudPage.toast).toContainText(/./);
    await expect(crudPage.page).toHaveURL(/\/sv\/offer\/crud/);
  });

  test('cancel button returns to the previous page without saving', async ({ page }) => {
    const data = buildOffer();
    await crudPage.selectCustomer(customerName);
    await crudPage.fillValidFrom(data.validFrom);
    await crudPage.cancel();
    await expect(page).not.toHaveURL(/\/sv\/offer\/crud$/);
  });

  test('valid data creates the offer and redirects to its detail page', async ({ page }) => {
    const data = buildOffer();
    await crudPage.fillForm(customerName, data);
    await crudPage.submit();

    await expect(page).toHaveURL(/\/sv\/offer\/details\/\d+/, { timeout: 15_000 });
  });
});
