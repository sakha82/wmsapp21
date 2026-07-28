import { test as authTest } from './auth.fixture';
import { UiQualityChecker } from '../utils/ui-quality-checker';

/**
 * Chains on top of the authenticated `page` fixture and auto-wires UI
 * quality checks into every test (console errors, page errors, 5xx network
 * responses, missing translations, broken images, empty buttons/links) —
 * no per-test boilerplate needed. See utils/ui-quality-checker.ts for what
 * blocks a test vs. what only attaches to the HTML report.
 */
export const test = authTest.extend<{}>({
  page: async ({ page }, use, testInfo) => {
    const checker = new UiQualityChecker(page);

    await use(page);

    await checker.runAllChecks();
    checker.attachToReport(testInfo);

    const blocking = checker.blockingIssues;
    if (blocking.length > 0) {
      throw new Error(
        `UI quality check failed with ${blocking.length} blocking issue(s):\n` +
          blocking.map((issue) => `  [${issue.type}] ${issue.message}`).join('\n'),
      );
    }
  },
});

export { expect } from '@playwright/test';
