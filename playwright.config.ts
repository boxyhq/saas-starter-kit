import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  workers: 1,
  globalSetup: require.resolve('./tests/e2e/support/globalSetup.ts'),
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: 'html',
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4002',
    reuseExistingServer: !process.env.CI,
  },
  use: {
    headless: true,
    ignoreHTTPSErrors: true,
    baseURL: 'http://localhost:4002',
    video: 'off',
  },
  testDir: './tests/e2e',
};

export default config;
