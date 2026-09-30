#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { generateKeyPairSync, randomBytes } from 'node:crypto';

const ROOT = process.cwd();
const ENV_PATH = `${ROOT}/.env`;
const ENV_EXAMPLE = `${ROOT}/.env.example`;
const ORY_SDK_URL = 'http://localhost:4433';
const SKIP_SEED = process.argv.includes('--no-seed');

const c = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  bold: '\x1b[1m',
};
const step = (m) => console.log(`\n${c.bold}▸ ${m}${c.reset}`);
const ok = (m) => console.log(`  ${c.green}✓${c.reset} ${m}`);
const info = (m) => console.log(`  ${c.dim}${m}${c.reset}`);
const warn = (m) => console.log(`  ${c.yellow}!${c.reset} ${m}`);
const die = (m) => {
  console.error(`\n${c.red}✗ ${m}${c.reset}\n`);
  process.exit(1);
};

const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { stdio: 'inherit', ...opts });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let envText = '';
const loadEnv = () =>
  (envText = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf8') : '');
const flushEnv = () => writeFileSync(ENV_PATH, envText);
const getEnv = (key) => {
  const m = envText.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return m ? m[1] : undefined;
};
const needsValue = (v) => v === undefined || v.trim() === '' || v.includes('<');
const upsertEnv = (key, value) => {
  const current = getEnv(key);
  if (!needsValue(current)) return false;
  const line = `${key}=${value}`;
  if (current === undefined) {
    envText +=
      (envText.endsWith('\n') || envText === '' ? '' : '\n') + line + '\n';
  } else {
    envText = envText.replace(new RegExp(`^${key}=.*$`, 'm'), line);
  }
  return true;
};

async function waitForKratos() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`${ORY_SDK_URL}/health/ready`);
      if (res.ok) return true;
    } catch (error) {
      void error;
    }
    await sleep(2000);
  }
  return false;
}

async function main() {
  console.log(`${c.bold}SaaS Starter Kit — setup${c.reset}`);

  step('Checking prerequisites');
  const major = Number(process.versions.node.split('.')[0]);
  if (major < 20)
    die(`Node.js >= 20 required (found ${process.versions.node}).`);
  ok(`Node.js ${process.versions.node}`);
  try {
    execFileSync('docker', ['info'], { stdio: 'ignore' });
    ok('Docker daemon is running');
  } catch {
    die('Docker is not running. Start Docker Desktop / the daemon and retry.');
  }

  step('Configuring .env');
  if (!existsSync(ENV_PATH)) {
    copyFileSync(ENV_EXAMPLE, ENV_PATH);
    ok('Created .env from .env.example');
  } else {
    info('.env already exists — filling only missing values');
  }
  loadEnv();
  const defaults = {
    DATABASE_URL: 'postgresql://admin:admin@localhost:5432/saas-starter-kit',
    APP_URL: 'http://localhost:4002',
    ORY_SDK_URL,
    ORY_ADMIN_URL: 'http://localhost:4434',
    NEXT_PUBLIC_ORY_SDK_URL: ORY_SDK_URL,
  };
  for (const [k, v] of Object.entries(defaults)) {
    if (upsertEnv(k, v)) ok(`Set ${k}`);
  }

  step('Generating secrets & signing keys');
  if (needsValue(getEnv('POLIS_OPENID_PRIVATE_KEY'))) {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    upsertEnv(
      'POLIS_OPENID_PRIVATE_KEY',
      Buffer.from(privateKey).toString('base64')
    );
    upsertEnv(
      'POLIS_OPENID_PUBLIC_KEY',
      Buffer.from(publicKey).toString('base64')
    );
    ok('Generated Ory Polis OIDC RS256 keypair');
  } else {
    info('Polis OIDC keys already set');
  }
  if (upsertEnv('KRATOS_COOKIE_SECRET', randomBytes(24).toString('base64url')))
    ok('Generated KRATOS_COOKIE_SECRET');
  if (upsertEnv('KRATOS_CIPHER_SECRET', randomBytes(16).toString('hex')))
    ok('Generated KRATOS_CIPHER_SECRET');
  flushEnv();

  step('Starting Postgres, Ory Kratos & MailSlurper (docker compose up -d)');
  run('docker', ['compose', 'up', '-d']);

  step('Waiting for Ory Kratos to be ready');
  if (!(await waitForKratos())) {
    die('Kratos did not become ready. Check `docker compose logs kratos`.');
  }
  ok('Kratos is ready');

  step('Applying the database schema (prisma)');
  run('npx', ['prisma', 'generate']);
  run('npx', ['prisma', 'db', 'push']);
  ok('Schema in sync');

  if (SKIP_SEED) {
    warn('Skipping demo seed (--no-seed)');
  } else {
    step('Seeding login-ready demo data');
    try {
      run('npm', ['run', 'seed']);
    } catch {
      warn('Seed failed (continuing). Re-run later with `npm run seed`.');
    }
  }

  console.log(`\n${c.green}${c.bold}✓ Setup complete!${c.reset}\n`);
  console.log(
    `  App           ${c.dim}http://localhost:4002${c.reset}  (run: npm run dev)`
  );
  console.log(`  Ory Kratos    ${c.dim}${ORY_SDK_URL}${c.reset}`);
  console.log(
    `  MailSlurper   ${c.dim}http://localhost:4436${c.reset}  (dev inbox)`
  );
  if (!SKIP_SEED) {
    console.log(`\n  ${c.bold}Demo logins:${c.reset}`);
    console.log(
      `    owner  ${c.dim}admin@example.com / Demo-Admin-Passw0rd${c.reset}`
    );
    console.log(
      `    member ${c.dim}user@example.com  / Demo-Member-Passw0rd${c.reset}`
    );
  }
  console.log('');
}

main().catch((e) => die(e?.message || String(e)));
