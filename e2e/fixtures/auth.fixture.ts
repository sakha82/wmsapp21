import { test as base } from '@playwright/test';
import * as fs from 'fs';
import { SESSION_FILE } from '../global-setup';

interface LoginResponse {
  token: string;
  wmsId: string;
  displayName: string;
  country: string;
  userName: string;
}

/**
 * Overrides the built-in `page` fixture so every test starts already
 * authenticated. The app stores its session in sessionStorage (not
 * cookies — see SharedService.login()/home.component.ts), so the standard
 * Playwright storageState/cookie-reuse pattern doesn't apply here.
 *
 * Logins happen once per configured test account in global-setup.ts (the
 * backend 401s a second concurrent login for the SAME account with "double
 * session"). `workerSession` (worker-scoped) picks one cached session per
 * Playwright worker via `parallelIndex`, so parallel workers each hold their
 * own independent session under the same wmsId instead of racing one shared
 * token. `page` (test-scoped) then seeds sessionStorage from that worker's
 * session with page.addInitScript before the app's first navigation,
 * mirroring exactly what the real login dialog does to browser storage.
 */
export const test = base.extend<{}, { workerSession: LoginResponse }>({
  workerSession: [
    async ({}, use, workerInfo) => {
      if (!fs.existsSync(SESSION_FILE)) {
        throw new Error(`No cached session found at ${SESSION_FILE} — global-setup.ts should have created it.`);
      }
      const sessions: LoginResponse[] = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
      if (sessions.length === 0) {
        throw new Error(`${SESSION_FILE} contains no sessions — check e2e/.env has at least TEST_USER_EMAIL/PASSWORD set.`);
      }
      const session = sessions[workerInfo.parallelIndex % sessions.length];
      await use(session);
    },
    { scope: 'worker' },
  ],

  page: async ({ page, workerSession }, use) => {
    await page.addInitScript((s) => {
      sessionStorage.setItem('accessToken', s.token);
      sessionStorage.setItem('wmsId', s.wmsId);
      sessionStorage.setItem('workshopName', s.displayName);
      sessionStorage.setItem('country', s.country);
      sessionStorage.setItem('lang', 'sv');
      sessionStorage.setItem('userName', s.userName);
    }, workerSession);

    await use(page);
  },
});
