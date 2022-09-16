# Enterprise SaaS Starter Kit

The Open Source Next.js Enterprise SaaS Starter Kit.

Boxy is an MIT-licensed Next.js based framework that saves you months of development by starting you off with all the features that are the same in every product, so you can focus on what makes your app unique.

## Built With

- [Next.js](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Postgres](https://www.postgresql.org)
- [React](https://reactjs.org)
- [Prisma](https://www.prisma.io)
- [TypeScript](https://www.typescriptlang.org)
- [SAML Jackson](https://github.com/boxyhq/jackson)

## Getting Started

Please follow these simple steps to get a local copy up and running.

### Prerequisites

- Node.js (Version: >=15.x <17)
- PostgreSQL
- NPM

### Development

Please follow these simple steps to get a local copy up and running.

#### 1. Setup

Clone or fork this GitHub repository

```bash
git clone https://github.com/boxyhq/saas-starter-kit.git
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

#### 5. Set up database schema

```bash
npx prisma db push
```

#### 6. Start the server

In a development environment:

```bash
npm run dev
```

## Features

- Create account
- Sign in with Email and Password
- Sign in with Magic Link
- Sign in with SAML SSO
- Directory Sync (SCIM)
- Update account
- Create team
- Invite users to the team
- Manage team members
- Update team settings
- Configure SAML SSO

## Coming Soon

- Audit logs
- Unit and integration tests
- Dark mode
- Mobile-first UI
- Billing & subscriptions
- Internationalization
- Roles and Permissions

## Contributing

Contributions make the open-source community a fantastic place to learn, inspire, and create. Any contributions you make are greatly appreciated.

[Contributing Guide](https://github.com/boxyhq/saas-starter-kit/blob/main/CONTRIBUTING)

## Community

- [Discord](https://discord.gg/uyb7pYt4Pa) (For live discussion with the Community and BoxyHQ team)
- [GitHub](https://github.com/boxyhq/saas-starter-kit/issues) (Bug reports, Contributions)
- [Twitter](https://twitter.com/BoxyHQ) (Get the news fast)

## License

[Apache 2.0 License](https://github.com/boxyhq/saas-starter-kit/blob/main/LICENSE)
