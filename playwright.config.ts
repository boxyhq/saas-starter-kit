import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
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
  testDir: './tests',
};

export default config;
