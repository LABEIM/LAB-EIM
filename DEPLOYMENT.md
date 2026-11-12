# Deployment & Hosting Guide (Cloudflare Workers Primary & Vercel Backup)

This guide provides step-by-step instructions for local development, deploying to **Cloudflare Workers** (Primary Host), configuring **Keystatic Cloud**, setting up **Vercel** (Failover Backup), and managing the automated dual-hosting CI/CD pipeline.

---

## Architecture Overview

```
                          ┌───────────────────────────┐
                          │   GitHub Repository       │
                          │   push to main branch     │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │  GitHub Actions Pipeline  │
                          │  (astro check & build)    │
                          └─────────────┬─────────────┘
                                        │
                       ┌────────────────┴────────────────┐
                       │                                 │
                       ▼ (Primary)                       ▼ (Failover Backup)
        ┌─────────────────────────────┐   ┌─────────────────────────────┐
        │   Cloudflare Workers        │   │   Vercel Deployment         │
        │   Worker + static assets    │   │   Prerendered static site   │
        │   (wrangler deploy)         │   │   (dist/client)             │
        └──────────────┬──────────────┘   └──────────────┬──────────────┘
                       │                                 │
                       ▼                                 ▼
             Primary Custom Domain                     Backup Subdomain
            (e.g., eim-lab.org /                   (e.g., backup.eim-lab.org
             lab-eim.<subdomain>.workers.dev)       or lab-eim.vercel.app)
```

- **Build Export**: Prerendered pages in `dist/client/`; the Worker entry and generated Wrangler config in `dist/server/` (`pnpm run build`).
- **Primary Hosting**: Cloudflare Workers, direct upload of the Worker plus assets (`wrangler deploy`).
- **Backup Hosting**: Vercel static deployment of `dist/client` (`vercel deploy --prebuilt`).

---

## 1. Local Development

Follow these steps to set up and run the website locally on your machine.

### Prerequisites

- **Node.js**: Version `>=22.12.0` (required by Astro 7+ runtime constraints).
- **pnpm**: Package manager (the shared CI installs `latest`; `pnpm-lock.yaml` pins resolutions).

### 1.1 Install Dependencies

In the root directory, run:
```bash
pnpm install
```

### 1.2 Environment Configuration

Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```
Fill in the appropriate values for your local environment (see Section 3.3 for environment variable details).

### 1.3 Run Development Server

To start the local development server:
```bash
pnpm run dev
```
Once started, access the site at [http://localhost:4321](http://localhost:4321).

### 1.4 Type-Checking & Diagnostics

To run Astro type checks and framework diagnostics:
```bash
pnpm exec astro check
```

### 1.5 Local Production Build

To test compiling the production static build locally:
```bash
pnpm run build
```
The compiled prerendered pages are exported to `dist/client/`, and the Worker entry (`dist/server/entry.mjs`) plus the adapter-generated Wrangler config (`dist/server/wrangler.json`) are written to `dist/server/`.

### 1.6 Audit Benchmark Content & Developer URL Testing Toggles

Content entries marked with `audit: true` (e.g. `src/content/news/audit-benchmark-news.md` and `src/content/events/audit-benchmark-event.md`) serve as fixed benchmark content for CI/CD performance testing and as sample cards in local development.

- **Environment Behavior**:
  - **Production Builds**: `audit: true` content is automatically filtered out from news, events, and homepage listings.
  - **Local Development & Preview Deployments**: `audit: true` content is retained as example cards when browsing.

- **URL Query Parameters for Developer Testing**:
  When testing locally or in preview environments, the following URL query parameters can be appended to `/news/` or `/event/`:
  - `?audit=false` (or `?audit=0`): Hides ONLY `audit: true` benchmark cards. Regular non-audit cards remain visible.
  - `?empty=true` (or `?mock_empty=true`): **Force-hides ALL content cards** (both regular and audit) to test empty state page layouts ("Belum Ada Berita" / "Belum Ada Kegiatan") even when items exist in the CMS.

---

## 2. Primary Deployment: Cloudflare Workers

### 2.1 Worker Creation
**Zero Manual Worker Creation Required**:
The Shared-CICD `deploy-cloudflare` action (`cloudflare_mode: 'ssr'`) creates the Worker (`lab-eim`) on its first deploy using `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. `wrangler.json` supplies the Worker name and compatibility flags; the adapter generates `main` and `assets` into `dist/server/wrangler.json`.

The account's `workers.dev` subdomain must be registered: Dashboard > **Workers & Pages** > **Your subdomain**. Direct uploads always expose `workers_dev` and preview URLs. Each deployment version also gets a public preview URL (`preview_urls: true`); treat those URLs as public.

### 2.2 Obtaining Cloudflare Credentials

#### A. Cloudflare Account ID
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. On the overview page (or under **Workers & Pages** in the right sidebar), locate **Account Details**.
3. Under **Account ID**, click the copy icon to copy your hex Account ID string (e.g. `f9bfa5167a145b0c2ff643b...`).

#### B. Cloudflare API Token
1. Go to **Manage account** > **Account API Tokens** (or **My Profile** > **API Tokens**).
2. Click **Create Token**.
3. Scroll to **Custom Token** and click **Get started**.
4. Set **Token name**: `GitHub Actions - Cloudflare Workers Deploy`.
5. Under **Permission policies**:
   - Scope: the Cloudflare account that owns Worker `lab-eim`.
   - Category **Developer Platform**:
     - **Workers Scripts**: Select `Edit` (grants deploy and preview permissions).
6. Under **Token expiration**, set an expiry (for example 90 days) and rotate the GitHub secret before it lapses.
7. Click **Continue to summary** -> **Create Token**.
8. Copy the generated secret token string.

### 2.3 Primary Custom Domain Setup
1. If `eim-lab.org` is still attached to the old Pages project, remove it from that project first.
2. In **Workers & Pages** > Worker (`lab-eim`) > **Settings** > **Domains & Routes**, add a custom domain.
3. Enter your main domain (e.g. `eim-lab.org` or `www.eim-lab.org`) and activate DNS routing. The zone must be active on Cloudflare.
4. Verify that `/keystatic` loads (see Section 3.2).

> Adding the domain is a dashboard action performed with your Cloudflare login; the CI API token does not need zone (DNS) permissions.

---

## 3. Keystatic CMS Configuration (Keystatic Cloud)

Keystatic CMS (`/keystatic`) is a git-based admin UI for managing content. Production uses **Keystatic Cloud** storage and local development uses local file storage; content remains in the repository's Markdown and JSON files.

### 3.1 Setting Up Keystatic Cloud

1. Sign in at [keystatic.cloud](https://keystatic.cloud) with GitHub.
2. Create a project connected to `LABEIM/LAB-EIM` and install the Keystatic GitHub App on the repository.
3. Copy the project slug (`<team>/<project>`); this repository uses `eimlab/lab-eim`, set in `keystatic.config.ts` as `cloud.project`.

Keystatic Cloud needs no environment variables or Worker secrets. Development (`pnpm run dev`) keeps using local storage; no cloud credentials are needed locally. `astro dev` runs on Node (the Cloudflare adapter is applied only to builds) because Keystatic's local storage needs filesystem access.

### 3.2 Worker Compatibility (`nodejs_compat`)

Keystatic API routes require Node.js compatibility. `wrangler.json` sets `nodejs_compat` and `assets_navigation_has_no_effect`. The latter makes a browser navigation to `/keystatic` (which has no matching static asset) invoke the Worker instead of being answered by the assets layer with a 404. The shared deploy action preserves these flags in `dist/server/wrangler.json`.

### 3.3 Environment Variables Reference

Build-time `PUBLIC_*` values can come from GitHub secrets or variables. Since Shared-CICD v2.3.0, a name defined in both with **different values fails the build** instead of silently picking one; an empty variable does not override a non-empty secret. Keystatic Cloud needs no runtime variables.

| Variable Name | Description | Example / Required Target |
| :--- | :--- | :--- |
| `PUBLIC_GOOGLE_SHEET_SCRIPT_URL` | Web App deployment URL for Google Apps Script endpoint | `https://script.google.com/macros/s/.../exec` |
| `PUBLIC_RECRUITMENT_SECRET` | Passphrase matching `SECRET_KEY` in Apps Script Properties | `your_secret_passphrase_here` |
| `PUBLIC_SITE_URL` | Canonical origin Astro uses for `site` (canonical and Open Graph URLs) | `https://eimlab.org` |

> [!NOTE]
> `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`, and `KEYSTATIC_SECRET` were used by the previous GitHub storage mode. Cloud mode needs none of them.

---

## 4. Failover Deployment: Vercel Backup

Vercel serves as an automated parallel build target and failover backup if Cloudflare Workers experiences service degradation. It deploys the prerendered site from `dist/client`; the Keystatic admin (`/keystatic`, `/api/keystatic/*`) is Worker-only and is not available on the backup.

### 4.1 Configuring Vercel Project

1. Import your GitHub repository to [Vercel](https://vercel.com/).
2. Framework Preset: Select **Astro**. GitHub Actions deploys prebuilt output (`dist/client`), so Vercel's own build and output settings are not used.
3. Add the build-time environment variables listed in Section 3.3.

### 4.2 Preventing Duplicate Deployments (Vercel Ignored Build Step)

Because Vercel automatically triggers builds on git pushes by default, you must configure Vercel to allow GitHub Actions to act as the exclusive, gated deployment controller:

1. Go to your Vercel Project Dashboard -> **Settings** -> **Build and Deployment**.
2. Scroll down to **Ignored Build Step**.
3. Under **Behavior**, select **Don't build anything** (this automatically sets the ignore command to `exit 0`).
4. Click **Save**.

*This ensures Vercel only deploys when commanded by GitHub Actions (`ci-cd.yml`) after CI validation passes.*

### 4.3 Backup Domain Setup
1. In Vercel Project Settings -> **Domains**, assign a backup subdomain (e.g. `backup.eim-lab.org` or use the default `lab-eim.vercel.app`).

---

## 5. CI/CD Pipeline & Operational Procedures

The repository's workflow ([`.github/workflows/ci-cd.yml`](file:///.github/workflows/ci-cd.yml)) is a thin caller for the organization-wide [Shared-CICD](https://github.com/LABEIM/Shared-CICD) reusable pipeline (`deploy-app.yml@v2`). Quality gates, build, deployment retry logic, preview comments, and Lighthouse auditing all live in that shared workflow; this repository only supplies its inputs and secrets.

### 5.1 Repository Secrets & Variables

In GitHub go to **Settings** > **Secrets and variables** > **Actions**.

**Secrets** (credentials only):

- `CLOUDFLARE_API_TOKEN`: Created in Section 2.2B.
- `VERCEL_TOKEN`: Vercel Personal Access Token ([Vercel Account Settings > Tokens](https://vercel.com/account/tokens)).
- `CLOUDFLARE_ACCOUNT_ID`: optional fallback; prefer the variable below.

**Variables** (identifiers and public build config):

- `PUBLIC_GOOGLE_SHEET_SCRIPT_URL`, `PUBLIC_RECRUITMENT_SECRET`, `PUBLIC_SITE_URL`: all three are public (the endpoint URL and token ship in the HTML), so variables are enough.
- A `PUBLIC_*` name defined in both a secret and a variable with different values fails the build with the conflicting names; an empty variable does not override a non-empty secret. Variables are **not** masked in Actions logs, so never store a non-public value under a `PUBLIC_*` name.
- `CLOUDFLARE_ACCOUNT_ID`: passed through the `cloudflare_account_id` input; the secret is used when the variable is empty.
- `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`: found in `.vercel/project.json` or the Vercel dashboard. Required as **variables**, not secrets, because reusable-workflow `with:` inputs cannot read the `secrets` context.

Keystatic Cloud needs no Worker runtime secrets, so there is nothing to set on the Worker itself (Section 3.1).

The Vercel backup deployment is enabled automatically when both Vercel variables are present.

> **Note:** The Cloudflare Worker name (`lab-eim`) is set as the `cloudflare_project_name` input in `ci-cd.yml`. Change it there if the Worker is renamed. `production_branch: 'main'` is what marks a run as a production deploy; since Shared-CICD v2.3.0 it is required, and any other branch, tag, or release deploys to a preview environment.

### 5.2 Pipeline Stages (`ci-cd.yml`)

```
┌─────────────────────────────────────────────────────────────────┐
│ validate-and-build (15 min timeout, Shared-CICD)                │
│ ├─ pnpm install --frozen-lockfile (cached)                      │
│ ├─ Export PUBLIC_* values (variable > secret)                    │
│ ├─ pnpm exec astro check                                        │
│ ├─ pnpm run build + SHA256 hash                                 │
│ └─ Upload dist/ artifact                                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│ deploy-cloudflare        │  │ deploy-vercel (optional) │
│ (10 min, 3x retry)      │  │ (10 min, 3x retry)       │
│ Primary + GH Environment│  │ Backup + GH Environment  │
└────────────┬─────────────┘  └────────────┬─────────────┘
             │                              │
             └──────────┬───────────────────┘
                        ▼
              ┌─────────────────────┐     ┌───────────────────┐
              │ comment-pr (5 min)  │     │ lighthouse (10min) │
              │ PR preview table    │     │ 3 runs, score gate │
              └─────────────────────┘     └───────────────────┘
```

1. **`validate-and-build`**: Installs dependencies with `pnpm install --frozen-lockfile`, exports `PUBLIC_*` values (variables win over secrets) to the build environment, runs `pnpm exec astro check` and `pnpm run build`, and uploads the compiled artifact. The build emits prerendered pages in `dist/client/` and the Worker (`dist/server/entry.mjs` plus the adapter-generated `dist/server/wrangler.json`) in `dist/server/`. With `cloudflare_mode: 'ssr'`, the deploy job uploads the Worker and its assets, so `/keystatic` and `/api/keystatic/*` run in the Worker.
2. **`deploy-cloudflare` & `deploy-vercel`**: Deploys the Worker plus assets to Cloudflare Workers (Primary) and, when the Vercel variables are configured, the prerendered `dist/client` output to Vercel (Backup) **in parallel** with **retry logic** (3 attempts, exponential backoff). `deploy-cloudflare` reads the Production URL from the deploy log on `main` (normally `https://lab-eim.<subdomain>.workers.dev`) and takes a preview's URL from Wrangler's `--json` output (normally `https://<branch>-lab-eim.<subdomain>.workers.dev`). Since Shared-CICD v2.3.1 a constructed alias is published only after it answers, so a preview URL can be empty rather than a dead link. Both jobs register GitHub Deployment environments for deploy tracking.
3. **`comment-pr` (Post PR Preview Comment)**: Posts or updates a formatted table with the live Cloudflare and Vercel preview deployment URLs, commit SHA, and workflow run link on Pull Requests.
4. **`lighthouse`**: Audits the routes listed in `lighthouse_routes` with **3 runs** each (representative median score) against the live Cloudflare URL when one was published, falling back to serving the prerendered `dist/client` output locally (so in `cloudflare_mode: 'ssr'` a missing preview URL means the Worker itself is not tested), and appends parsed scores to `$GITHUB_STEP_SUMMARY` and the PR preview comment. On **Pull Requests**, a failing Lighthouse score marks the PR check failed. On **push to `main`**, it serves as post-deploy monitoring. Score thresholds:
   - Performance: ≥ 80% (warn only)
   - Accessibility: ≥ 90% (error — blocks PR merge)
   - Best Practices: ≥ 90% (error — blocks PR merge)
   - SEO: ≥ 90% (error on `main`, warn on pull requests; `is-crawlable` check turned off so platform `X-Robots-Tag: noindex` headers on preview builds do not skew score calculations)

### 5.3 Pipeline Security & Reliability Features

- **Shared Workflow Pinning**: This repository pins the Shared-CICD reusable workflow to the floating `v2` major tag. Action SHA pinning and dependency updates are maintained inside Shared-CICD.
- **Principle of Least Privilege**: The caller grants only `contents: read`, `pull-requests: write`, and `deployments: write`; the shared workflow cannot exceed those permissions.
- **Scoped Credentials**: `secrets: inherit` passes the repository secrets into the shared workflow. Only `PUBLIC_*` values (variables or secrets) are exported to the build environment; deployment tokens stay scoped to the deploy steps.
- **Path Filtering (`paths-ignore`)**: Push events to `main` ignore root documentation updates (`README.md`, `DEPLOYMENT.md`, etc.), saving CI runner minutes while preserving full verification for content (`src/content/`) and source code. PR events always run full verification.
- **Centralized pnpm settings**: `pnpm-workspace.yaml` carries the `@emnapi/runtime`, `path-to-regexp`, `miniflare>undici`, and `miniflare>sharp` overrides plus the `allowBuilds` list for esbuild/workerd install scripts.
- **Job Timeouts & Retries**: The shared workflow applies explicit job timeouts (5–15 minutes) and retries Cloudflare/Vercel deployments up to 3 times with exponential backoff (10s → 20s → 40s).
- **Concurrency Control**: Duplicate runs on the same branch are automatically cancelled.
- **Artifact Integrity**: The shared workflow generates a SHA256 hash for the build artifact before deployment.

### 5.4 Manual Dispatch Triggers

To manually deploy from GitHub Actions:
1. Go to GitHub Actions tab > **CI/CD Pipeline** > **Run workflow**.
2. Choose the branch and run. The workflow deploys to Cloudflare Workers, plus Vercel when `VERCEL_PROJECT_ID` and `VERCEL_ORG_ID` are configured as repository variables. There is no per-run target selector; enable or disable Vercel by adding or removing those variables.

### 5.5 Emergency Manual Failover Procedures

If Cloudflare Workers experiences an outage:

- **Option A (GitHub Actions)**: Ensure `VERCEL_PROJECT_ID` and `VERCEL_ORG_ID` are set as repository variables, then run the **CI/CD Pipeline** workflow. Vercel deploys in parallel with Cloudflare.
- **Option B (DNS Switch)**: In Cloudflare DNS management, update your main domain (`eim-lab.org`) CNAME target from the Worker hostname to `cname.vercel-dns.com` (or the Vercel CNAME IP).

---

## 6. Automation Workflows

### 6.1 Dependabot Dependency Updates ([`.github/dependabot.yml`](file:///.github/dependabot.yml))

Dependabot automatically creates PRs for outdated dependencies every Monday. Dependencies are **grouped** to reduce PR noise:

| Group | Packages |
|-------|----------|
| `astro-ecosystem` | `astro`, `@astrojs/*` |
| `react` | `react`, `react-dom`, `@types/react*` |
| `keystatic` | `@keystatic/*` |
| `tailwind` | `tailwindcss`, `@tailwindcss/*` |
| `fonts` | `@fontsource/*` |
| `github-actions` | All workflow action updates |

All PRs are labeled (`dependencies`, `automated`) and use Conventional Commits prefixes (`chore(deps):` for dependency updates, `ci(deps):` for actions).

### 6.2 Dependabot Auto-Merge ([`.github/workflows/dependabot-auto-merge.yml`](file:///.github/workflows/dependabot-auto-merge.yml))

Triggered via `pull_request_target` (runs in base branch context with secret access while skipping execution for non-Dependabot PRs):
- **Minor & patch** updates: Auto-approved and auto-merged after CI passes.
- **Major** updates: Labeled `major-update` + `needs-review` for manual review.

### 6.3 CodeQL Security Analysis ([`.github/workflows/codeql.yml`](file:///.github/workflows/codeql.yml))

Delegates to `LABEIM/Shared-CICD/.github/workflows/codeql-scan.yml@v2`. Runs automated static application security testing (SAST) for JavaScript/TypeScript on every push to `main`, on PRs, and weekly (Monday 04:30 UTC).

### 6.4 Dependency Review ([`.github/workflows/dependency-review.yml`](file:///.github/workflows/dependency-review.yml))

Delegates to `LABEIM/Shared-CICD/.github/workflows/dependency-review.yml@v2`. Scans pull requests for newly introduced vulnerable dependencies or invalid licenses before code is merged into `main`. Fails on vulnerabilities with `high` or `critical` severity.

> **Requirement**: Requires **Dependency graph** enabled in GitHub repository settings (**Settings** > **Advanced Security** / **Code security and analysis**).

### 6.5 Recommended GitHub Repository Security Settings Guide

To maximize security and ensure all CI/CD security workflows operate smoothly, enable the following settings in your repository on GitHub (**Settings** > **Advanced Security** or **Code security and analysis**):

| Feature | Recommended Action | Purpose |
| :--- | :--- | :--- |
| **Dependency graph** | **Enable** (Required) | Required by `.github/workflows/dependency-review.yml` to parse `package-lock.json` and block vulnerable dependencies on PRs. |
| **Dependabot alerts** | **Enable** | Sends maintainer notifications when an installed npm package has a known CVE vulnerability. |
| **Dependabot security updates** | **Enable** | Automatically creates security fix PRs when patches become available for vulnerable dependencies. |
| **Secret Protection** | **Enable** | Scans commits to prevent accidental pushes of secret API keys, tokens, or credentials. |
| **Private vulnerability reporting** | **Enable** | Allows security researchers to privately disclose security vulnerabilities to repository maintainers. |

*Note: For public organization repositories, all of these features are 100% free.*




