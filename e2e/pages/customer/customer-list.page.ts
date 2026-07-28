import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';
import { PrimeTableComponent } from '../components/prime-table.component';
import { PrimeSelectComponent } from '../components/prime-select.component';

export class CustomerListPage extends BasePage {
  readonly table: PrimeTableComponent;
  readonly createCustomerButton: Locator;
  readonly customerTypeFilter: PrimeSelectComponent;
  readonly customerTagFilter: PrimeSelectComponent;
  readonly customerCityFilter: PrimeSelectComponent;

  constructor(page: Page) {
    super(page);
    this.table = new PrimeTableComponent(page, page.getByTestId('customer-table'), 'customer-row');
    this.createCustomerButton = page.getByTestId('create-customer-button');
    this.customerTypeFilter = new PrimeSelectComponent(page.locator('p-select[formcontrolname="customerType"]'));
    this.customerTagFilter = new PrimeSelectComponent(page.locator('p-select[formcontrolname="customerTag"]'));
    this.customerCityFilter = new PrimeSelectComponent(page.locator('p-select[formcontrolname="customerCity"]'));
  }

  async goto(): Promise<void> {
    await super.goto('/sv/customer');
  }

  /** The inline column filter input under the "Namn"/"Name" header (filterOn="input"). */
  get nameSearchInput(): Locator {
    return this.page.getByTestId('customer-table').locator('thead tr').nth(1).locator('input');
  }

  async searchByName(value: string): Promise<void> {
    await this.nameSearchInput.fill(value);
  }

  async clearNameSearch(): Promise<void> {
    await this.nameSearchInput.fill('');
  }

  row(customerName: string): Locator {
    return this.table.rows.filter({ hasText: customerName });
  }

  async openCustomer(customerName: string): Promise<void> {
    await this.row(customerName).locator('.pi-external-link').click();
    await this.waitForLoadingComplete();
  }

  async clickCreateCustomer(): Promise<void> {
    await this.createCustomerButton.click();
  }
}
