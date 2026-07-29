import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';
import { OfferFormData } from '../../utils/data-builders/offer.builder';

export class OfferCrudPage extends BasePage {
  readonly customerAutocompleteInput: Locator;
  readonly validFromInput: Locator;
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
    this.customerAutocompleteInput = page.getByTestId('offer-customer-autocomplete').locator('input');
    this.validFromInput = page.locator('p-date-picker[formcontrolname="validFrom"] input');
    this.vehiclePlateInput = page.locator('input[formcontrolname="vehiclePlate"]');
    this.yourRefInput = page.locator('input[formcontrolname="yourRef"]');
    this.addTextButton = page.getByTestId('offer-add-text-button');
    this.addProductButton = page.getByTestId('offer-add-product-button');
    this.removeDetailRowButtons = page.getByTestId('offer-remove-detail-row-button');
    this.detailTextContentTextareas = page.getByTestId('offer-detail-text-content');
    this.submitButton = page.getByTestId('offer-submit-button');
    this.cancelButton = page.getByTestId('offer-cancel-button');
    this.toast = page.locator('p-toast');
  }

  async gotoCreate(): Promise<void> {
    await super.goto('/sv/offer/crud');
  }

  async selectCustomer(customerName: string): Promise<void> {
    await this.customerAutocompleteInput.fill(customerName);
    await this.page.getByRole('option', { name: customerName, exact: true }).click();
  }

  async fillValidFrom(date: string): Promise<void> {
    // Same gotcha as Invoice's invoiceDate: a new offer's validFrom control comes back
    // pre-filled with today's date from the form's default value, so typing on top of it
    // without first selecting-all corrupts the value into a garbled interleaved string.
    await this.validFromInput.click();
    await this.validFromInput.press('Control+A');
    await this.validFromInput.pressSequentially(date);
    await this.vehiclePlateInput.click();
  }

  /**
   * A brand-new offer starts with one default (non-text) detail row that requires a real
   * product selection to pass validation. Removes it and adds a text-only row instead, which
   * only needs free text (see offer-crud.component.ts's onFormSubmit isProductValid check) -
   * avoids depending on seeded product data existing in whatever environment tests run against.
   */
  async useTextOnlyDetailRow(text: string): Promise<void> {
    await this.removeDetailRowButtons.first().click();
    await this.addTextButton.click();
    await this.detailTextContentTextareas.first().fill(text);
  }

  async fillForm(customerName: string, data: Partial<OfferFormData>): Promise<void> {
    await this.selectCustomer(customerName);
    if (data.validFrom !== undefined) await this.fillValidFrom(data.validFrom);
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
