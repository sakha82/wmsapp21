import { Locator, Page, expect } from '@playwright/test';

/**
 * Thin wrapper around a PrimeNG <p-table> with a paginator, sortable columns
 * and (optionally) inline column filters. `root` is the table's own locator
 * (e.g. page.getByTestId('customer-table')).
 *
 * Class names used here (.p-paginator-next, .p-datatable-column-sorted, ...)
 * are PrimeNG's public/documented CSS API and stable across versions — safer
 * than depending on this app's still-evolving Tailwind/token migration.
 */
export class PrimeTableComponent {
  constructor(
    private readonly page: Page,
    readonly root: Locator,
    private readonly rowTestId: string,
  ) {}

  get rows(): Locator {
    return this.root.getByTestId(this.rowTestId);
  }

  async rowCount(): Promise<number> {
    return this.rows.count();
  }

  async sortBy(columnHeaderText: string): Promise<void> {
    await this.root.locator('th', { hasText: columnHeaderText }).first().click();
  }

  async isSortedBy(columnHeaderText: string): Promise<boolean> {
    const header = this.root.locator('th', { hasText: columnHeaderText }).first();
    const cls = (await header.getAttribute('class')) ?? '';
    return cls.includes('p-datatable-column-sorted');
  }

  async goToNextPage(): Promise<void> {
    await this.root.locator('.p-paginator-next').click();
  }

  async goToPreviousPage(): Promise<void> {
    await this.root.locator('.p-paginator-prev').click();
  }

  async currentPageReportText(): Promise<string> {
    return (await this.root.locator('.p-paginator-current').innerText()).trim();
  }

  async setRowsPerPage(count: number): Promise<void> {
    const dropdown = this.root.locator('.p-paginator-rpp-dropdown');
    await dropdown.click();
    await this.page.getByRole('option', { name: String(count), exact: true }).click();
  }

  /** Fills an inline text p-columnFilter (filterOn="input") for the given column. */
  async filterColumn(columnHeaderText: string, value: string): Promise<void> {
    const headerCell = this.root
      .locator('thead tr')
      .filter({ hasText: columnHeaderText })
      .first();
    await headerCell.locator('input').fill(value);
  }

  async clearColumnFilter(columnHeaderText: string): Promise<void> {
    await this.filterColumn(columnHeaderText, '');
  }

  async expectNoDuplicateRows(cellSelector = 'td:first-child'): Promise<void> {
    const values = await this.rows.locator(cellSelector).allInnerTexts();
    const unique = new Set(values.map((v) => v.trim()));
    expect(unique.size, `Expected no duplicate rows, got: ${values.join(', ')}`).toBe(values.length);
  }
}
