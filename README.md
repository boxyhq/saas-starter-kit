<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/boxyhq/jackson/assets/66887028/871d9c0f-d351-49bb-9458-2542830d7910">
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/boxyhq/jackson/assets/66887028/4073c181-0653-4d5b-b74f-e7e84fe79da8">
  <img alt="BoxyHQ Banner" src="https://github.com/boxyhq/jackson/assets/66887028/b40520b7-dbce-400b-88d3-400d1c215ea1">
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

Video - [BoxyHQ's SaaS Starter Kit: Your Ultimate Enterprise-Compliant Boilerplate](https://www.youtube.com/watch?v=oF8QIwQIhyo) <br>
Blog - [Enterprise-ready Saas Starter Kit](https://boxyhq.com/blog/enterprise-ready-saas-starter-kit)

Next.js-based SaaS starter kit saves you months of development by starting you off with all the features that are the same in every product, so you can focus on what makes your app unique.

## 🛠️ Built With

- [Next.js](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Postgres](https://www.postgresql.org)
- [React](https://reactjs.org)
- [Prisma](https://www.prisma.io)
- [TypeScript](https://www.typescriptlang.org)
- [SAML Jackson](https://github.com/boxyhq/jackson) (Provides SAML SSO, Directory Sync)
- [Svix](https://www.svix.com/) (Provides Webhook Orchestration)
- [Retraced](https://github.com/retracedhq/retraced) (Provides Audit Logs Service)

## 🚀 Deployment

<a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fboxyhq%2Fsaas-starter-kit&env=NEXTAUTH_SECRET,SMTP_HOST,SMTP_PORT,SMTP_USER,SMTP_PASSWORD,SMTP_FROM,DATABASE_URL,APP_URL">
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

- Node.js (Version: >=18.x)
- PostgreSQL
- NPM
- Docker compose

### Development

#### 1. Setup

- [Fork](https://github.com/boxyhq/saas-starter-kit/fork) the repository
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

#### 4. Set up your .env file

Duplicate `.env.example` to `.env`.

```bash
cp .env.example .env
```

#### 5. Create a database (Optional)

To make the process of installing dependencies easier, we offer a `docker-compose.yml` with a Postgres container.

```bash
docker-compose up -d
```

#### 6. Set up database schema

```bash
npx prisma db push
```

#### 7. Start the server

In a development environment:

```bash
npm run dev
```

#### 8. Start the Prisma Studio

Prisma Studio is a visual editor for the data in your database.

```bash
npx prisma studio
```

#### 9. Testing

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

#### Fully customizable boilerplate out of the box, see images below 👇👇👇

![saas-starter-kit-poster](/public/saas-starter-kit-poster.png)

## 🥇 Features

Each feature in our application is designed with user experience in mind:

- **Create account**: Users can create their own account.
- **Sign in with Email and Password**: Users can sign in using their email and password.
- **Sign in with Magic Link**: Users can sign in using a magic link sent to their email.
- **Sign in with SAML SSO**: Users can sign in using SAML Single Sign-On.
- **Sign in with Google**: Users can sign in using their Google account. [Setting up Google OAuth](https://support.google.com/cloud/answer/6158849?hl=en)
- **Sign in with GitHub**: Users can sign in using their GitHub account. [Creating a Github OAuth App](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app)
- **Directory Sync (SCIM)**: Our application supports directory synchronization using SCIM.
- **Update account**: Users can update their account details.
- **Create team**: Users can create their own teams.
- **Delete team**: Users can delete their teams.
- **Invite users to the team**: Team owners can invite other users to their team.
- **Manage team members**: Team owners can manage their team members.
- **Update team settings**: Team owners can update their team settings.
- **Webhooks & Events**: Our application supports webhooks and events for real-time updates.
- **Internationalization**: Our application supports multiple languages.
- **Audit logs**: Our application maintains audit logs for security and compliance.
- **Roles and Permissions**: Our application has a robust roles and permissions system.
- **Dark mode**: Users can switch to dark mode for a better viewing experience in low light.
- **Email notifications**: Our application sends email notifications for important updates.
- **E2E tests**: Our application is thoroughly tested with end-to-end tests.
- **Docker compose**: Our application supports Docker compose for easy deployment.
- **Prisma Studio**: Our application uses Prisma Studio for database management.
- **Update member role**: Team owners can update the roles of their team members.
- **Directory Sync Events**: Our application handles directory sync events.
- **Avatar Upload**: Users can upload their own avatars.
- **SAML SSO**: Our application supports SAML Single Sign-On.
- **Audit Log**: Our application maintains audit logs for security and compliance.
- **Webhook**: Our application supports webhooks for real-time updates.
- **Payments**: Our application supports online payments.
- **Security Headers**: Our application sets security-related HTTP headers.

## ➡️ Coming Soon

- Billing & subscriptions
- Unit and integration tests

## 📚 Architecture
Next.js: This is a React framework that provides features such as server-side rendering and static site generation. It's used for building the user interface of your application. The main configuration for Next.js can be found in next.config.js.

React: This is a JavaScript library for building user interfaces. It's used for creating the interactive elements of your application. The React components are located in the components directory.

TypeScript: This is a typed superset of JavaScript that compiles to plain JavaScript. It's used to make the code more robust and maintainable. TypeScript definitions and configurations can be found in files like next-env.d.ts and i18next.d.ts.

Prisma: This is an open-source database toolkit. It's used for object-relational mapping, which simplifies the process of writing database queries. Prisma configuration and schema can be found in the prisma directory.

Postgres: This is a powerful, open source object-relational database system. It's used for storing application data. The connection to Postgres is likely managed through Prisma.

Tailwind CSS: This is a utility-first CSS framework for rapidly building custom user interfaces. It's used for styling the application. The configuration for Tailwind CSS can be found in postcss.config.js.

Svix: This is a service for handling webhooks. It's used to emit events on user/team CRUD operations, which can then be caught and handled by other parts of the application or external services. The integration of Svix is distributed throughout the codebase, primarily in areas where Create, Read, Update, and Delete (CRUD) operations are executed.

SAML Jackson: This is a service for handling SAML SSO (Single Sign-On). It's used to allow users to sign in with a single ID and password to any of several related systems i.e (using a single set of credentials). The implementation of SAML Jackson is primarily located within the files associated with authentication.

Retraced: This is a service for audit logging and data visibility. It helps track user activities within the application i.e (who did what and when in the application). The usage of Retraced would be dispersed throughout the codebase, likely in the files where important actions are performed.

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
