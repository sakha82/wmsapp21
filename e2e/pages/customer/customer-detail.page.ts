import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

export class CustomerDetailPage extends BasePage {
  readonly editCustomerButton: Locator;
  readonly customerTypeTag: Locator;

  constructor(page: Page) {
    super(page);
    this.editCustomerButton = page.getByTestId('edit-customer-button');
    this.customerTypeTag = page.locator('p-tag');
  }

  async goto(customerId: number | string): Promise<void> {
    await super.goto(`/sv/customer/details/${customerId}`);
  }

  /** Info-grid value cell that follows a label paragraph with the given text. */
  infoValue(label: string): Locator {
    return this.page
      .locator('p.font-bold', { hasText: label })
      .locator('xpath=following-sibling::p[1]');
  }

  tab(label: string): Locator {
    return this.page.getByRole('tab', { name: label });
  }

  tabPanel(): Locator {
    return this.page.getByRole('tabpanel');
  }

  async openTab(label: string): Promise<void> {
    await this.tab(label).click();
  }

  async clickEditCustomer(): Promise<void> {
    await this.editCustomerButton.click();
  }
}
