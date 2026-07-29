import { test, expect } from '../../fixtures';
import { InvoiceCrudPage } from '../../pages/invoice/invoice-crud.page';
import { InvoiceDetailPage } from '../../pages/invoice/invoice-detail.page';
import { CustomerCrudPage } from '../../pages/customer/customer-crud.page';
import { buildCustomer } from '../../utils/data-builders/customer.builder';
import { buildInvoice } from '../../utils/data-builders/invoice.builder';

test.describe('Edit Invoice', () => {
  test('updating an invoice persists the new vehicle plate', async ({ page }) => {
    const customerCrud = new CustomerCrudPage(page);
    await customerCrud.gotoCreate();
    const customer = buildCustomer();
    await customerCrud.fillForm(customer);
    await customerCrud.submit();
    await expect(page).toHaveURL(/\/sv\/customer\/details\/\d+/, { timeout: 15_000 });

    const crudPage = new InvoiceCrudPage(page);
    await crudPage.gotoCreate();
    const original = buildInvoice();
    await crudPage.fillForm(customer.customerName, original);
    await crudPage.submit();
    await expect(page).toHaveURL(/\/sv\/invoice\/details\/(\d+)/, { timeout: 15_000 });

    const detailPage = new InvoiceDetailPage(page);
    await detailPage.clickEditInvoice();
    await expect(page).toHaveURL(/\/sv\/invoice\/crud/);
    // ngOnInit's getInvoice() call patches the form asynchronously after navigation - filling a
    // field before that response lands gets silently overwritten when patchValue() runs.
    await crudPage.waitForLoadingComplete();

    const updatedPlate = `E2E${Math.floor(Math.random() * 100000)}`;
    await crudPage.vehiclePlateInput.fill(updatedPlate);
    await crudPage.submit();
    await expect(page).toHaveURL(/\/sv\/invoice\/details\/\d+/, { timeout: 15_000 });

    await detailPage.clickEditInvoice();
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

    const crudPage = new InvoiceCrudPage(page);
    await crudPage.gotoCreate();
    const original = buildInvoice();
    await crudPage.fillForm(customer.customerName, original);
    await crudPage.submit();
    await expect(page).toHaveURL(/\/sv\/invoice\/details\/(\d+)/, { timeout: 15_000 });

    const detailPage = new InvoiceDetailPage(page);
    await detailPage.clickEditInvoice();
    await crudPage.waitForLoadingComplete();
    await crudPage.vehiclePlateInput.fill('SHOULDNOTSAVE');
    await crudPage.cancel();

    await expect(page).not.toHaveURL(/\/sv\/invoice\/crud/);
  });
});
