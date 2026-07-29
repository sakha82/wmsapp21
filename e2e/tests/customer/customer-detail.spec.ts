import { test, expect } from '../../fixtures';
import { CustomerCrudPage } from '../../pages/customer/customer-crud.page';
import { CustomerDetailPage } from '../../pages/customer/customer-detail.page';
import { buildCustomer } from '../../utils/data-builders/customer.builder';
import { t } from '../../utils/translations';

test.describe('Customer Detail', () => {
  let detailPage: CustomerDetailPage;
  let customerName: string;

  test.beforeEach(async ({ page }) => {
    const crudPage = new CustomerCrudPage(page);
    await crudPage.gotoCreate();
    const data = buildCustomer();
    customerName = data.customerName;
    await crudPage.fillForm(data);
    await crudPage.submit();
    await expect(page).toHaveURL(/\/sv\/customer\/details\/(\d+)/, { timeout: 15_000 });

    detailPage = new CustomerDetailPage(page);
  });

  test('customer information is displayed correctly', async ({ page }) => {
    await expect(page.locator('body')).toContainText(customerName);
    await expect(detailPage.customerTypeTag).toBeVisible();
  });

  test('address and contact information are shown', async () => {
    await expect(detailPage.infoValue(t('address'))).toBeVisible();
    await expect(detailPage.infoValue(t('telephone'))).toBeVisible();
    await expect(detailPage.infoValue(t('email'))).toBeVisible();
  });

  test('work orders, offers and invoices tabs are present and switchable', async () => {
    const workOrdersTab = detailPage.tab(t('workorders'));
    const offersTab = detailPage.tab(t('offers'));
    const invoicesTab = detailPage.tab(t('invoices'));

    await expect(workOrdersTab).toBeVisible();
    await expect(offersTab).toBeVisible();
    await expect(invoicesTab).toBeVisible();

    await detailPage.openTab(t('offers'));
    await expect(offersTab).toHaveAttribute('aria-selected', 'true');

    await detailPage.openTab(t('invoices'));
    await expect(invoicesTab).toHaveAttribute('aria-selected', 'true');

    await detailPage.openTab(t('workorders'));
    await expect(workOrdersTab).toHaveAttribute('aria-selected', 'true');
  });

  test('edit customer button navigates to the edit form', async ({ page }) => {
    await detailPage.clickEditCustomer();
    await expect(page).toHaveURL(/\/sv\/customer\/crud(;customerId=\d+)?$/);
  });
});
