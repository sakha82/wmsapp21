import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';
import { PrimeTableComponent } from '../components/prime-table.component';

export class OfferListPage extends BasePage {
  readonly table: PrimeTableComponent;
  readonly createOfferButton: Locator;

  constructor(page: Page) {
    super(page);
    this.table = new PrimeTableComponent(page, page.getByTestId('offer-table'), 'offer-row');
    this.createOfferButton = page.getByTestId('create-offer-button');
  }

  async goto(): Promise<void> {
    await super.goto('/sv/offer');
  }

  row(offerId: number | string): Locator {
    return this.table.rows.filter({ hasText: String(offerId) });
  }

  async clickCreateOffer(): Promise<void> {
    await this.createOfferButton.click();
  }

  async openOffer(offerId: number | string): Promise<void> {
    await this.row(offerId).locator('.pi-external-link').click();
    await this.waitForLoadingComplete();
  }
}
