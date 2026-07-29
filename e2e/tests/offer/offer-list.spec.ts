import { test, expect } from '../../fixtures';
import { OfferListPage } from '../../pages/offer/offer-list.page';
import { t } from '../../utils/translations';

test.describe('Offer List', () => {
  let listPage: OfferListPage;

  test.beforeEach(async ({ page }) => {
    listPage = new OfferListPage(page);
    await listPage.goto();
  });

  test('page loads successfully and grid loads data', async ({ page }) => {
    await expect(page).toHaveURL(/\/sv\/offer/);
    await expect(listPage.table.root).toBeVisible();
  });

  test('loading indicator disappears after data loads', async ({ page }) => {
    await expect(page.locator('app-generic-loader .p-progress-spinner')).toBeHidden();
  });

  test('no duplicate offer rows appear on the current page', async () => {
    await listPage.table.expectNoDuplicateRows();
  });

  test('sorting by offer id toggles sort order', async () => {
    const idHeader = t('id');
    await listPage.table.sortBy(idHeader);
    expect(await listPage.table.isSortedBy(idHeader)).toBe(true);

    const firstIdAscending = (await listPage.table.rows.first().locator('td').first().innerText()).trim();

    await listPage.table.sortBy(idHeader);
    const firstIdDescending = (await listPage.table.rows.first().locator('td').first().innerText()).trim();

    expect(firstIdAscending).not.toBe(firstIdDescending);
  });

  test('create offer button navigates to the crud form', async ({ page }) => {
    // Unlike Invoice's plain '/invoice/crud', Offer's create button navigates via
    // router.navigate(['sv/offer/crud', { offerId: 0 }]) - a matrix param, so the URL is
    // '/sv/offer/crud;offerId=0', not a clean '/sv/offer/crud'.
    await listPage.clickCreateOffer();
    await expect(page).toHaveURL(/\/sv\/offer\/crud/);
  });
});
