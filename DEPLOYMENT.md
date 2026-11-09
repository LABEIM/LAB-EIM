# Deployment & Hosting Guide (Cloudflare Pages Primary & Vercel Backup)

This guide provides step-by-step instructions for local development, deploying to **Cloudflare Pages** (Primary Host), configuring **Keystatic CMS**, setting up **Vercel** (Failover Backup), and managing the automated dual-hosting CI/CD pipeline.

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
        │   Cloudflare Pages          │   │   Vercel Deployment         │
        │   Direct Upload (dist)      │   │   (If Cloudflare Fails or   │
        │   via npx wrangler pages    │   │    Manual Dispatch Trigger)│
        └──────────────┬──────────────┘   └──────────────┬──────────────┘
                       │                                 │
                       ▼                                 ▼
             Primary Custom Domain                     Backup Subdomain
            (e.g., eim-lab.org /                   (e.g., backup.eim-lab.org
             lab-eim.pages.dev)                      or lab-eim.vercel.app)
```

- **Build Export**: Pure static SSG HTML/CSS/JS export in `dist/` (`pnpm run build`).
- **Primary Hosting**: Cloudflare Pages (`pnpm dlx wrangler pages deploy`).
- **Backup Hosting**: Vercel Static Deployment (`vercel deploy dist --prod`).

---

## 1. Local Development

Follow these steps to set up and run the website locally on your machine.

### Prerequisites

- **Node.js**: Version `>=22.12.0` (required by Astro 7+ runtime constraints).
- **pnpm**: Package manager via Corepack (pinned in `package.json`).

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
The compiled static HTML/CSS/JS files will be exported to the `dist/` directory.

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

## 2. Primary Deployment: Cloudflare Pages

### 2.1 Project Shell Creation
**Zero Manual Dashboard Creation Required**:
You do **not** need to manually create the project in the Cloudflare Dashboard. 

The Shared-CICD deploy action used by `.github/workflows/ci-cd.yml` automatically creates the Cloudflare Pages project (`lab-eim`) via `npx wrangler pages project create` on its initial run using your `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

### 2.2 Obtaining Cloudflare Credentials

#### A. Cloudflare Account ID
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. On the overview page (or under **Workers & Pages** in the right sidebar), locate **Account Details**.
3. Under **Account ID**, click the copy icon to copy your hex Account ID string (e.g. `f9bfa5167a145b0c2ff643b...`).

#### B. Cloudflare API Token
1. Go to **Manage account** > **Account API Tokens** (or **My Profile** > **API Tokens**).
2. Click **Create Token**.
3. Scroll to **Custom Token** and click **Get started**.
4. Set **Token name**: `GitHub Actions - Cloudflare Pages Deploy`.
5. Under **Permission policies**:
   - Scope: **Entire Account** (or select your target account).
   - Category **Developer Platform**:
     - **Pages**: Select `Edit` (Grants write/deploy permissions).
     - *(Optional)* **Workers Scripts**: Select `Edit`.
6. Under **Token expiration**, select **No expiration**.
7. Click **Continue to summary** -> **Create Token**.
8. Copy the generated secret token string.

### 2.3 Primary Custom Domain Setup
1. In the Cloudflare Pages dashboard (`lab-eim`), go to **Custom Domains** > **Set up a custom domain**.
2. Enter your main domain (e.g. `eim-lab.org` or `www.eim-lab.org`).
3. Follow the prompts to activate DNS routing automatically (if DNS is managed by Cloudflare) or add a CNAME record pointing to `lab-eim.pages.dev`.

---

## 3. Keystatic CMS Configuration (Cloudflare Pages & Vercel)

Keystatic CMS (`/keystatic`) provides a git-based admin UI for managing content. In production, it authenticates users via a **GitHub App** and commits changes directly back to your GitHub repository.

### 3.1 Creating the GitHub App for Keystatic CMS

1. In GitHub, go to **Settings** > **Developer Settings** > **GitHub Apps** > **New GitHub App** ([Direct Link](https://github.com/settings/apps/new)).
2. Fill out the registration details:
   - **GitHub App Name**: `EIM Lab CMS` (must be unique across GitHub).
   - **Homepage URL**: `https://lab-eim.pages.dev` (or your primary custom domain `https://eim-lab.org`).
   - **Authorization callback URL**: `https://lab-eim.pages.dev/api/keystatic/github/oauth/callback` (or `https://eim-lab.org/api/keystatic/github/oauth/callback`).
   - **Webhook**: Uncheck **Active** (Webhooks are not required for Keystatic).
   - **Repository Permissions**:
     - **Contents**: Select `Read & Write`.
     - **Pull Requests**: Select `Read & Write`.
3. Click **Create GitHub App**.
4. Generate a **Client Secret** and copy both the **Client ID** and **Client Secret**.
5. Copy the **App Slug** from the top of your GitHub App settings page (e.g. `eim-lab-cms`).
6. In the left sidebar of your GitHub App settings, click **Install App** and install it on your target repository (`LABEIM/LAB-EIM`).

> [!NOTE]
> **OAuth Callback Domain Handling**: GitHub Apps support one primary callback URL per app. If deploying to both Cloudflare Pages and Vercel, set the callback URL to your primary production domain (`https://lab-eim.pages.dev` or custom domain). Users accessing Keystatic on the backup domain will be redirected to the primary domain during OAuth sign-in.

### 3.2 Functions Compatibility Flag (`nodejs_compat`) for Cloudflare Pages

Keystatic server-side API routes require Node.js runtime compatibility when running on Cloudflare Pages:

1. In the Cloudflare Dashboard, go to **Workers & Pages** > select project (`lab-eim`).
2. Navigate to **Settings** > **Functions**.
3. Under **Compatibility flags**, click **Add flag**.
4. Add `nodejs_compat` for both **Production** and **Preview** environments.
5. Alternatively, `wrangler.json` in the root directory already defines `nodejs_compat`.

### 3.3 Environment Variables Reference

Add the following environment variables across your hosting providers (Cloudflare Pages Dashboard, Vercel Dashboard, and GitHub Repository Secrets):

| Variable Name | Description | Example / Required Target |
| :--- | :--- | :--- |
| `PUBLIC_GOOGLE_SHEET_SCRIPT_URL` | Web App deployment URL for Google Apps Script endpoint | `https://script.google.com/macros/s/.../exec` |
| `PUBLIC_RECRUITMENT_SECRET` | Passphrase matching `SECRET_KEY` in Apps Script Properties | `your_secret_passphrase_here` |
| `KEYSTATIC_GITHUB_CLIENT_ID` | Client ID from your GitHub App | `Iv1.xxxxxxxxxxxx` |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | Client Secret from your GitHub App | `xxxxxxxxxxxxxxxxxxxxxxxx` |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | URL slug of your GitHub App | `eim-lab-cms` |
| `KEYSTATIC_SECRET` | Secret key used to sign session cookies | `random_long_secret_string` |

---

## 4. Failover Deployment: Vercel Backup

Vercel serves as an automated parallel build target and failover backup if Cloudflare Pages experiences service degradation.

### 4.1 Configuring Vercel Project

1. Import your GitHub repository to [Vercel](https://vercel.com/).
2. Framework Preset: Select **Astro** (Output directory: `dist/`).
3. Add Environment Variables listed in Section 3.3.

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

The repository's workflow ([`.github/workflows/ci-cd.yml`](file:///.github/workflows/ci-cd.yml)) is a thin caller for the organization-wide [Shared-CICD](https://github.com/LABEIM/Shared-CICD) reusable pipeline (`deploy-app.yml@v1`). Quality gates, build, deployment retry logic, preview comments, and Lighthouse auditing all live in that shared workflow; this repository only supplies its inputs and secrets.

### 5.1 Repository Secrets & Variables

In GitHub go to **Settings** > **Secrets and variables** > **Actions**.

**Secrets:**

- `CLOUDFLARE_API_TOKEN`: Created in Section 2.2B.
- `CLOUDFLARE_ACCOUNT_ID`: Created in Section 2.2A.
- `VERCEL_TOKEN`: Vercel Personal Access Token ([Vercel Account Settings > Tokens](https://vercel.com/account/tokens)).
- `PUBLIC_GOOGLE_SHEET_SCRIPT_URL`: Google Apps Script Web App URL.
- `PUBLIC_RECRUITMENT_SECRET`: Passphrase for form signature verification.
- `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`: `eim-lab-cms`

Any inherited secret whose name starts with `PUBLIC_` is exported to the build environment by the shared workflow, so Vite/Astro can inline it into the static output.

**Variables:**

- `VERCEL_ORG_ID`: Found in `.vercel/project.json` or Vercel Team Settings.
- `VERCEL_PROJECT_ID`: Found in `.vercel/project.json` or Vercel Project Settings.

The Vercel backup deployment is enabled automatically when both variables are present. They must be **variables**, not secrets, because reusable-workflow `with:` inputs cannot read the `secrets` context.

> **Note:** The Cloudflare Pages project name (`lab-eim`) is set as the `cloudflare_project_name` input in `ci-cd.yml`. Change it there if the Pages project is renamed.

### 5.2 Pipeline Stages (`ci-cd.yml`)

```
┌─────────────────────────────────────────────────────────────────┐
│ validate-and-build (15 min timeout, Shared-CICD)                │
│ ├─ pnpm install --frozen-lockfile (cached)                      │
│ ├─ Export PUBLIC_* secrets to the build environment             │
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

1. **`validate-and-build`**: Installs dependencies with `pnpm install --frozen-lockfile`, exports inherited `PUBLIC_*` secrets to the build environment, runs `pnpm exec astro check` and `pnpm run build`, and uploads the compiled `dist/` artifact. The built output includes `dist/_worker.js` and `dist/_routes.json`, so Cloudflare Pages serves `/keystatic` and `/api/keystatic/*` through the worker.
2. **`deploy-cloudflare` & `deploy-vercel`**: Deploys the `dist/` artifact to Cloudflare Pages (Primary) and, when the Vercel variables are configured, Vercel (Backup) **in parallel** with **retry logic** (3 attempts, exponential backoff). `deploy-cloudflare` resolves the canonical Production URL (`https://lab-eim.pages.dev`) on `main` and branch alias URLs (`https://<branch>.lab-eim.pages.dev`) on feature branches. Both jobs register GitHub Deployment environments for deploy tracking.
3. **`comment-pr` (Post PR Preview Comment)**: Posts or updates a formatted table with the live Cloudflare and Vercel preview deployment URLs, commit SHA, and workflow run link on Pull Requests.
4. **`lighthouse`**: Audits the routes listed in `lighthouse_routes` with **3 runs** each (representative median score), resolves the live Cloudflare URL first (or the static build as a fallback), and appends parsed scores to `$GITHUB_STEP_SUMMARY` and the PR preview comment. On **Pull Requests**, a failing Lighthouse score marks the PR check failed. On **push to `main`**, it serves as post-deploy monitoring. Score thresholds:
   - Performance: ≥ 80% (warn only)
   - Accessibility: ≥ 90% (error — blocks PR merge)
   - Best Practices: ≥ 90% (error — blocks PR merge)
   - SEO: ≥ 90% (error on `main`, warn on pull requests; `is-crawlable` check turned off so platform `X-Robots-Tag: noindex` headers on preview builds do not skew score calculations)

### 5.3 Pipeline Security & Reliability Features

- **Shared Workflow Pinning**: This repository pins the Shared-CICD reusable workflow to the floating `v1` major tag. Action SHA pinning and dependency updates are maintained inside Shared-CICD.
- **Principle of Least Privilege**: The caller grants only `contents: read`, `pull-requests: write`, and `deployments: write`; the shared workflow cannot exceed those permissions.
- **Scoped Credentials**: `secrets: inherit` passes the repository secrets into the shared workflow. Only inherited `PUBLIC_*` secrets are exported to the build environment; deployment tokens stay scoped to the deploy steps.
- **Path Filtering (`paths-ignore`)**: Push events to `main` ignore root documentation updates (`README.md`, `DEPLOYMENT.md`, etc.), saving CI runner minutes while preserving full verification for content (`src/content/`) and source code. PR events always run full verification.
- **Centralized pnpm settings**: `pnpm-workspace.yaml` carries the `@emnapi/runtime` override (peer-resolution workaround for `@napi-rs/wasm-runtime`) and the `allowBuilds` list for esbuild/workerd install scripts.
- **Job Timeouts & Retries**: The shared workflow applies explicit job timeouts (5–15 minutes) and retries Cloudflare/Vercel deployments up to 3 times with exponential backoff (10s → 20s → 40s).
- **Concurrency Control**: Duplicate runs on the same branch are automatically cancelled.
- **Artifact Integrity**: The shared workflow generates a SHA256 hash for the build artifact before deployment.

### 5.4 Manual Dispatch Triggers

To manually deploy from GitHub Actions:
1. Go to GitHub Actions tab > **CI/CD Pipeline** > **Run workflow**.
2. Choose the branch and run. The workflow deploys to Cloudflare Pages, plus Vercel when `VERCEL_PROJECT_ID` and `VERCEL_ORG_ID` are configured as repository variables. There is no per-run target selector; enable or disable Vercel by adding or removing those variables.

### 5.5 Emergency Manual Failover Procedures

If Cloudflare Pages experiences an outage:

- **Option A (GitHub Actions)**: Ensure `VERCEL_PROJECT_ID` and `VERCEL_ORG_ID` are set as repository variables, then run the **CI/CD Pipeline** workflow. Vercel deploys in parallel with Cloudflare.
- **Option B (DNS Switch)**: In Cloudflare DNS management, update your main domain (`eim-lab.org`) CNAME target from `lab-eim.pages.dev` to `cname.vercel-dns.com` (or Vercel CNAME IP).

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

Delegates to `LABEIM/Shared-CICD/.github/workflows/codeql-scan.yml@v1`. Runs automated static application security testing (SAST) for JavaScript/TypeScript on every push to `main`, on PRs, and weekly (Monday 04:30 UTC).

### 6.4 Dependency Review ([`.github/workflows/dependency-review.yml`](file:///.github/workflows/dependency-review.yml))

Delegates to `LABEIM/Shared-CICD/.github/workflows/dependency-review.yml@v1`. Scans pull requests for newly introduced vulnerable dependencies or invalid licenses before code is merged into `main`. Fails on vulnerabilities with `high` or `critical` severity.

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




