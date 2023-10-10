# Contributing

Contributions make the open-source community a fantastic place to learn, inspire, and create. Any contributions you make are greatly appreciated.

The development branch is `main`. This is the branch that all pull requests should be made against.

Please try to create bug reports that are:

- Reproducible. Include steps to reproduce the problem.
- Specific. Include as much detail as possible: which version, what environment, etc.
- Unique. Do not duplicate existing opened issues.
- Scoped to a Single Bug. One bug per report.

## Code Style

Please follow the [node style guide](https://github.com/felixge/node-style-guide).

## Testing

Please test your changes before submitting the PR.

## Good First Issues

We have a list of help wanted that contains small features and bugs with a relatively limited scope. Nevertheless, this is a great place to get started, gain experience, and get familiar with our contribution process.

## Development

Please follow these simple steps to get a local copy up and running.

### 1. Setup

- [Fork](https://github.com/boxyhq/saas-starter-kit/fork) the repository
- Clone the repository by using this command:

```bash
git clone https://github.com/<your_github_username>/saas-starter-kit.git
```

### 2. Go to the project folder

```bash
cd saas-starter-kit
```

### 3. Install dependencies

```bash
npm install
```

### 4. Set up your .env file

Duplicate `.env.example` to `.env`.

```bash
cp .env.example .env
```

### 5. Set up database schema

```bash
npx prisma db push
```

### 6. Start the server

In a development environment:

```bash
npm run dev
```
