import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

export class VehicleListPage extends BasePage {
  readonly searchInput: Locator;
  readonly vehicleInformation: Locator;
  readonly customerRows: Locator;
  readonly offersCategoryRow: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByTestId('vehicle-search-autocomplete').locator('input');
    this.vehicleInformation = page.getByTestId('vehicle-information');
    this.customerRows = page.getByTestId('vehicle-customer-row');
    this.offersCategoryRow = page.getByTestId('vehicle-offers-category-row');
  }

  async goto(): Promise<void> {
    await super.goto('/sv/vehicle');
  }

  async searchFor(vehiclePlate: string): Promise<void> {
    await this.searchInput.fill(vehiclePlate);
  }

  async selectVehicle(vehiclePlate: string): Promise<void> {
    await this.searchFor(vehiclePlate);
    await this.page.getByRole('option', { name: new RegExp(vehiclePlate) }).first().click();
  }
}
