# ADR-0001: Adopt BoxyHQ Starter Kit (single-app baseline)

- **Status:** Accepted
- **Date:** 2025-11-01
- **Owners:** Nick / PAM Core
- **Decision type:** Architecture / Project structure

## Context

We need a stable, auth-ready platform to accelerate the PAM MVP without reinventing base SaaS plumbing (auth, teams, billing, audit, e2e, i18n). BoxyHQ’s Starter Kit provides Next.js + TypeScript + Prisma/Postgres, NextAuth + SSO/SCIM, Stripe/Svix, Retraced audit logs, and Playwright scaffolding out of the box.

## Options Considered

- **A) Generic pnpm Monorepo**  
  _Pros:_ flexible workspaces, clean separation of API/worker/web.  
  _Cons:_ added infra/tooling complexity, redundant boilerplate vs. Starter Kit, slower path to shipping MVP.

- **B) Single-App BoxyHQ Baseline (Chosen)**  
  _Pros:_ minimal changes, working auth/teams/billing/audit on day 0, simpler deployment and local dev, direct Prisma usage.  
  _Cons:_ fewer hard boundaries between concerns; workers/jobs live in-process or as nested directories until scale demands extraction.

## Decision

Adopt the **existing BoxyHQ single-app structure**, keeping the root app for web/API/DB. We will **preserve starter conventions** (no new `apps/` or `packages/` now). New functionality (e.g., ingestion jobs, calc runner) will start as **simple nested directories or server actions**. We will extract to dedicated services only when complexity or SLOs require it.

## Consequences

- **Positive**

  - Minimal configuration and migration effort; fastest path to MVP.
  - Immediate leverage of Starter Kit features (auth, SSO/SCIM, billing, audit, i18n, e2e).
  - Single Prisma client and schema simplify data access and migrations.

- **Trade-offs / Risks**
  - Tighter coupling inside one app until we modularize.
  - Background work initially shares deploy lifecycle with the web app.
  - Requires discipline: clear module boundaries, ADRs for future extractions.

## Implementation Notes

- Enforce **pnpm** as the only package manager (`packageManager`, `preinstall` guard).
- Keep folder layout aligned with upstream; no `apps/` or `packages/` yet.
- Add ADRs when extracting: e.g., “Extract calc runner to worker service” with SLO/throughput triggers.

## Links

- Upstream repo (reference for conventions and scripts): `boxyhq/saas-starter-kit` (main)
