import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';
import { InvoiceFormData } from '../../utils/data-builders/invoice.builder';

export class InvoiceCrudPage extends BasePage {
  readonly customerAutocompleteInput: Locator;
  readonly invoiceDateInput: Locator;
  readonly dueDateInput: Locator;
  readonly vehiclePlateInput: Locator;
  readonly yourRefInput: Locator;
  readonly addTextButton: Locator;
  readonly addProductButton: Locator;
  readonly removeDetailRowButtons: Locator;
  readonly detailTextContentTextareas: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly toast: Locator;

  constructor(page: Page) {
    super(page);
    this.customerAutocompleteInput = page.getByTestId('invoice-customer-autocomplete').locator('input');
    this.invoiceDateInput = page.locator('p-date-picker[formcontrolname="invoiceDate"] input');
    this.dueDateInput = page.locator('input[formcontrolname="dueDate"]');
    this.vehiclePlateInput = page.locator('input[formcontrolname="vehiclePlate"]');
    this.yourRefInput = page.locator('input[formcontrolname="yourRef"]');
    this.addTextButton = page.getByTestId('invoice-add-text-button');
    this.addProductButton = page.getByTestId('invoice-add-product-button');
    this.removeDetailRowButtons = page.getByTestId('invoice-remove-detail-row-button');
    this.detailTextContentTextareas = page.getByTestId('invoice-detail-text-content');
    this.submitButton = page.getByTestId('invoice-submit-button');
    this.cancelButton = page.getByTestId('invoice-cancel-button');
    this.toast = page.locator('p-toast');
  }

  async gotoCreate(): Promise<void> {
    await super.goto('/sv/invoice/crud');
  }

  async selectCustomer(customerName: string): Promise<void> {
    await this.customerAutocompleteInput.fill(customerName);
    await this.page.getByRole('option', { name: customerName, exact: true }).click();
  }

  async fillInvoiceDate(date: string): Promise<void> {
    // Unlike a brand-new Employee/Timesheet form, a new invoice's invoiceDate control comes
    // back pre-filled with today's date from the server's blank template - typing on top of
    // that without first selecting-all corrupts the value into a garbled interleaved string.
    await this.invoiceDateInput.click();
    await this.invoiceDateInput.press('Control+A');
    await this.invoiceDateInput.pressSequentially(date);
    await this.vehiclePlateInput.click();
  }

  /**
   * A brand-new invoice starts with one default (non-text) detail row that requires a real
   * product selection to pass validation. Removes it and adds a text-only row instead, which
   * only needs free text (see invoice-crud.component.ts's onFormSubmit isProductValid check) -
   * avoids depending on seeded product data existing in whatever environment tests run against.
   */
  async useTextOnlyDetailRow(text: string): Promise<void> {
    await this.removeDetailRowButtons.first().click();
    await this.addTextButton.click();
    await this.detailTextContentTextareas.first().fill(text);
  }

  async fillForm(customerName: string, data: Partial<InvoiceFormData>): Promise<void> {
    await this.selectCustomer(customerName);
    if (data.invoiceDate !== undefined) await this.fillInvoiceDate(data.invoiceDate);
    if (data.vehiclePlate !== undefined) await this.vehiclePlateInput.fill(data.vehiclePlate);
    if (data.detailText !== undefined) await this.useTextOnlyDetailRow(data.detailText);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async toastText(): Promise<string> {
    return (await this.toast.innerText()).trim();
  }

  fieldInvalid(fieldName: string): Locator {
    return this.page.locator(`[formcontrolname="${fieldName}"].ng-invalid`);
  }
}
