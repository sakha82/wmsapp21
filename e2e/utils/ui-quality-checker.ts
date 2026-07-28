import { Page, TestInfo } from '@playwright/test';

export type QualityIssueType =
  | 'console-error'
  | 'page-error'
  | 'network-error'
  | 'missing-translation'
  | 'broken-image'
  | 'empty-actionable';

export interface QualityIssue {
  type: QualityIssueType;
  message: string;
  status?: number;
}

/**
 * Known/expected console noise that shouldn't fail a test. Add substrings
 * here as they're discovered — keep it narrow, don't blanket-suppress.
 */
const CONSOLE_ALLOWLIST: string[] = [];

/**
 * Chrome's own generic message for any failed resource load ("Failed to
 * load resource: the server responded with a status of 404 (Not Found)").
 * It carries no URL, so it can't be attributed to a specific known issue —
 * but every such failure is *also* captured with its real URL and status by
 * the 'response' listener below (see checkBrokenImages/network-error), which
 * already applies the correct 4xx-vs-5xx blocking threshold. Counting this
 * generic echo as a second, unconditionally-blocking console-error would be
 * redundant and would make an isolated missing asset (e.g. the currently
 * missing src/assets/fonts/material/MaterialSymbolsOutlined.ttf) fail every
 * single test on the site rather than just being reported once.
 */
const GENERIC_RESOURCE_LOAD_FAILURE = /^Failed to load resource: the server responded with a status of \d+/;

/**
 * Attaches to a Page's console/pageerror/response events and offers
 * on-demand DOM scans for the app-specific quality signals called out in
 * docs/automated-test-plan.md. Wired in automatically via
 * fixtures/quality.fixture.ts — specs don't need to touch this directly.
 */
export class UiQualityChecker {
  readonly issues: QualityIssue[] = [];

  constructor(private readonly page: Page) {
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      const text = msg.text();
      if (GENERIC_RESOURCE_LOAD_FAILURE.test(text)) return;
      if (CONSOLE_ALLOWLIST.some((allowed) => text.includes(allowed))) return;
      this.issues.push({ type: 'console-error', message: text });
    });

    page.on('pageerror', (err) => {
      this.issues.push({ type: 'page-error', message: err.message });
    });

    page.on('response', (response) => {
      const status = response.status();
      if (status >= 400) {
        this.issues.push({
          type: 'network-error',
          message: `${status} ${response.request().method()} ${response.url()}`,
          status,
        });
      }
    });
  }

  /**
   * SharedService.T() renders the literal "*key" string when a translation
   * key is missing (see CLAUDE.md). Scanning for that pattern turns a vague
   * "missing translations" ask into a precise, codebase-specific check.
   */
  async checkMissingTranslations(): Promise<void> {
    const bodyText = await this.page.locator('body').innerText();
    const matches = bodyText.match(/\*[a-zA-Z][a-zA-Z0-9]*/g) ?? [];
    for (const match of matches) {
      this.issues.push({ type: 'missing-translation', message: `Missing translation key rendered: ${match}` });
    }
  }

  async checkBrokenImages(): Promise<void> {
    const brokenSrcs = await this.page.locator('img').evaluateAll((imgs) =>
      (imgs as HTMLImageElement[])
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.currentSrc || img.src),
    );
    for (const src of brokenSrcs) {
      this.issues.push({ type: 'broken-image', message: `Broken image: ${src}` });
    }
  }

  async checkEmptyActionables(): Promise<void> {
    const emptyEls = await this.page.locator('button, a').evaluateAll((els) =>
      (els as HTMLElement[])
        .filter((el) => el.offsetParent !== null)
        .filter((el) => !el.innerText.trim() && !el.getAttribute('aria-label') && !el.querySelector('img, svg'))
        .map((el) => el.outerHTML.slice(0, 120)),
    );
    for (const html of emptyEls) {
      this.issues.push({ type: 'empty-actionable', message: `Empty button/link with no accessible text: ${html}` });
    }
  }

  async runAllChecks(): Promise<void> {
    await this.checkMissingTranslations();
    await this.checkBrokenImages();
    await this.checkEmptyActionables();
  }

  attachToReport(testInfo: TestInfo): void {
    if (this.issues.length === 0) return;
    void testInfo.attach('ui-quality-issues.json', {
      body: JSON.stringify(this.issues, null, 2),
      contentType: 'application/json',
    });
  }

  /**
   * Issues that fail the test outright: console/page errors and 5xx network
   * responses are always bugs. 4xx is deliberately non-blocking — specs that
   * exercise validation/duplicate-handling paths expect 4xx responses.
   */
  get blockingIssues(): QualityIssue[] {
    return this.issues.filter(
      (issue) =>
        issue.type === 'console-error' ||
        issue.type === 'page-error' ||
        (issue.type === 'network-error' && (issue.status ?? 0) >= 500),
    );
  }
}
