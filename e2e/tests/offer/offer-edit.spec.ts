import { test, expect } from '../../fixtures';
import { OfferCrudPage } from '../../pages/offer/offer-crud.page';
import { OfferDetailPage } from '../../pages/offer/offer-detail.page';
import { CustomerCrudPage } from '../../pages/customer/customer-crud.page';
import { buildCustomer } from '../../utils/data-builders/customer.builder';
import { buildOffer } from '../../utils/data-builders/offer.builder';

test.describe('Edit Offer', () => {
  test('updating an offer persists the new vehicle plate', async ({ page }) => {
    const customerCrud = new CustomerCrudPage(page);
    await customerCrud.gotoCreate();
    const customer = buildCustomer();
    await customerCrud.fillForm(customer);
    await customerCrud.submit();
    await expect(page).toHaveURL(/\/sv\/customer\/details\/\d+/, { timeout: 15_000 });

    const crudPage = new OfferCrudPage(page);
    await crudPage.gotoCreate();
    const original = buildOffer();
    await crudPage.fillForm(customer.customerName, original);
    await crudPage.submit();
    await expect(page).toHaveURL(/\/sv\/offer\/details\/(\d+)/, { timeout: 15_000 });

    const detailPage = new OfferDetailPage(page);
    await detailPage.clickEditOffer();
    await expect(page).toHaveURL(/\/sv\/offer\/crud/);
    // ngOnInit's getOffer() call patches the form asynchronously after navigation - filling a
    // field before that response lands gets silently overwritten when patchValue() runs.
    await crudPage.waitForLoadingComplete();

    const updatedPlate = `E2E${Math.floor(Math.random() * 100000)}`;
    await crudPage.vehiclePlateInput.fill(updatedPlate);
    await crudPage.submit();
    await expect(page).toHaveURL(/\/sv\/offer\/details\/\d+/, { timeout: 15_000 });

    await detailPage.clickEditOffer();
    await crudPage.waitForLoadingComplete();
    await expect(crudPage.vehiclePlateInput).toHaveValue(updatedPlate);
  });

  test('cancelling an edit discards changes', async ({ page }) => {
    const customerCrud = new CustomerCrudPage(page);
    await customerCrud.gotoCreate();
    const customer = buildCustomer();
    await customerCrud.fillForm(customer);
    await customerCrud.submit();
    await expect(page).toHaveURL(/\/sv\/customer\/details\/\d+/, { timeout: 15_000 });

    const crudPage = new OfferCrudPage(page);
    await crudPage.gotoCreate();
    const original = buildOffer();
    await crudPage.fillForm(customer.customerName, original);
    await crudPage.submit();
    await expect(page).toHaveURL(/\/sv\/offer\/details\/(\d+)/, { timeout: 15_000 });

    const detailPage = new OfferDetailPage(page);
    await detailPage.clickEditOffer();
    await crudPage.waitForLoadingComplete();
    await crudPage.vehiclePlateInput.fill('SHOULDNOTSAVE');
    await crudPage.cancel();

    await expect(page).not.toHaveURL(/\/sv\/offer\/crud/);
  });
});
