import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';
import { PrimeTableComponent } from '../components/prime-table.component';

export class EmployeeListPage extends BasePage {
  readonly table: PrimeTableComponent;
  readonly createEmployeeButton: Locator;
  readonly onlyActiveEmployeesCheckbox: Locator;

  constructor(page: Page) {
    super(page);
    this.table = new PrimeTableComponent(page, page.getByTestId('employee-table'), 'employee-row');
    this.createEmployeeButton = page.getByTestId('create-employee-button');
    this.onlyActiveEmployeesCheckbox = page.locator('#onlyActiveEmployees');
  }

  async goto(): Promise<void> {
    await super.goto('/sv/employee');
  }

  row(employeeName: string): Locator {
    return this.table.rows.filter({ hasText: employeeName });
  }

  async clickCreateEmployee(): Promise<void> {
    await this.createEmployeeButton.click();
  }

  async editEmployee(employeeName: string): Promise<void> {
    await this.row(employeeName).getByTestId('edit-employee-button').click();
    await this.waitForLoadingComplete();
  }

  async toggleOnlyActiveEmployees(): Promise<void> {
    await this.onlyActiveEmployeesCheckbox.click();
  }
}
