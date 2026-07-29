import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

export class InvoiceDetailPage extends BasePage {
  readonly editInvoiceButton: Locator;

  constructor(page: Page) {
    super(page);
    this.editInvoiceButton = page.getByTestId('edit-invoice-button');
  }

  async goto(invoiceId: number | string): Promise<void> {
    await super.goto(`/sv/invoice/details/${invoiceId}`);
  }

  async clickEditInvoice(): Promise<void> {
    await this.editInvoiceButton.click();
  }
}
