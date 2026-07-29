import { test, expect } from '../../fixtures';
import { InvoiceCrudPage } from '../../pages/invoice/invoice-crud.page';
import { CustomerCrudPage } from '../../pages/customer/customer-crud.page';
import { buildCustomer } from '../../utils/data-builders/customer.builder';
import { buildInvoice } from '../../utils/data-builders/invoice.builder';

test.describe('Create Invoice', () => {
  let crudPage: InvoiceCrudPage;
  let customerName: string;

  test.beforeEach(async ({ page }) => {
    const customerCrud = new CustomerCrudPage(page);
    await customerCrud.gotoCreate();
    const customer = buildCustomer();
    customerName = customer.customerName;
    await customerCrud.fillForm(customer);
    await customerCrud.submit();
    await expect(page).toHaveURL(/\/sv\/customer\/details\/\d+/, { timeout: 15_000 });

    crudPage = new InvoiceCrudPage(page);
    await crudPage.gotoCreate();
  });

  test('create screen opens with the expected fields', async () => {
    await expect(crudPage.customerAutocompleteInput).toBeVisible();
    await expect(crudPage.invoiceDateInput).toBeVisible();
    await expect(crudPage.vehiclePlateInput).toBeVisible();
    await expect(crudPage.submitButton).toBeVisible();
    await expect(crudPage.cancelButton).toBeVisible();
  });

  test('submitting without a customer selected is rejected', async () => {
    const data = buildInvoice();
    await crudPage.fillInvoiceDate(data.invoiceDate);
    await crudPage.useTextOnlyDetailRow(data.detailText);
    await crudPage.submit();
    await expect(crudPage.toast).toContainText(/./);
    await expect(crudPage.page).toHaveURL(/\/sv\/invoice\/crud$/);
  });

  test('cancel button returns to the previous page without saving', async ({ page }) => {
    const data = buildInvoice();
    await crudPage.selectCustomer(customerName);
    await crudPage.fillInvoiceDate(data.invoiceDate);
    await crudPage.cancel();
    await expect(page).not.toHaveURL(/\/sv\/invoice\/crud$/);
  });

  test('valid data creates the invoice and redirects to its detail page', async ({ page }) => {
    const data = buildInvoice();
    await crudPage.fillForm(customerName, data);
    await crudPage.submit();

    await expect(page).toHaveURL(/\/sv\/invoice\/details\/\d+/, { timeout: 15_000 });
  });
});
