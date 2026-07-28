import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, 'e2e/.env') });

const baseURL = process.env['PLAYWRIGHT_BASE_URL'] || 'http://localhost:4200';

export default defineConfig({
  testDir: './e2e/tests',
  globalSetup: require.resolve('./e2e/global-setup'),
  // The backend allows only one active session per account and the whole
  // suite shares a single logged-in test user (see global-setup.ts) — running
  // workers in parallel would have them race requests against that one
  // session. Serial execution trades speed for correctness here; revisit if
  // a per-worker test account ever becomes available.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL,
    // The ASP.NET dev API runs on a self-signed https localhost cert.
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm start',
    url: baseURL,
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
