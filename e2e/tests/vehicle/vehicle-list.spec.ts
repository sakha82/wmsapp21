import { test, expect } from '../../fixtures';
import { VehicleListPage } from '../../pages/vehicle/vehicle-list.page';
import { OfferCrudPage } from '../../pages/offer/offer-crud.page';
import { CustomerCrudPage } from '../../pages/customer/customer-crud.page';
import { buildCustomer } from '../../utils/data-builders/customer.builder';
import { buildOffer } from '../../utils/data-builders/offer.builder';

// Vehicle is a search/lookup page, not a CRUD module - there's no dedicated "create a vehicle"
// flow. A vehicle only becomes searchable once it's referenced by a real Offer/Invoice/WorkOrder,
// so the full-flow spec below creates an Offer with a known vehiclePlate first (reusing the Offer
// module's own page objects/builders) and searches for that.
test.describe('Vehicle Search', () => {
  let vehiclePage: VehicleListPage;

  test.beforeEach(async ({ page }) => {
    vehiclePage = new VehicleListPage(page);
    await vehiclePage.goto();
  });

  test('page loads successfully', async ({ page }) => {
    await expect(page).toHaveURL(/\/sv\/vehicle/);
    await expect(vehiclePage.searchInput).toBeVisible();
  });

  test('loading indicator disappears after data loads', async ({ page }) => {
    await expect(page.locator('app-generic-loader .p-progress-spinner')).toBeHidden();
  });

  test('searching for an unknown plate returns no suggestions', async ({ page }) => {
    await vehiclePage.searchFor(`NOTREAL${Date.now()}`);
    await expect(page.getByRole('option')).toHaveCount(0);
  });

  // VehicleListComponent.keyupVehicle()/loadvehicle() call CoreService.getVehicleList() /
  // getVehicleInfo(), which GET /api/Core/vehicle-list and /api/Core/vehicle-info - neither
  // exists in wms-api (confirmed via direct curl: both 404). The whole Vehicle search feature is
  // non-functional end-to-end, not just untested - selecting ANY vehicle plate, including one
  // from a freshly-created real Offer, returns no suggestions at all. This contradicts
  // COMPLETED_TASKS.md's DB-migration note that the backing `vehiclesearchprojection` table had
  // "no live API caller" - the frontend clearly does call something that would need it; see
  // DECISIONS.md's correction entry. Standing up the endpoints is a real feature build, not a bug
  // fix - left as an upcoming task per user direction (2026-07-30) rather than built here.
  // Un-skip once the endpoints exist - the setup/assertions below are otherwise ready to run.
  test.skip('selecting a vehicle with a real offer shows its info and offer history - blocked on missing backend endpoints', async ({ page }) => {
    const customerCrud = new CustomerCrudPage(page);
    await customerCrud.gotoCreate();
    const customer = buildCustomer();
    await customerCrud.fillForm(customer);
    await customerCrud.submit();
    await expect(page).toHaveURL(/\/sv\/customer\/details\/\d+/, { timeout: 15_000 });

    const offerCrud = new OfferCrudPage(page);
    await offerCrud.gotoCreate();
    const offerData = buildOffer();
    await offerCrud.fillForm(customer.customerName, offerData);
    await offerCrud.submit();
    await expect(page).toHaveURL(/\/sv\/offer\/details\/\d+/, { timeout: 15_000 });

    await vehiclePage.goto();
    await vehiclePage.selectVehicle(offerData.vehiclePlate);

    await expect(vehiclePage.vehicleInformation).toBeVisible({ timeout: 15_000 });
    await expect(vehiclePage.customerRows).toHaveCount(1);
    await expect(vehiclePage.customerRows).toContainText(customer.customerName);
    await expect(vehiclePage.offersCategoryRow).toBeVisible();
  });
});
