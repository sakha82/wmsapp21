import { request as playwrightRequest } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export const SESSION_FILE = path.resolve(__dirname, '.auth', 'sessions.json');

interface TestAccount {
  email: string;
  password: string;
}

/**
 * Logs in exactly once per configured test account (TEST_USER_EMAIL/PASSWORD,
 * TEST_USER_2_*, TEST_USER_3_*) and caches all sessions to disk as an array.
 * The backend rejects concurrent logins for the SAME account with a 401
 * "double session" error, so a single shared account can't be used by more
 * than one Playwright worker at a time. With 3 separate accounts under the
 * same wmsId (see Scripts/CreateTestUsers in the wms container repo),
 * auth.fixture.ts assigns one account per worker (parallelIndex % accounts.length),
 * so workers run genuinely in parallel without racing each other's session.
 */
export default async function globalSetup(): Promise<void> {
  const apiBaseUrl = process.env['API_BASE_URL'] || 'https://localhost:5000';

  const accounts: TestAccount[] = [
    { email: process.env['TEST_USER_EMAIL'] || '', password: process.env['TEST_USER_PASSWORD'] || '' },
    { email: process.env['TEST_USER_2_EMAIL'] || '', password: process.env['TEST_USER_2_PASSWORD'] || '' },
    { email: process.env['TEST_USER_3_EMAIL'] || '', password: process.env['TEST_USER_3_PASSWORD'] || '' },
  ].filter((a) => a.email && a.password);

  if (accounts.length === 0) {
    throw new Error(
      'No test accounts configured. Copy e2e/.env.example to e2e/.env and fill in at least TEST_USER_EMAIL/TEST_USER_PASSWORD (TEST_USER_2_*/TEST_USER_3_* are optional but required for parallel workers).',
    );
  }

  const apiContext = await playwrightRequest.newContext({ ignoreHTTPSErrors: true });
  const sessions = [];

  for (const account of accounts) {
    const response = await apiContext.post(`${apiBaseUrl}/api/auth/login`, {
      data: { email: account.email, password: account.password },
    });

    if (!response.ok()) {
      const body = await response.text();
      await apiContext.dispose();
      throw new Error(`Test user login failed for ${account.email}: ${response.status()} ${body}`);
    }

    sessions.push(await response.json());
  }

  await apiContext.dispose();

  fs.mkdirSync(path.dirname(SESSION_FILE), { recursive: true });
  fs.writeFileSync(SESSION_FILE, JSON.stringify(sessions, null, 2));
}
