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
 * The actual login happens once for the whole run in global-setup.ts (the
 * backend 401s a second concurrent login for the same account with "double
 * session", which broke this when each test logged in independently under
 * Playwright's parallel workers). This fixture just reads that cached
 * session and seeds sessionStorage with page.addInitScript before the app's
 * first navigation, mirroring exactly what the real login dialog does to
 * browser storage.
 */
export const test = base.extend<{}>({
  page: async ({ page }, use) => {
    if (!fs.existsSync(SESSION_FILE)) {
      throw new Error(`No cached session found at ${SESSION_FILE} — global-setup.ts should have created it.`);
    }
    const session: LoginResponse = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));

    await page.addInitScript((s) => {
      sessionStorage.setItem('accessToken', s.token);
      sessionStorage.setItem('wmsId', s.wmsId);
      sessionStorage.setItem('workshopName', s.displayName);
      sessionStorage.setItem('country', s.country);
      sessionStorage.setItem('lang', 'sv');
      sessionStorage.setItem('userName', s.userName);
    }, session);

    await use(page);
  },
});
