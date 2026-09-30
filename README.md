<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/boxyhq/jackson/assets/66887028/871d9c0f-d351-49bb-9458-2542830d7910">
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/boxyhq/jackson/assets/66887028/4073c181-0653-4d5b-b74f-e7e84fe79da8">
  <img alt="Ory Enterprise SaaS Starter Kit" src="https://github.com/boxyhq/jackson/assets/66887028/b40520b7-dbce-400b-88d3-400d1c215ea1">
</picture>

# ⭐ Enterprise SaaS Starter Kit

<p>
    <a href="https://github.com/boxyhq/saas-starter-kit/stargazers"><img src="https://img.shields.io/github/stars/boxyhq/saas-starter-kit" alt="Github stargazers"></a>
    <a href="https://github.com/boxyhq/saas-starter-kit/issues"><img src="https://img.shields.io/github/issues/boxyhq/saas-starter-kit" alt="Github issues"></a>
    <a href="https://github.com/boxyhq/saas-starter-kit/blob/main/LICENSE"><img src="https://img.shields.io/github/license/boxyhq/saas-starter-kit" alt="license"></a>
    <a href="https://twitter.com/BoxyHQ"><img src="https://img.shields.io/twitter/follow/BoxyHQ?style=social" alt="Twitter"></a>
    <a href="https://www.linkedin.com/company/boxyhq"><img src="https://img.shields.io/badge/LinkedIn-blue" alt="LinkedIn"></a>
    <a href="https://discord.gg/uyb7pYt4Pa"><img src="https://img.shields.io/discord/877585485235630130" alt="Discord"></a>
</p>

The Open Source Next.js SaaS boilerplate for Enterprise SaaS app development.

Please star ⭐ the repo if you want us to continue developing and improving the SaaS Starter Kit! 😀

## 📖 Additional Resources

Video - [Ory-powered SaaS Starter Kit: Your Enterprise-Ready Boilerplate](https://www.youtube.com/watch?v=oF8QIwQIhyo) <br>
Blog - [Enterprise-ready Saas Starter Kit](https://boxyhq.com/blog/enterprise-ready-saas-starter-kit)

Next.js-based SaaS starter kit saves you months of development by starting you off with all the features that are the same in every product, so you can focus on what makes your app unique.

## 🛠️ Built With

- [Next.js](https://nextjs.org)
  This is a React framework that provides features such as server-side rendering and static site generation. It's used for building the user interface of your application. The main configuration for Next.js can be found in `next.config.js`.
- [Tailwind CSS](https://tailwindcss.com)
  This is a utility-first CSS framework for rapidly building custom user interfaces. It's used for styling the application. The configuration for Tailwind CSS can be found in `postcss.config.js`.
- [Postgres](https://www.postgresql.org)
  This is a powerful, open source object-relational database system. It's used for storing application data. The connection to Postgres is likely managed through Prisma.
- [React](https://reactjs.org)
  This is a JavaScript library for building user interfaces. It's used for creating the interactive elements of your application. The React components are located in the components directory.
- [Prisma](https://www.prisma.io)
  This is an open-source database toolkit. It's used for object-relational mapping, which simplifies the process of writing database queries. Prisma configuration and schema can be found in the prisma directory.
- [TypeScript](https://www.typescriptlang.org)
  This is a typed superset of JavaScript that compiles to plain JavaScript. It's used to make the code more robust and maintainable. TypeScript definitions and configurations can be found in files like `next-env.d.ts` and `i18next.d.ts`.
- [Ory Polis](https://www.ory.com/docs/polis) (Provides Enterprise SAML SSO, Directory Sync)
  Ory Polis (the `@boxyhq/saml-jackson` library, embedded in-process) bridges per-team SAML/OIDC identity providers into a single OAuth2/OIDC flow, and handles SCIM directory sync. SAML login is federated into Ory Kratos: Polis is registered as an OIDC provider that Kratos consumes. The integration lives in `lib/jackson.ts`, `lib/jackson/*`, `pages/api/oauth/*`, `pages/api/scim/v2.0/*`, and `pages/auth/sso/*`.
- [Svix](https://www.svix.com/) (Provides Webhook Orchestration)
  This is a service for handling webhooks. It's used to emit events on user/team CRUD operations, which can then be caught and handled by other parts of the application or external services. The integration of Svix is distributed throughout the codebase, primarily in areas where Create, Read, Update, and Delete (CRUD) operations are executed.
- [Retraced](https://github.com/retracedhq/retraced) (Provides Audit Logs Service)
  This is a service for audit logging and data visibility. It helps track user activities within the application i.e (who did what and when in the application). The usage of Retraced would be dispersed throughout the codebase, likely in the files where important actions are performed.
- [Stripe](https://stripe.com) (Provides Payments)
  This is a service for handling payments. It's used to process payments for the application. The integration of Stripe is likely found in the files associated with billing and subscriptions.
- [Playwright](https://playwright.dev) (Provides E2E tests)
  This is a Node.js library for automating browsers. It's used to run end-to-end tests on the application. The Playwright configuration and tests can be found in the tests directory.
- [Docker](https://www.docker.com) (Provides Docker Compose)
  This is a platform for developing, shipping, and running applications. It's used to containerize the application and its dependencies. The Docker configuration can be found in the Dockerfile and docker-compose.yml.
- [Ory Kratos](https://www.ory.com/docs/kratos) (Provides Authentication)
  Self-hosted Ory Kratos owns identities, credentials, sessions, and the recovery/verification flows. The in-app UI is built with [Ory Elements](https://github.com/ory/elements) (`@ory/elements-react` + `@ory/nextjs`) under `pages/auth/*`. Server-side sessions are resolved in `lib/session.ts` (via `ory.toSession`) and mapped to a local Prisma `User` (linked by `oryId`) in `lib/provisionUser.ts`. Kratos runs as a container in `docker-compose.yml`, configured under `config/kratos/`.

## 🚀 Deployment

> These app-platform manifests deploy the Next.js app only. Provide Ory Kratos + Polis separately (Ory Network or a self-hosted Kratos) and point `ORY_SDK_URL` / `ORY_ADMIN_URL` at it — the `docker-compose.yml` stack is for local development.

<a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fboxyhq%2Fsaas-starter-kit&env=ORY_SDK_URL,ORY_ADMIN_URL,NEXT_PUBLIC_ORY_SDK_URL,SMTP_HOST,SMTP_PORT,SMTP_USER,SMTP_PASSWORD,SMTP_FROM,DATABASE_URL,APP_URL">
<img width="90" alt="Deploy with Vercel" src="https://vercel.com/button" />
</a>

<a href="https://heroku.com/deploy" alt="Deploy to Heroku">
<img alt="Deploy to Heroku" src="https://www.herokucdn.com/deploy/button.svg" />
</a>

<a href="https://cloud.digitalocean.com/apps/new?repo=https://github.com/boxyhq/saas-starter-kit/tree/main" alt="Deploy to DO">
<img width="200" alt="Deploy to DO" src="https://www.deploytodo.com/do-btn-blue-ghost.svg" />
</a>

## ✨ Getting Started

Please follow these simple steps to get a local copy up and running.

### Prerequisites

- Node.js (Version: >=20.x)
- PostgreSQL
- NPM
- Docker compose

### Development

#### 1. Setup

- [Fork](https://github.com/boxyhq/saas-starter-kit/fork) the Ory-powered repository
- Clone the repository by using this command:

```bash
git clone https://github.com/<your_github_username>/saas-starter-kit.git
```

#### 2. Go to the project folder

```bash
cd saas-starter-kit
```

#### 3. Install dependencies

```bash
npm install
```

#### 4. Run the setup (recommended)

One command creates your `.env`, generates the signing keys/secrets, starts the backing services (Postgres, Ory Kratos, MailSlurper), waits for them to be ready, applies the database schema, and seeds login-ready demo data:

```bash
npm run setup
```

Then start the app:

```bash
npm run dev
```

Or run the setup and start the app in one command:

```bash
npm run setup:dev
```

Demo logins (seeded):

- `admin@example.com` / `Demo-Admin-Passw0rd` (team OWNER)
- `user@example.com` / `Demo-Member-Passw0rd` (team MEMBER)

Use `npm run setup -- --no-seed` to skip the demo seed, and `npm run seed` to (re)seed later. Services: app `http://localhost:4002`, Ory Kratos `http://localhost:4433`, MailSlurper (dev inbox) `http://localhost:4436`.

<details>
<summary>Manual setup (alternative to <code>npm run setup</code>)</summary>

```bash
cp .env.example .env
# generate the Ory Polis OIDC signing keys
echo "POLIS_OPENID_PRIVATE_KEY=$(openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 2>/dev/null | base64 | tr -d '\n')" >> .env
echo "POLIS_OPENID_PUBLIC_KEY=$(tail -1 .env | cut -d= -f2 | base64 -d | openssl pkey -pubout 2>/dev/null | base64 | tr -d '\n')" >> .env
docker-compose up -d      # Postgres + Ory Kratos (:4433/:4434) + MailSlurper (:4436)
npx prisma db push
npm run seed              # optional: login-ready demo data
npm run dev
```

</details>

#### 5. Start the Prisma Studio

Prisma Studio is a visual editor for the data in your database.

```bash
npx prisma studio
```

#### 6. Testing

We are using [Playwright](https://playwright.dev/) to execute E2E tests. Add all tests inside the `/tests` folder.

Update `playwright.config.ts` to change the playwright configuration.

##### Install Playwright dependencies

```bash
npm run playwright:update
```

##### Run E2E tests

```bash
npm run test:e2e
```

_Note: HTML test report is generated inside the `report` folder. Currently supported browsers for test execution `chromium` and `firefox`_

## ⚙️ Feature configuration

To get started you only need to configure the database by following the steps above. For more advanced features, you can configure the following:

### Authentication with Ory Kratos

Authentication is handled by self-hosted [Ory Kratos](https://www.ory.com/docs/kratos). Password, one-time-code (passwordless), social sign-in, recovery, and verification flows are all configured in `config/kratos/kratos.yml` and rendered in-app via [Ory Elements](https://github.com/ory/elements) under `pages/auth/*`.

1. Point the app at Kratos with `ORY_SDK_URL` (public API), `ORY_ADMIN_URL` (admin API), and `NEXT_PUBLIC_ORY_SDK_URL` in the `.env` file. The defaults match the `docker-compose.yml` services (`http://localhost:4433` / `http://localhost:4434`).
2. For recovery/verification/passwordless emails, configure the `SMTP_*` environment variables (the Kratos courier). Locally these are delivered to the MailSlurper container (UI at `http://localhost:4436`); in production use a provider like [AWS SES](https://aws.amazon.com/ses/), [Sendgrid](https://sendgrid.com/) or [Resend](https://resend.com/).
3. For social login with GitHub and Google, create OAuth apps and add each as an `oidc` provider in `config/kratos/kratos.yml` (claim → trait mappers live in `config/kratos/oidc/`). For GitHub, follow the instructions [here](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app). For Google, follow the instructions [here](https://support.google.com/cloud/answer/6158849?hl=en).

Existing (legacy) users can be imported into Kratos with `npm run migrate:ory` — bcrypt password hashes are imported directly, so users keep their current passwords.

### Enterprise SSO with Ory Polis

Per-team SAML/OIDC SSO and SCIM directory sync are provided by embedded [Ory Polis](https://www.ory.com/docs/polis) (the `@boxyhq/saml-jackson` library). SAML login is federated into Kratos: Polis is registered as the `sso` OIDC provider in `config/kratos/kratos.yml`, and the `/auth/sso` entry page resolves the user's team and routes the flow to the right identity provider.

1. Provide the Ory Polis OIDC signing keys (`POLIS_OPENID_PRIVATE_KEY` / `POLIS_OPENID_PUBLIC_KEY`). `npm run setup` generates these automatically; see the manual setup for the `openssl` equivalent.
2. Customers configure their SAML/OIDC connections from the team settings page (`/teams/[slug]/sso`), backed by the in-app [`@boxyhq/react-ui`](https://github.com/boxyhq/react-ui) components.
3. **Local SSO note:** the OIDC issuer must be reachable and identical from both the browser and the Kratos container. For local dev set `APP_URL=http://host.docker.internal:4002` and add `127.0.0.1 host.docker.internal` to `/etc/hosts` (compose already maps the host for Kratos via `extra_hosts`).

SSO team membership is granted only after a verified Polis exchange is matched to the Ory session's `sso` credential. The tenant cookie is a routing hint. The app needs access to the Ory admin identity API (`ORY_ADMIN_URL`, and `ORY_API_KEY` where required) to read that credential. Grants are short-lived and consumed once; reading an old session cannot restore a removed membership.

Polis subjects are scoped by tenant and product. If you already used an earlier revision of this migration with unscoped `sso` credentials, migrate those credential subjects to the scoped value after verifying their originating tenant, or relink through a verified account recovery process before rollout. Do not infer the tenant from an email address or browser cookie.

Legacy/SCIM accounts require a matching verified Ory email before their first identity link. Profile name and email changes use `/auth/settings`; Prisma receives verified email changes on the next session read. IdP-initiated login validates the unsolicited code and starts an Ory-controlled SSO round trip, using the existing IdP session where available.

### Svix Webhooks

1. Create an account on [Svix](https://www.svix.com/)
2. The authenticaton token and add `SVIX_API_KEY` to the `.env` file.

### Stripe Payments

1. Create an account on [Stripe](https://stripe.com/)
2. Add the [Stripe API secret key](https://dashboard.stripe.com/apikeys) to the `.env` file as `STRIPE_SECRET_KEY`.
3. Create a webhook in the [Stripe dashboard](https://dashboard.stripe.com/webhooks). The URL is your app hostname plus `/api/webhooks/stripe`. If you want to set this up locally you will need to use the [Stripe CLI forwarder](https://docs.stripe.com/webhooks#test-webhook).
4. Once created, add the signing secret to the `.env` file as `STRIPE_WEBHOOK_SECRET`.

### Recaptcha

1. Create an account on [Google reCAPTCHA](https://www.google.com/recaptcha/admin/enterprise). This will create a Google Cloud account if you don't have one.
2. From the Key Details in the [Google Cloud Console](https://console.cloud.google.com/security/recaptcha), add the reCAPTCHA ID to the `.env` file as `RECAPTCHA_SITE_KEY`.
3. Click Key Details > Integration then click Use legacy key to get the secret key and add it to the `.env` file as `RECAPTCHA_SECRET_KEY`.

### Sentry

1. Create an account on [Sentry](https://sentry.io/), skip the onboarding and create a new Next.js project.
2. At the bottom of the page, get the DSN and add it to the `.env` file as `SENTRY_DSN`. The other variables are optional.

#### Fully customizable boilerplate out of the box, see images below 👇👇👇

![saas-starter-kit-poster](/public/saas-starter-kit-poster.png)

## 🥇 Features

- Create account
- Sign in with Email and Password
- Sign in with Magic Link
- Sign in with SAML SSO
- Sign in with Google [[Setting up Google OAuth](https://support.google.com/cloud/answer/6158849?hl=en)]
- Sign in with GitHub [[Creating a Github OAuth App](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app)]
- Directory Sync (SCIM)
- Update account
- Create team
- Delete team
- Invite users to the team
- Manage team members
- Update team settings
- Webhooks & Events
- Internationalization
- Audit logs
- Roles and Permissions
- Dark mode
- Email notifications
- E2E tests
- Docker compose
- Prisma Studio
- Update member role
- Directory Sync Events
- Avatar Upload
- SAML SSO
- Audit Log
- Webhook
- Payments
- Security Headers

## ✨ Contributing

Thanks for taking the time to contribute! Contributions make the open-source community a fantastic place to learn, inspire, and create. Any contributions you make are greatly appreciated.

Please try to create bug reports that are:

- _Reproducible._ Include steps to reproduce the problem.
- _Specific._ Include as much detail as possible: which version, what environment, etc.
- _Unique._ Do not duplicate existing opened issues.
- _Scoped to a Single Bug._ One bug per report.

[Contributing Guide](https://github.com/boxyhq/saas-starter-kit/blob/main/CONTRIBUTING.md)

## 🤩 Community

- [Discord](https://discord.gg/uyb7pYt4Pa) (For live discussion with the Open-Source Community and BoxyHQ team)
- [Twitter](https://twitter.com/BoxyHQ) / [LinkedIn](https://www.linkedin.com/company/boxyhq) (Follow us)
- [Youtube](https://www.youtube.com/@boxyhq) (Watch community events and tutorials)
- [GitHub Issues](https://github.com/boxyhq/saas-starter-kit/issues) (Contributions, report issues, and product ideas)

## 🌍 Contributors

<a href="https://github.com/boxyhq/saas-starter-kit/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=boxyhq/saas-starter-kit" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

## 🛡️ License

[Apache 2.0 License](https://github.com/boxyhq/saas-starter-kit/blob/main/LICENSE)
