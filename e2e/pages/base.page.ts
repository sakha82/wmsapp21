import { Page, Locator } from '@playwright/test';

/**
 * Common helpers shared by every module's page objects.
 * Every `*.page.ts` in e2e/pages/<module>/ should extend this class.
 */
export class BasePage {
  constructor(readonly page: Page) {}

  /**
   * app-generic-loader (src/app/components/shared/generic-loader) renders its
   * spinner behind *ngIf, so it's fully removed from the DOM when hidden — not
   * just visually hidden. Waiting for 'hidden' matches both "never appeared"
   * and "appeared then was removed".
   */
  private get loaderSpinner(): Locator {
    return this.page.locator('app-generic-loader .p-progress-spinner');
  }

  async waitForLoadingComplete(timeout = 15_000): Promise<void> {
    try {
      await this.loaderSpinner.waitFor({ state: 'visible', timeout: 1000 });
    } catch {
      // Loader may never have appeared (fast response) — that's fine.
    }
    await this.loaderSpinner.waitFor({ state: 'hidden', timeout });
  }

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
    await this.waitForLoadingComplete();
  }
}
