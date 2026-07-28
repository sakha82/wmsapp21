import { Locator } from '@playwright/test';

/**
 * Thin wrapper around a PrimeNG <p-select>. `root` is the locator for the
 * p-select host element itself (e.g. page.locator('p-select[formcontrolname="customerType"]')).
 * The dropdown overlay/options render into a portal on <body>, so option
 * lookups go through root.page() rather than being scoped to `root`.
 */
export class PrimeSelectComponent {
  constructor(readonly root: Locator) {}

  async open(): Promise<void> {
    await this.root.click();
  }

  async selectByLabel(label: string): Promise<void> {
    await this.open();
    await this.root.page().getByRole('option', { name: label, exact: true }).click();
  }

  async clear(): Promise<void> {
    await this.root.locator('.p-select-clear-icon').click();
  }

  async getSelectedText(): Promise<string> {
    return (await this.root.locator('.p-select-label').innerText()).trim();
  }
}
