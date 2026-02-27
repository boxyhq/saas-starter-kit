# MDR SaaS Module — Implementation Status

> Auto-generated handover document. Branch: `claude/mdr-saas-platform-pjNHG`

---

## What Has Been Built

### Phase 1 — Core MDR Foundation ✅ COMPLETE

**Prisma schema additions** (`prisma/schema.prisma`):
- All MDR models: `MdrProject`, `MdrSection`, `MdrDocument`, `MdrDocumentVersion`, `MdrSectionDocument`
- `MdrTransmittal`, `MdrTransmittalDocument`
- `MdrShareLink`, `MdrShareLinkAccess`
- `MdrTemplate`, `MdrEmailInbox`, `MdrInboxEmail`, `MdrInboxAttachment`
- `MdrCompilation`, `MdrProjectMember`, `MdrProjectInvitation`
- `TeamBranding`
- `Team` additions: `mdrQuotaOverride Int?`, `suspended Boolean`, `lastQuotaAlertAt DateTime?`, `lastStorageAlertAt DateTime?`
- `MdrProjectStatus` enum: `ACTIVE | ARCHIVED | FINAL` (FINAL added beyond original plan)
- `MdrFinalizeOption` enum: `KEEP | ARCHIVE`
- `MdrSection.requiredDocCount Int @default(0)` (Phase 9 schema ready)
- `User.twoFactorEnabled Boolean`, `User.twoFactorSecret String?` (Phase 9 schema ready)

**Library files** (`lib/`):
- `lib/s3.ts` — S3 client, presigned PUT/GET URL helpers, all MDR S3 key generators (including `mdrTransmittalCoverSheetKey`)
- `lib/s3Lifecycle.ts` — `deleteProjectS3Objects()`, `archiveS3Object()`, `deleteDocumentIfUnreferenced()`
- `lib/mdr.ts` — `getMdrQuota()`, `checkMdrQuota()`, `assertMdrAccess()`, `assertMdrOwnership()`, `assertMdrNotFinal()`, `assertTeamNotSuspended()`, `getMdrRole()`
- `lib/mdrQueue.ts` — BullMQ queues: `compilationQueue`, `conversionQueue`, `cleanupQueue`, `usageAlertQueue`; payload types
- `lib/gotenberg.ts` — `convertToPdf(buffer, filename)` HTTP client for DOCX/XLSX → PDF
- `lib/mdrExport.ts` — `buildRegisterWorkbook()` SheetJS .xlsx export
- `lib/mdrAudit.ts` — `mdrAuditEvent()` Retraced audit logging helper
- `lib/mdrEvents.ts` — `sendMdrEvent()` Svix webhook event helper
- `lib/mdrTransmittalCoverSheet.ts` — `generateTransmittalCoverSheet()` A4 PDF cover sheet via pdf-lib
- `lib/planFeatures.ts` — `getPlanFeature()`, `assertFeatureEnabled()`, `checkLimit()` (DB-backed plan matrix)
- `lib/zod/mdr.ts` — Zod schemas for all MDR operations

**Workers** (`lib/`):
- `lib/mdrWorker.ts` — BullMQ compilation worker: fetches project + sections + docs, merges PDFs via pdf-lib, applies team branding (logo, colours), uploads to S3, updates `MdrCompilation` status
- `lib/mdrConversionWorker.ts` — BullMQ conversion worker: downloads DOCX/XLSX, calls Gotenberg, stores PDF back to S3, updates `MdrDocument.pdfS3Key`
- `lib/mdrCleanupWorker.ts` — BullMQ cleanup worker: handles `delete_project` (delete S3 objects), `archive_project` (move compilations to GLACIER_IR), `finalize_project` (archive compilations + optionally source docs)
- `lib/mdrUsageAlertWorker.ts` — BullMQ daily-cron worker: checks MDR quota usage per team, sends 80%-threshold alert emails to OWNER/ADMINs (7-day cooldown)

> **Important note**: Worker files use only relative imports (`./prisma`, `./env`, etc.) — NOT `@/` path aliases. The `@/` aliases (defined in tsconfig.json) are NOT resolvable at runtime under `ts-node --transpile-only` because no `tsconfig-paths` is registered. Any new worker file must follow the same all-relative-import pattern.

**API routes** (`pages/api/teams/[slug]/mdr/`):
```
index.ts                                     GET list / POST create (checkMdrQuota)
[mdrId]/
  index.ts                                   GET / PATCH (incl. status:FINAL + lock) / DELETE
  upload-url/index.ts                        POST → presigned S3 PUT (assertMdrNotFinal)
  sections/
    index.ts                                 GET / POST / PATCH reorder (assertMdrNotFinal)
    [sectionId]/
      index.ts                               PATCH / DELETE (assertMdrNotFinal)
      documents/
        index.ts                             GET / POST link / DELETE unlink
        assign-section.ts                    POST cross-MDR section copy
  documents/
    index.ts                                 GET all project docs
    library.ts                               GET cross-team library
    [docId]/
      index.ts                               GET / PATCH / DELETE
      download-url.ts                        GET presigned URL
      versions/
        index.ts                             GET version history
        [versionId]/restore.ts               POST restore version
  templates/
    index.ts                                 GET / POST
    [templateId]/index.ts                    DELETE
  members/
    index.ts                                 GET list + invitations / POST invite
    [memberId]/index.ts                      PATCH role / DELETE
  invitations/
    [invitationId]/index.ts                  DELETE cancel
  transmittals/
    index.ts                                 GET / POST (assertMdrNotFinal)
    [transmittalId]/
      index.ts                               GET / PATCH / DELETE
      documents/index.ts                     POST add docs / DELETE remove
      issue.ts                               POST → generates cover sheet PDF, uploads to S3
      cover-sheet.ts                         GET presigned download URL for cover sheet
      send-email.ts                          POST → sends cover sheet download link to toEmail
  share/
    index.ts                                 GET / POST create share link
    [linkId]/index.ts                        DELETE revoke
  export/
    register.ts                              GET .xlsx export via SheetJS
  clone.ts                                   POST clone MDR structure
  compile/
    index.ts                                 GET list / POST trigger
    [compilationId]/index.ts                 GET status + presigned download URL
  inbox/
    index.ts                                 GET / POST create inbox
    [inboxId]/emails/
      index.ts                               GET emails + attachments
      [emailId]/attachments/[attachId]/route.ts  POST route → creates MdrDocument (atomic tx, assertMdrNotFinal, conversion queue)
```

**Other API routes**:
- `pages/api/teams/[slug]/branding/index.ts` — GET / PATCH branding settings
- `pages/api/teams/[slug]/branding/upload-url.ts` — POST presigned S3 PUT for logo
- `pages/api/mdr/invite/[token].ts` — Public invite accept (POST)
- `pages/api/mdr/share/[token].ts` — Public share link download (POST with optional password, creates MdrShareLinkAccess)
- `pages/api/webhooks/inbound-email.ts` — SendGrid Inbound Parse webhook

**Pages** (`pages/teams/[slug]/mdr/`):
- `index.tsx` — Project list with quota indicator, card grid
- `new.tsx` — Create project wizard
- `[mdrId]/index.tsx` — Project dashboard + "Finalize Project" modal + FINAL banner
- `[mdrId]/structure.tsx` — Section tree editor with drag-and-drop reorder
- `[mdrId]/documents.tsx` — Two-panel: section tree + document table with uploader, version history, status badges
- `[mdrId]/templates.tsx` — Template upload/list/delete per section
- `[mdrId]/compile.tsx` — Trigger compilation, poll status, download; error messages shown inline
- `[mdrId]/inbox.tsx` — Email inbox with smart-suggest routing modal (title/docNumber/section auto-suggest, discipline/revision fields, unrouted badge)
- `[mdrId]/members.tsx` — Member list + invite form + pending invitations
- `[mdrId]/branding.tsx` — Logo upload, placement checkboxes, primary colour picker
- `[mdrId]/transmittals.tsx` — List + create form + Issue + Cover Sheet download + Send Email to recipient
- `[mdrId]/share.tsx` — Share link management: create, set expiry/password, copy URL, revoke

**Public pages**:
- `pages/mdr/invite/[token].tsx` — Invitation accept page
- `pages/mdr/share/[token].tsx` — Public MDR download page (password-optional)

**Components** (`components/mdr/`):
- `MdrNavTabs` — Inner tab bar for MDR sub-pages
- `MdrProjectCard` — Project card for grid
- `MdrSectionTree` — Recursive section tree with drag handles
- `MdrDocumentTable` — Document table with status badges, revision, version history
- `MdrDocumentUploader` — Presigned upload with XHR progress, SHA-256 dedup check
- `MdrMemberList` — Member table with role badge, change role, remove
- `MdrInviteForm` — Email + role invite form

**Extras beyond original plan**:
- `MdrProjectStatus.FINAL` — Irreversible finalization with `assertMdrNotFinal()` guard on all write APIs
- `mdrCleanupWorker.ts` + `mdrUsageAlertWorker.ts` — Background maintenance workers
- Transmittal cover sheet generation (`lib/mdrTransmittalCoverSheet.ts`) + `send-email.ts` endpoint
- `mdrAudit.ts` + `mdrEvents.ts` — Audit + Svix event hooks already wired

---

### Phase 7 — Admin-Configurable Subscription Feature Matrix ✅ COMPLETE

**Models**: `SubscriptionPlan`, `PlanFeature` in schema
**lib/planFeatures.ts**: `getPlanFeature()`, `assertFeatureEnabled()`, `checkLimit()`
**API routes** (`pages/api/admin/plans/`):
- `index.ts` — GET list / POST create plan
- `[planId]/index.ts` — GET / PATCH / DELETE
- `[planId]/features/index.ts` — GET / PUT bulk-replace features
- `[planId]/features/[key].ts` — PATCH single feature

**Pages** (`pages/admin/plans/`):
- `index.tsx` — Plan list with add/active toggle
- `[planId].tsx` — Plan editor with feature matrix table

**Components** (`components/admin/`):
- `AdminShell.tsx` — Admin layout wrapper with nav
- `KpiCard.tsx` — Stat card component
- `PlanFeatureMatrix.tsx` — Feature toggle table

---

### Phase 6 — Super-Admin Module 🔶 ~70% COMPLETE

**Implemented**:
- `pages/api/admin/stats/index.ts` — Aggregated DB stats (users, teams, MDR counts, storage, email volumes)
- `pages/api/admin/users/[userId]/index.ts` — User detail GET
- `pages/api/admin/users/[userId]/suspend.ts` — PATCH suspend/unsuspend
- `pages/api/admin/users/[userId]/impersonate.ts` — POST create impersonation token
- `pages/api/admin/users/index.ts` — GET users list (search, paginated)
- `pages/api/admin/teams/[slug]/index.ts` — Team detail GET
- `pages/api/admin/teams/[slug]/quota.ts` — PATCH mdrQuotaOverride
- `pages/api/admin/teams/[slug]/suspend.ts` — PATCH team suspend
- `pages/api/admin/teams/index.ts` — GET teams list
- `pages/api/admin/jobs/index.ts` — GET compilation jobs (filter by status/team)
- `pages/api/admin/jobs/[compilationId]/retry.ts` — POST re-enqueue failed job
- `pages/api/admin/impersonation/exit.ts` — POST end impersonation session
- `pages/admin/index.tsx` — Stats dashboard (KPI cards, charts)
- `pages/admin/users/index.tsx` — User list with search
- `pages/admin/teams/index.tsx` — Team list
- `pages/admin/jobs/index.tsx` — Job monitor
- `pages/admin/impersonate/start.tsx` — Sets impersonation session
- `AdminImpersonation` Prisma model

**Missing**:
- [ ] `pages/api/admin/stats/stripe.ts` — Live Stripe MRR + plan distribution
- [ ] `pages/api/admin/stats/aws.ts` — S3 bucket size via CloudWatch
- [ ] `pages/api/admin/stats/sendgrid.ts` — Inbound email volume via SendGrid Stats API
- [ ] `pages/api/admin/users/[userId]/plan.ts` — PATCH manual plan assignment
- [ ] `pages/api/admin/teams/[slug]/plan.ts` — PATCH manual subscription for team
- [ ] `pages/admin/users/[userId].tsx` — User detail page (teams, MDR memberships, suspend, impersonate, plan)
- [ ] `pages/admin/teams/[slug].tsx` — Team detail page (members, MDRs + per-project storage, quota form, suspend)
- [ ] `pages/admin/settings/index.tsx` — Site name, logo, footer links, social, cookie notice
- [ ] `components/shared/ImpersonationBanner.tsx` — Fixed yellow bar "Viewing as [user] — Exit"

---

### Phase 8 — Marketing Website + CMS 🔶 ~65% COMPLETE

**Models**: `Page`, `PageSection`, `MediaAsset`, `SiteSetting` in schema

**Implemented**:
- All admin CMS API routes (`pages/api/admin/cms/pages/`, `/sections/`, `/media/`, `/settings/`)
- Admin CMS pages: page list, Tiptap page editor, media library, settings
- Public pages: `pages/index.tsx`, `pages/[slug].tsx`, `pages/blog/index.tsx`
- Marketing components: `MarketingLayout`, `SiteHeader`, `SiteFooter`, `BlogCard`, `RichTextRenderer`, `SectionRenderer`

**Missing**:
- [ ] `pages/pricing.tsx` — Dynamic pricing page from `SubscriptionPlan` DB data (use `PricingTable` component)
- [ ] `pages/api/admin/cms/media/upload-url.ts` — POST → presigned S3 PUT for image uploads in CMS editor
- [ ] `components/marketing/HeroSection.tsx` — Full-width hero with headline/subtext/CTA/image
- [ ] `components/marketing/FeaturesGrid.tsx` — Icon grid cards
- [ ] `components/marketing/PricingTable.tsx` — Plan cards from DB with Stripe links
- [ ] `components/marketing/TestimonialsSection.tsx` — Quote carousel
- [ ] `components/marketing/CtaSection.tsx` — CTA banner
- [ ] `components/marketing/FaqSection.tsx` — Accordion FAQ
- [ ] `components/marketing/CookieBanner.tsx` — GDPR cookie consent (Accept/Necessary only, localStorage)

---

### Phase 9 — Product Quality, Compliance & Operations 🔶 ~25% COMPLETE

**Dependencies installed** (in `package.json`):
- `@sentry/nextjs` ✅, `speakeasy` ✅, `qrcode` ✅, `react-pdf` ✅, `mark.js` ✅

**Schema ready**:
- `MdrSection.requiredDocCount Int @default(0)` ✅
- `MdrShareLinkAccess` model ✅ (share token endpoint already records access events)
- `User.twoFactorEnabled Boolean`, `User.twoFactorSecret String?` ✅

**Partially done**:
- `sentry.client.config.ts` exists; verify `sentry.server.config.ts` and `sentry.edge.config.ts` are present

**Missing**:
- [ ] **MdrActivityLog** — Add `MdrActivityLog` model to `prisma/schema.prisma`; create `lib/mdrActivityLog.ts` with `logMdrActivity()`; add `GET /api/teams/[slug]/mdr/[mdrId]/activity` route; create `pages/teams/[slug]/mdr/[mdrId]/activity.tsx` page; wire `logMdrActivity()` calls into all mutating MDR API handlers
- [ ] **Document Preview** — `GET /api/teams/[slug]/mdr/[mdrId]/documents/[docId]/preview-url.ts` (5-min presigned URL); `components/mdr/MdrDocumentPreview.tsx` using `react-pdf`; wire into document table (click title → preview modal)
- [ ] **Bulk Operations** — `POST /api/teams/[slug]/mdr/[mdrId]/documents/bulk.ts` (actions: move, status, delete); add checkbox column + "Select All" + floating action bar to `documents.tsx`
- [ ] **MDR Progress Tracker** — `GET /api/teams/[slug]/mdr/[mdrId]/progress.ts` (per-section doc count vs requiredDocCount); `components/mdr/MdrProgressBar.tsx`; wire into `structure.tsx` section nodes + `[mdrId]/index.tsx` dashboard
- [ ] **Full-Text Search** — Raw SQL migration adding `searchVector tsvector GENERATED ALWAYS AS (...)` + GIN index on `MdrDocument`; `GET /api/teams/[slug]/mdr/[mdrId]/search.ts` using `$queryRaw websearch_to_tsquery`; debounced search bar in `documents.tsx` using `mark.js` for highlight
- [ ] **2FA** — Routes: `pages/api/auth/2fa/setup.ts`, `verify.ts`, `disable.ts`, `challenge.ts`; page: `pages/auth/2fa-challenge.tsx`; NextAuth `authorize` callback update to redirect to challenge when `twoFactorEnabled`; "Two-Factor Authentication" section in `/settings/security.tsx`
- [ ] **GDPR** — `GET /api/users/[userId]/data-export.ts` (zip user data); `POST /api/users/[userId]/delete-account.ts` (cascade delete + S3 cleanup); Privacy + Terms pre-seeded `Page` records in `prisma/seed.ts`
- [ ] **Sentry** — Verify `sentry.server.config.ts` + `sentry.edge.config.ts` exist; add `Sentry.captureException(error)` in `lib/mdrWorker.ts` and `lib/mdrConversionWorker.ts` catch blocks

---

### Phase 10 — Help Centre & Knowledge Base 🔶 ~20% COMPLETE

**Models**: `HelpCategory`, `HelpArticle` in schema ✅
**Empty stub directories exist** (no `.ts` files inside):
- `pages/api/admin/help/articles/[articleId]/`
- `pages/api/admin/help/categories/[categoryId]/`
- `pages/api/help/articles/[slug]/`

**Missing — Admin Help APIs** (`pages/api/admin/help/`):
- [ ] `categories/index.ts` — GET tree / POST create
- [ ] `categories/reorder.ts` — PATCH bulk reorder
- [ ] `categories/[categoryId]/index.ts` — GET / PATCH / DELETE
- [ ] `articles/index.ts` — GET list (search, filter) / POST create
- [ ] `articles/[articleId]/index.ts` — GET / PATCH / DELETE
- [ ] `articles/[articleId]/publish.ts` — POST set PUBLISHED
- [ ] `articles/[articleId]/unpublish.ts` — POST set DRAFT

**Missing — Admin Help Pages** (`pages/admin/help/`):
- [ ] `index.tsx` (redirect → categories)
- [ ] `categories/index.tsx` — Draggable category tree, add/edit/delete
- [ ] `categories/[categoryId].tsx` — Edit category: title, slug, icon, planFeature, parent
- [ ] `articles/index.tsx` — Article list with search/filter + edit links
- [ ] `articles/new.tsx` — Create article: category, title, auto-slug
- [ ] `articles/[articleId].tsx` — Full Tiptap WYSIWYG editor + publish toggle + stats

**Missing — Public Help APIs** (`pages/api/help/`):
- [ ] `search.ts` — GET `?q=` PostgreSQL tsquery search (published articles only)
- [ ] `context.ts` — GET `?pathname=` returns 5 articles matching `pageContext` pattern
- [ ] `articles/[slug]/index.ts` — GET article + increment `views` counter
- [ ] `articles/[slug]/feedback.ts` — POST `{ helpful: boolean }` → increment counters

**Missing — Public Help Pages** (`pages/help/`):
- [ ] `index.tsx` — Help home: search bar + category grid + popular articles
- [ ] `[categorySlug]/index.tsx` — Category page: sub-categories + article list
- [ ] `[categorySlug]/[articleSlug].tsx` — Article: full content, breadcrumb, "Was this helpful?" widget, related articles

**Missing — In-App Help**:
- [ ] `pages/teams/[slug]/support.tsx` — In-app support page (plan-filtered help + "Contact Support")
- [ ] `components/shared/HelpWidget.tsx` — Fixed "?" button bottom-right, slides in contextual article panel based on `useRouter().pathname`

**Missing — Seed Data**:
- [ ] Add help categories + placeholder articles to `prisma/seed.ts` (15 categories, ~60 articles as per plan)

**Also needed — DB migration**:
```sql
ALTER TABLE "HelpArticle" ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(excerpt,''))) STORED;
CREATE INDEX "HelpArticle_searchVector_idx" ON "HelpArticle" USING GIN("searchVector");
```

---

## Key Technical Notes for Next Chat

### Architecture patterns to follow
1. **API route pattern**: `throwIfNoTeamAccess(req, res)` → `getCurrentUserWithTeam(req, res)` → `throwIfNotAllowed(user, 'mdr', 'read'|'update')` → validate with Zod → Prisma → `res.status(200).json({ data: ... })`
2. **Error handling**: Throw `new ApiError(statusCode, message)` — caught by wrapper and returned as `{ error: { message } }`
3. **MDR access guard**: `assertMdrOwnership(mdrId, team.id)` for team-scoped check; `assertMdrAccess(mdrId, userId, team.id, 'EDITOR')` for role-based
4. **Write lock**: Call `assertMdrNotFinal(mdrId)` at the top of every mutating MDR handler
5. **Worker imports**: Workers use ONLY relative imports (e.g. `'./prisma'`, `'./env'`) — never `@/lib/*` path aliases (tsconfig paths are not resolved at runtime by ts-node --transpile-only)
6. **Feature gating**: `assertFeatureEnabled(teamId, 'feature_key')` or `checkLimit(teamId, 'mdr_projects', count)` from `lib/planFeatures.ts`
7. **Page pattern**: `getServerSideProps` exports `teamFeatures`; returns `{ notFound: true }` if `!env.teamFeatures.mdr`; uses `useTeam()` + `useSWR(fetcher)` for data

### Environment variables required
```bash
AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET
REDIS_URL
MDR_PLAN_LIMITS (JSON), MDR_DEFAULT_LIMIT
SENDGRID_INBOUND_WEBHOOK_SECRET, MDR_INBOUND_EMAIL_DOMAIN
GOTENBERG_URL
ADMIN_EMAILS
SENTRY_DSN, NEXT_PUBLIC_SENTRY_DSN
```

### Procfile (current)
```
web: ./node_modules/.bin/next start
worker: ts-node --transpile-only lib/mdrWorker.ts
conversion-worker: ts-node --transpile-only lib/mdrConversionWorker.ts
cleanup-worker: ts-node --transpile-only lib/mdrCleanupWorker.ts
usage-alert-worker: ts-node --transpile-only lib/mdrUsageAlertWorker.ts
```

---

## Commit History (this branch)

| Commit | Description |
|---|---|
| `27ba29c` | fix: inline quota resolver in mdrUsageAlertWorker to avoid @/ alias crash |
| `d71bf1b` | feat: close remaining gaps — cleanup/usage-alert workers, transmittal email, error display |
| `fbbfc97` | feat(mdr): email inbox smart routing (Track C) |
| `5736ab0` | feat(mdr): project finalization workflow — status:FINAL + write lock-down (Track D) |
| `dfddda1` | feat(mdr): generate branded PDF cover sheet on transmittal issue (Track B) |
| `28002a6` | feat(mdr): wire TeamBranding into PDF compilation (Track A) |
| `543aea1` | fix(ts): repair MDR/lib TypeScript errors |
| `296fa12` | fix(ts): resolve TS2350 and TS2554 codebase-wide TypeScript errors |
| `62bfcaf` | fix(cms): resolve TypeScript errors in CMS components and API routes |
| `52ad9f8` | feat(cms): add CMS link to admin sidebar navigation |

---

## Coverage Summary

| Phase | Description | Status |
|---|---|---|
| 1 | Core MDR (schema, APIs, pages, components) | ✅ 100% |
| 2 | PDF compilation + file conversion workers | ✅ 100% |
| 3 | Email inbox + webhook | ✅ 100% |
| 4 | Transmittals + share links + export + branding | ✅ 100% |
| 5 | Templates + clone + version history | ✅ 100% |
| 6 | Super-admin module | 🔶 ~70% |
| 7 | DB-backed subscription feature matrix | ✅ 100% |
| 8 | Marketing website + CMS | 🔶 ~65% |
| 9 | Product quality / compliance / ops | 🔶 ~25% |
| 10 | Help centre & knowledge base | 🔶 ~20% |
