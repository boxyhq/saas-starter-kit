import type { PlaywrightTestConfig } from "@playwright/test";
const config: PlaywrightTestConfig = {
  webServer: {
    command: "npm run start",
    url: "http://localhost:4002",
  },
  use: {
    headless: true,
    ignoreHTTPSErrors: true,
    baseURL: "http://localhost:4002",
  },
};
export default config;
