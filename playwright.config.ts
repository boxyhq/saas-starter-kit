import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  reporter: [
    [
      'html',
      {
        outputFolder: 'report',
        open: 'never',
      },
    ],
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4002',
  },
  use: {
    headless: true,
    ignoreHTTPSErrors: true,
    baseURL: 'http://localhost:4002',
    video: 'off',
  },
};
export default config;
