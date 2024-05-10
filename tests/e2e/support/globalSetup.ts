// global-setup.ts
async function globalSetup() {
  process.env.MOCKSAML_ORIGIN = process.env.CI
    ? 'http://localhost:4000'
    : 'https://mocksaml.com';
}

export default globalSetup;
