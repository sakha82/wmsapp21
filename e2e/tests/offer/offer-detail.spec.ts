import { test, expect } from '../../fixtures';
import { OfferCrudPage } from '../../pages/offer/offer-crud.page';
import { OfferDetailPage } from '../../pages/offer/offer-detail.page';
import { CustomerCrudPage } from '../../pages/customer/customer-crud.page';
import { buildCustomer } from '../../utils/data-builders/customer.builder';
import { buildOffer } from '../../utils/data-builders/offer.builder';

test.describe('Offer Detail', () => {
  let detailPage: OfferDetailPage;

  test.beforeEach(async ({ page }) => {
    const customerCrud = new CustomerCrudPage(page);
    await customerCrud.gotoCreate();
    const customer = buildCustomer();
    await customerCrud.fillForm(customer);
    await customerCrud.submit();
    await expect(page).toHaveURL(/\/sv\/customer\/details\/\d+/, { timeout: 15_000 });

    const crudPage = new OfferCrudPage(page);
    await crudPage.gotoCreate();
    await crudPage.fillForm(customer.customerName, buildOffer());
    await crudPage.submit();
    await expect(page).toHaveURL(/\/sv\/offer\/details\/(\d+)/, { timeout: 15_000 });

    detailPage = new OfferDetailPage(page);
  });

  test('edit offer button navigates to the edit form', async ({ page }) => {
    await detailPage.clickEditOffer();
    await expect(page).toHaveURL(/\/sv\/offer\/crud/);
  });

  test('offer history timeline is present', async ({ page }) => {
    await expect(page.locator('p-timeline')).toBeVisible();
  });
});
