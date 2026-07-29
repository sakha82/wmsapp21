import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';
import { PrimeTableComponent } from '../components/prime-table.component';
import { SupplierFormData } from '../../utils/data-builders/supplier.builder';

export class SupplierListPage extends BasePage {
  readonly table: PrimeTableComponent;
  readonly createSupplierButton: Locator;
  readonly nameFilterInput: Locator;

  // Dialog
  readonly supplierNameInput: Locator;
  readonly supplierAddressInput: Locator;
  readonly supplierTelephoneInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly toast: Locator;

  constructor(page: Page) {
    super(page);
    this.table = new PrimeTableComponent(page, page.getByTestId('supplier-table'), 'supplier-row');
    this.createSupplierButton = page.getByTestId('create-supplier-button');
    // p-columnFilter's own <input> - the column header's text ("Leverantörnamn") lives in a
    // separate <tr> from the filter row, so PrimeTableComponent.filterColumn's hasText match
    // doesn't line up here; go straight for the ariaLabel set in the template instead.
    this.nameFilterInput = page.locator('input[aria-label="Filter Name"]');

    this.supplierNameInput = page.locator('input[formcontrolname="supplierName"]');
    this.supplierAddressInput = page.locator('input[formcontrolname="supplierAddress"]');
    this.supplierTelephoneInput = page.locator('input[formcontrolname="supplierTelephone"]');
    this.submitButton = page.getByTestId('supplier-submit-button');
    this.cancelButton = page.getByTestId('supplier-cancel-button');
    this.toast = page.locator('p-toast');
  }

  async goto(): Promise<void> {
    await super.goto('/sv/supplier');
  }

  row(supplierName: string): Locator {
    return this.table.rows.filter({ hasText: supplierName });
  }

  async openCreateDialog(): Promise<void> {
    await this.createSupplierButton.click();
  }

  async openEditDialog(supplierName: string): Promise<void> {
    await this.row(supplierName).getByTestId('edit-supplier-button').click();
  }

  async fillForm(data: Partial<SupplierFormData>): Promise<void> {
    if (data.supplierName !== undefined) await this.supplierNameInput.fill(data.supplierName);
    if (data.supplierAddress !== undefined) await this.supplierAddressInput.fill(data.supplierAddress);
    if (data.supplierTelephone !== undefined) await this.supplierTelephoneInput.fill(data.supplierTelephone);
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
}
