import { request as playwrightRequest } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export const SESSION_FILE = path.resolve(__dirname, '.auth', 'session.json');

/**
 * Logs in exactly once for the entire test run and caches the session to
 * disk. The backend rejects concurrent logins for the same account with a
 * 401 "double session" error, so each test independently calling
 * POST /api/auth/login (as auth.fixture.ts originally did) breaks under
 * Playwright's default parallel workers — a later worker's login silently
 * invalidates an earlier worker's in-flight token. Logging in once here and
 * having every test reuse the cached session avoids that entirely, and is
 * faster besides (one login call instead of one per test).
 */
export default async function globalSetup(): Promise<void> {
  const apiBaseUrl = process.env['API_BASE_URL'] || 'https://localhost:5000';
  const email = process.env['TEST_USER_EMAIL'];
  const password = process.env['TEST_USER_PASSWORD'];

  if (!email || !password) {
    throw new Error(
      'TEST_USER_EMAIL / TEST_USER_PASSWORD are not set. Copy e2e/.env.example to e2e/.env and fill in a real test workshop account.',
    );
  }

  const apiContext = await playwrightRequest.newContext({ ignoreHTTPSErrors: true });
  const response = await apiContext.post(`${apiBaseUrl}/api/auth/login`, {
    data: { email, password },
  });

  if (!response.ok()) {
    await apiContext.dispose();
    throw new Error(`Test user login failed: ${response.status()} ${await response.text()}`);
  }

  const session = await response.json();
  await apiContext.dispose();

  fs.mkdirSync(path.dirname(SESSION_FILE), { recursive: true });
  fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2));
}
