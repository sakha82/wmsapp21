import { test, expect } from '../../fixtures';
import { DigitalServiceListPage } from '../../pages/digitalservice/digitalservice-list.page';
import { buildDigitalService } from '../../utils/data-builders/digitalservice.builder';

test.describe('Digital Service List', () => {
  let listPage: DigitalServiceListPage;

  test.beforeEach(async ({ page }) => {
    listPage = new DigitalServiceListPage(page);
    await listPage.goto();
  });

  test('page loads successfully and grid loads data', async ({ page }) => {
    await expect(page).toHaveURL(/\/sv\/digitalservice/);
    await expect(listPage.table).toBeVisible();
  });

  test('loading indicator disappears after data loads', async ({ page }) => {
    await expect(page.locator('app-generic-loader .p-progress-spinner')).toBeHidden();
  });

  test('create digital service button opens the create dialog', async () => {
    await listPage.openCreateDialog();
    await expect(listPage.submitButton).toBeVisible();
  });

  test('search filters the tree to the matching vehicle plate', async () => {
    const data = buildDigitalService();
    await listPage.openCreateDialog();
    await listPage.fillForm(data);
    await listPage.submit();
    await listPage.confirmCreate();
    await expect(listPage.toast).toContainText(/./);

    await listPage.searchFor(data.vehiclePlate);
    await expect(listPage.parentRow(data.vehiclePlate)).toBeVisible({ timeout: 15_000 });
  });

  test('expanding a vehicle row loads its service history', async () => {
    const data = buildDigitalService();
    await listPage.openCreateDialog();
    await listPage.fillForm(data);
    await listPage.submit();
    await listPage.confirmCreate();
    await expect(listPage.toast).toContainText(/./);

    await listPage.searchFor(data.vehiclePlate);
    await expect(listPage.parentRow(data.vehiclePlate)).toBeVisible({ timeout: 15_000 });

    await listPage.expandRow(data.vehiclePlate);
    await expect(listPage.table.getByTestId('digitalservice-header-row')).toBeVisible({ timeout: 15_000 });
    await expect(listPage.table.getByTestId('digitalservice-data-row')).toBeVisible();
  });
});
