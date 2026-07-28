import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';
import { CustomerFormData } from '../../utils/data-builders/customer.builder';

export class CustomerCrudPage extends BasePage {
  readonly customerNameInput: Locator;
  readonly emailInput: Locator;
  readonly telephoneInput: Locator;
  readonly organizationNoInput: Locator;
  readonly vatIdInput: Locator;
  readonly careOfInput: Locator;
  readonly addressInput: Locator;
  readonly postalCodeInput: Locator;
  readonly cityInput: Locator;
  readonly digitalServiceIdInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly toast: Locator;

  constructor(page: Page) {
    super(page);
    this.customerNameInput = page.locator('input[formcontrolname="customerName"]');
    this.emailInput = page.locator('input[formcontrolname="email"]');
    this.telephoneInput = page.locator('input[formcontrolname="telephone"]');
    this.organizationNoInput = page.locator('input[formcontrolname="organizationNo"]');
    this.vatIdInput = page.locator('input[formcontrolname="vatId"]');
    this.careOfInput = page.locator('input[formcontrolname="careOf"]');
    this.addressInput = page.locator('input[formcontrolname="customerAddress"]');
    this.postalCodeInput = page.locator('input[formcontrolname="customerPostNo"]');
    this.cityInput = page.locator('input[formcontrolname="customerCity"]');
    this.digitalServiceIdInput = page.locator('input[formcontrolname="digitalServiceId"]');
    this.submitButton = page.getByTestId('customer-submit-button');
    this.cancelButton = page.getByTestId('customer-cancel-button');
    this.toast = page.locator('p-toast');
  }

  async gotoCreate(): Promise<void> {
    await super.goto('/sv/customer/crud');
  }

  async fillForm(data: Partial<CustomerFormData>): Promise<void> {
    if (data.customerName !== undefined) await this.customerNameInput.fill(data.customerName);
    if (data.email !== undefined) await this.emailInput.fill(data.email);
    if (data.telephone !== undefined) await this.telephoneInput.fill(data.telephone);
    if (data.organizationNo !== undefined) await this.organizationNoInput.fill(data.organizationNo);
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
