import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

export class ProductDetailPage extends BasePage {
  readonly saleHistoryTable: Locator;

  constructor(page: Page) {
    super(page);
    this.saleHistoryTable = page.getByTestId('sale-history-table');
  }

  async goto(productId: number | string): Promise<void> {
    await super.goto(`/sv/product/details/${productId}`);
  }
}
