import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';
import { PrimeTableComponent } from '../components/prime-table.component';

export class InvoiceListPage extends BasePage {
  readonly table: PrimeTableComponent;
  readonly createInvoiceButton: Locator;
  readonly vehiclePlateSearchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.table = new PrimeTableComponent(page, page.getByTestId('invoice-table'), 'invoice-row');
    this.createInvoiceButton = page.getByTestId('create-invoice-button');
    this.vehiclePlateSearchInput = page.locator('input[formcontrolname="vehiclePlate"]');
  }

  async goto(): Promise<void> {
    await super.goto('/sv/invoice');
  }

  row(invoiceId: number | string): Locator {
    return this.table.rows.filter({ hasText: String(invoiceId) });
  }

  async clickCreateInvoice(): Promise<void> {
    await this.createInvoiceButton.click();
  }

  async openInvoice(invoiceId: number | string): Promise<void> {
    await this.row(invoiceId).locator('.pi-external-link').click();
    await this.waitForLoadingComplete();
  }
}
