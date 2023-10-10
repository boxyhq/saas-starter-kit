import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
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
    reuseExistingServer: true,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL:
        'postgresql://testuser:testpassword@localhost:5432/saas-starter-kit',
    },
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
