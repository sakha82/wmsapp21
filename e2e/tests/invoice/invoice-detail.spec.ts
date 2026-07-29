import { test, expect } from '../../fixtures';
import { InvoiceCrudPage } from '../../pages/invoice/invoice-crud.page';
import { InvoiceDetailPage } from '../../pages/invoice/invoice-detail.page';
import { CustomerCrudPage } from '../../pages/customer/customer-crud.page';
import { buildCustomer } from '../../utils/data-builders/customer.builder';
import { buildInvoice } from '../../utils/data-builders/invoice.builder';

test.describe('Invoice Detail', () => {
  let detailPage: InvoiceDetailPage;

  test.beforeEach(async ({ page }) => {
    const customerCrud = new CustomerCrudPage(page);
    await customerCrud.gotoCreate();
    const customer = buildCustomer();
    await customerCrud.fillForm(customer);
    await customerCrud.submit();
    await expect(page).toHaveURL(/\/sv\/customer\/details\/\d+/, { timeout: 15_000 });

    const crudPage = new InvoiceCrudPage(page);
    await crudPage.gotoCreate();
    await crudPage.fillForm(customer.customerName, buildInvoice());
    await crudPage.submit();
    await expect(page).toHaveURL(/\/sv\/invoice\/details\/(\d+)/, { timeout: 15_000 });

    detailPage = new InvoiceDetailPage(page);
  });

  test('edit invoice button navigates to the edit form', async ({ page }) => {
    await detailPage.clickEditInvoice();
    await expect(page).toHaveURL(/\/sv\/invoice\/crud/);
  });

  test('invoice history timeline is present', async ({ page }) => {
    await expect(page.locator('p-timeline')).toBeVisible();
  });
});
