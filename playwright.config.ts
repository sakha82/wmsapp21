import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, 'e2e/.env') });

const baseURL = process.env['PLAYWRIGHT_BASE_URL'] || 'http://localhost:4200';

export default defineConfig({
  testDir: './e2e/tests',
  globalSetup: require.resolve('./e2e/global-setup'),
  // 3 accounts under the same wmsId (see e2e/.env's TEST_USER_*_EMAIL/PASSWORD and
  // Scripts/CreateTestUsers in the wms container repo) are each logged in once in
  // global-setup.ts; auth.fixture.ts assigns one session per worker via parallelIndex.
  // Capped at 3 workers to match the number of accounts — a 4th worker would reuse an
  // account another worker already holds a session for.
  fullyParallel: true,
  workers: 3,
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
