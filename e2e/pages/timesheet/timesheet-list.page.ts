import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';
import { PrimeTableComponent } from '../components/prime-table.component';
import { TimesheetFormData } from '../../utils/data-builders/timesheet.builder';

export class TimesheetListPage extends BasePage {
  readonly table: PrimeTableComponent;
  readonly checkinButton: Locator;
  readonly toast: Locator;

  // Register-time dialog
  readonly dialogEmployeeSelect: Locator;
  readonly dialogTimesheetTypeWorkhourOption: Locator;
  readonly dialogTimeInInput: Locator;
  readonly dialogTimeOutInput: Locator;
  readonly dialogCommentsTextarea: Locator;
  readonly dialogSubmitButton: Locator;
  readonly dialogCancelButton: Locator;

  // Checkout popover
  readonly checkoutTimeOutInput: Locator;
  readonly checkoutSubmitButton: Locator;

  // Delete popover
  readonly deleteCommentsTextarea: Locator;
  readonly deleteSubmitButton: Locator;

  // Comments popover
  readonly commentsTextarea: Locator;
  readonly commentsSubmitButton: Locator;

  readonly employeeFilter: Locator;

  constructor(page: Page) {
    super(page);
    this.table = new PrimeTableComponent(page, page.getByTestId('timesheet-table'), 'timesheet-row');
    this.checkinButton = page.getByTestId('checkin-button');
    this.toast = page.locator('p-toast');

    this.dialogEmployeeSelect = page.locator('p-dialog p-select[formcontrolname="employeeId"]');
    this.dialogTimesheetTypeWorkhourOption = page.locator('p-dialog p-selectbutton .p-togglebutton', { hasText: 'Arbetstid' });
    this.dialogTimeInInput = page.locator('p-dialog input[formcontrolname="timeIn"]');
    this.dialogTimeOutInput = page.locator('p-dialog input[formcontrolname="timeOut"]');
    this.dialogCommentsTextarea = page.locator('p-dialog textarea[formcontrolname="comments"]');
    this.dialogSubmitButton = page.getByTestId('timesheet-checkin-submit-button');
    this.dialogCancelButton = page.getByTestId('timesheet-checkin-cancel-button');

    this.checkoutTimeOutInput = page.locator('input[formcontrolname="timeOut"]');
    this.checkoutSubmitButton = page.getByTestId('timesheet-checkout-submit-button');

    this.deleteCommentsTextarea = page.locator('textarea[formcontrolname="deleteComments"]');
    this.deleteSubmitButton = page.getByTestId('timesheet-delete-submit-button');

    this.commentsTextarea = page.getByTestId('timesheet-comments-textarea');
    this.commentsSubmitButton = page.getByTestId('timesheet-comments-submit-button');

    this.employeeFilter = page.getByTestId('timesheet-employee-filter');
  }

  async goto(): Promise<void> {
    await super.goto('/sv/employment');
  }

  row(timesheetId: number | string): Locator {
    return this.table.rows.filter({ has: this.page.locator(`td:first-child`, { hasText: String(timesheetId) }) });
  }

  /** Rows are unique by employee name in these specs since each test uses a freshly-created employee. */
  rowByEmployee(employeeName: string): Locator {
    return this.table.rows.filter({ hasText: employeeName });
  }

  async openCheckinDialog(): Promise<void> {
    await this.checkinButton.click();
  }

  async selectDialogEmployee(employeeName: string): Promise<void> {
    await this.dialogEmployeeSelect.click();
    await this.page.getByRole('option', { name: employeeName, exact: true }).click();
  }

  async fillCheckinForm(data: Partial<TimesheetFormData>): Promise<void> {
    if (data.employeeName !== undefined) await this.selectDialogEmployee(data.employeeName);
    if (data.timeIn !== undefined) await this.dialogTimeInInput.fill(data.timeIn);
    if (data.timeOut !== undefined) await this.dialogTimeOutInput.fill(data.timeOut);
    if (data.comments !== undefined) await this.dialogCommentsTextarea.fill(data.comments);
  }

  async submitCheckin(): Promise<void> {
    await this.dialogSubmitButton.click();
  }

  async cancelCheckin(): Promise<void> {
    await this.dialogCancelButton.click();
  }

  /**
   * Narrows the list to a single employee's rows via the filter dropdown. Necessary because the
   * list is sorted by startdate/intervalId (not timesheetId/newest-first) and this dev environment
   * accumulates E2E-created rows across runs (see DECISIONS.md's "accept accumulation" policy) - a
   * freshly checked-in row is not guaranteed to land on page 1 without this.
   */
  async filterByEmployee(employeeName: string): Promise<void> {
    await this.employeeFilter.click();
    await this.page.getByRole('option', { name: employeeName, exact: true }).click();
  }

  async openCheckoutForEmployee(employeeName: string): Promise<void> {
    await this.rowByEmployee(employeeName).getByTestId('timesheet-checkout-open-button').click();
  }

  async submitCheckout(timeOut: string): Promise<void> {
    await this.checkoutTimeOutInput.fill(timeOut);
    await this.checkoutSubmitButton.click();
  }

  async openDeleteForEmployee(employeeName: string): Promise<void> {
    await this.rowByEmployee(employeeName).getByTestId('timesheet-delete-open-button').click();
  }

  async submitDelete(comments: string): Promise<void> {
    await this.deleteCommentsTextarea.fill(comments);
    await this.deleteSubmitButton.click();
  }

  async openCommentsForEmployee(employeeName: string): Promise<void> {
    await this.rowByEmployee(employeeName).getByTestId('timesheet-comments-open-button').click();
  }

  async toastText(): Promise<string> {
    return (await this.toast.innerText()).trim();
  }
}
