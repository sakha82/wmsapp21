import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';
import { EmployeeFormData } from '../../utils/data-builders/employee.builder';

export class EmployeeCrudPage extends BasePage {
  readonly fullNameInput: Locator;
  readonly personNumberInput: Locator;
  readonly hireDateInput: Locator;
  readonly terminationDateInput: Locator;
  readonly emailInput: Locator;
  readonly telephoneInput: Locator;
  readonly streetInput: Locator;
  readonly postNoInput: Locator;
  readonly cityInput: Locator;
  readonly includeInCalendarHoursCheckbox: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly toast: Locator;

  constructor(page: Page) {
    super(page);
    this.fullNameInput = page.locator('input[formcontrolname="fullName"]');
    this.personNumberInput = page.locator('input[formcontrolname="personNumber"]');
    this.hireDateInput = page.locator('p-datepicker[formcontrolname="hireDate"] input');
    this.terminationDateInput = page.locator('p-date-picker[formcontrolname="terminationDate"] input');
    this.emailInput = page.locator('input[formcontrolname="email"]');
    this.telephoneInput = page.locator('input[formcontrolname="telephone"]');
    this.streetInput = page.locator('input[formcontrolname="street"]');
    this.postNoInput = page.locator('input[formcontrolname="postNo"]');
    this.cityInput = page.locator('input[formcontrolname="city"]');
    this.includeInCalendarHoursCheckbox = page.locator('p-checkbox[formcontrolname="includeInCalendarHours"]');
    this.submitButton = page.getByTestId('employee-submit-button');
    this.cancelButton = page.getByTestId('employee-cancel-button');
    this.toast = page.locator('p-toast');
  }

  async gotoCreate(): Promise<void> {
    await super.goto('/sv/employee/crud');
  }

  async fillForm(data: Partial<EmployeeFormData>): Promise<void> {
    if (data.fullName !== undefined) await this.fullNameInput.fill(data.fullName);
    if (data.personNumber !== undefined) await this.personNumberInput.fill(data.personNumber);
    if (data.hireDate !== undefined) {
      // p-datepicker doesn't pick up a plain .fill() (its ControlValueAccessor parses on real
      // keystrokes, not a single synthetic 'input' event) and opens a calendar overlay on focus
      // that lingers — and can then intercept clicks on controls below it — until something else
      // is clicked. pressSequentially() + a follow-up click both work around that.
      await this.hireDateInput.click();
      await this.hireDateInput.pressSequentially(data.hireDate);
      await this.fullNameInput.click();
    }
    if (data.email !== undefined) await this.emailInput.fill(data.email);
    if (data.telephone !== undefined) await this.telephoneInput.fill(data.telephone);
    if (data.street !== undefined) await this.streetInput.fill(data.street);
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

  fieldInvalid(fieldName: string): Locator {
    return this.page.locator(`[formcontrolname="${fieldName}"].ng-invalid`);
  }
}
