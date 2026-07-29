import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

export class OfferDetailPage extends BasePage {
  readonly editOfferButton: Locator;

  constructor(page: Page) {
    super(page);
    this.editOfferButton = page.getByTestId('edit-offer-button');
  }

  async goto(offerId: number | string): Promise<void> {
    await super.goto(`/sv/offer/details/${offerId}`);
  }

  async clickEditOffer(): Promise<void> {
    await this.editOfferButton.click();
  }
}
