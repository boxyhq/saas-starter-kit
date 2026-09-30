async function waitForKratos() {
  const url =
    (process.env.ORY_SDK_URL || 'http://localhost:4433') + '/health/ready';
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch (error) {
      void error;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Ory Kratos not ready at ${url}`);
}

async function globalSetup() {
  process.env.MOCKSAML_ORIGIN = process.env.CI
    ? 'http://localhost:4000'
    : 'https://mocksaml.com';

  await waitForKratos();
}

export default globalSetup;
