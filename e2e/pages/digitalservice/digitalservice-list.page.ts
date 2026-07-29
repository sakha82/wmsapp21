import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';
import { DigitalServiceFormData } from '../../utils/data-builders/digitalservice.builder';
import { t, enumText } from '../../utils/translations';

export class DigitalServiceListPage extends BasePage {
  readonly table: Locator;
  readonly createButton: Locator;
  readonly searchInput: Locator;

  // Create dialog
  readonly userIdInput: Locator;
  readonly vehiclePlateInput: Locator;
  readonly vehicleManufacturerInput: Locator;
  readonly vehicleModelInput: Locator;
  readonly vehicleYearInput: Locator;
  readonly serviceDateInput: Locator;
  readonly vehicleMileageInput: Locator;
  readonly commentsTextarea: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly toast: Locator;

  constructor(page: Page) {
    super(page);
    this.table = page.getByTestId('digitalservice-table');
    this.createButton = page.getByTestId('create-digitalservice-button');
    this.searchInput = page.getByTestId('digitalservice-search-input');

    this.userIdInput = page.locator('input[formcontrolname="userId"]');
    this.vehiclePlateInput = page.locator('input[formcontrolname="vehiclePlate"]');
    this.vehicleManufacturerInput = page.locator('input[formcontrolname="vehicleManufacturer"]');
    this.vehicleModelInput = page.locator('input[formcontrolname="vehicleModel"]');
    this.vehicleYearInput = page.locator('input[formcontrolname="vehicleYear"]');
    this.serviceDateInput = page.locator('p-date-picker[formcontrolname="serviceDate"] input');
    this.vehicleMileageInput = page.locator('input[formcontrolname="vehicleMileage"]');
    this.commentsTextarea = page.locator('textarea[formcontrolname="comments"]');
    this.submitButton = page.getByTestId('digitalservice-submit-button');
    this.cancelButton = page.getByTestId('digitalservice-cancel-button');
    this.toast = page.locator('p-toast');
  }

  async goto(): Promise<void> {
    await super.goto('/sv/digitalservice');
  }

  parentRow(vehiclePlate: string): Locator {
    // hasText does a substring match, which collides with other accumulated E2E rows sharing a
    // prefix (e.g. "E2E78" matching an existing "E2E785") - match the plate's own <strong> text
    // exactly instead.
    return this.table
      .getByTestId('digitalservice-parent-row')
      .filter({ has: this.page.locator('strong', { hasText: new RegExp(`^${vehiclePlate}$`) }) });
  }

  async openCreateDialog(): Promise<void> {
    await this.createButton.click();
  }

  async fillServiceDate(date: string): Promise<void> {
    // Same gotcha as Invoice/Offer: openDigitalServiceDialog() patches serviceDate to today's
    // date by default (this.invoice is undefined unless an invoice was linked via
    // validateAndAttachInvoice), so typing on top of it without a Control+A select-all first
    // interleaves with the existing text instead of replacing it.
    await this.serviceDateInput.click();
    await this.serviceDateInput.press('Control+A');
    await this.serviceDateInput.pressSequentially(date);
    await this.vehicleMileageInput.click();
  }

  /** Selects one checkbox option ("Luftfilter"/airFilter) from the "work carried out" p-listbox - only one is required. */
  async selectAnyServiceCheckbox(): Promise<void> {
    const label = enumText('digitalservice', 'airFilter');
    await this.page.locator('p-listbox[formcontrolname="services"]').getByText(label, { exact: true }).click();
  }

  async fillForm(data: Partial<DigitalServiceFormData>): Promise<void> {
    if (data.userId !== undefined) await this.userIdInput.fill(data.userId);
    if (data.vehiclePlate !== undefined) await this.vehiclePlateInput.fill(data.vehiclePlate);
    if (data.vehicleManufacturer !== undefined) await this.vehicleManufacturerInput.fill(data.vehicleManufacturer);
    if (data.vehicleModel !== undefined) await this.vehicleModelInput.fill(data.vehicleModel);
    if (data.vehicleYear !== undefined) await this.vehicleYearInput.fill(data.vehicleYear);
    if (data.serviceDate !== undefined) await this.fillServiceDate(data.serviceDate);
    if (data.vehicleMileage !== undefined) await this.vehicleMileageInput.fill(data.vehicleMileage);
    await this.selectAnyServiceCheckbox();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  /** Confirms the review dialog (ConfirmationService.confirm()) that appears after submit(). */
  async confirmCreate(): Promise<void> {
    await this.page.locator('.p-confirmdialog').getByRole('button', { name: t('createDigitalservice'), exact: true }).click();
  }

  async rejectCreate(): Promise<void> {
    await this.page.locator('.p-confirmdialog').getByRole('button', { name: t('cancel'), exact: true }).click();
  }

  async searchFor(vehiclePlate: string): Promise<void> {
    await this.searchInput.fill(vehiclePlate);
  }

  async expandRow(vehiclePlate: string): Promise<void> {
    await this.parentRow(vehiclePlate).locator('.p-treetable-toggler').click();
  }

  async toastText(): Promise<string> {
    return (await this.toast.innerText()).trim();
  }
}
