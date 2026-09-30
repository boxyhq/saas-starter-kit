import { PlaywrightTestConfig, devices } from '@playwright/test';
import { readFileSync } from 'fs';

try {
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  }
} catch (error) {
  void error;
}

const config: PlaywrightTestConfig = {
  workers: 1,
  globalSetup: require.resolve('./tests/e2e/support/globalSetup.ts'),
  timeout: 100 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: 'support/*.setup.ts',
      teardown: 'cleanup db',
    },
    {
      name: 'cleanup db',
      testMatch: 'support/*.teardown.ts',
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
  reporter: 'html',
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4002',
    reuseExistingServer: !process.env.CI,
  },
  retries: 1,
  use: {
    headless: true,
    ignoreHTTPSErrors: true,
    baseURL: 'http://localhost:4002',
    trace: 'retain-on-first-failure',
  },
  testDir: './tests/e2e',
  testIgnore: [
    '**/auth/sso.login.spec.ts',
    '**/auth/idp-initiated.spec.ts',
    '**/settings/directory-sync.spec.ts',
    '**/settings/members.spec.ts',
    '**/settings/team-settings.spec.ts',
    '**/settings/api-key.spec.ts',
    '**/session/session.spec.ts',
  ],
};

export default config;
