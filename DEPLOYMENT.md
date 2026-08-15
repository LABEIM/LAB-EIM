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

- **Build Export**: Pure static SSG HTML/CSS/JS export in `dist/` (`npm run build`).
- **Primary Hosting**: Cloudflare Pages (`npx wrangler pages deploy`).
- **Backup Hosting**: Vercel Static Deployment (`vercel deploy dist --prod`).

---

## 1. Local Development

Follow these steps to set up and run the website locally on your machine.

### Prerequisites

- **Node.js**: Version `>=22.12.0` (required by Astro 7+ runtime constraints).
- **npm**: Standard Node package manager.

### 1.1 Install Dependencies

In the root directory, run:
```bash
npm install
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
npm run dev
```
Once started, access the site at [http://localhost:4321](http://localhost:4321).

### 1.4 Type-Checking & Diagnostics

To run Astro type checks and framework diagnostics:
```bash
npx astro check
```

### 1.5 Local Production Build

To test compiling the production static build locally:
```bash
npm run build
```
The compiled static HTML/CSS/JS files will be exported to the `dist/` directory.

---

## 2. Primary Deployment: Cloudflare Pages

### 2.1 Project Shell Creation
**Zero Manual Dashboard Creation Required**:
You do **not** need to manually create the project in the Cloudflare Dashboard. 

Our GitHub Actions pipeline (`.github/workflows/ci-cd.yml`) automatically creates the Cloudflare Pages project (`lab-eim`) via `npx wrangler pages project create` on its initial run using your `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

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

## 5. Unified CI/CD Pipeline & Operational Procedures

The repository includes a unified GitHub Actions workflow ([`.github/workflows/ci-cd.yml`](file:///.github/workflows/ci-cd.yml)) with automated quality gates, deployment retry logic, and performance auditing.

### 5.1 Repository Secrets Setup

In GitHub go to **Settings** > **Secrets and variables** > **Actions** and add:

- `CLOUDFLARE_API_TOKEN`: Created in Section 2.2B.
- `CLOUDFLARE_ACCOUNT_ID`: Created in Section 2.2A.
- `VERCEL_TOKEN`: Vercel Personal Access Token ([Vercel Account Settings > Tokens](https://vercel.com/account/tokens)).
- `VERCEL_ORG_ID`: Found in `.vercel/project.json` or Vercel Team Settings.
- `VERCEL_PROJECT_ID`: Found in `.vercel/project.json` or Vercel Project Settings.
- `PUBLIC_GOOGLE_SHEET_SCRIPT_URL`: Google Apps Script Web App URL.
- `PUBLIC_RECRUITMENT_SECRET`: Passphrase for form signature verification.
- `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`: `eim-lab-cms`

> **Note:** The Cloudflare Pages project name (`lab-eim`) is set as the `CF_PAGES_PROJECT` **env var** in the workflow file — **not** as a repository secret. This is intentional: GitHub Actions masks any job output containing a secret substring, which would silently strip deployment URLs from PR preview comments. If you need to change the project name, edit the `CF_PAGES_PROJECT` value in `ci-cd.yml` directly.

### 5.2 Pipeline Stages (`ci-cd.yml`)

```
┌─────────────────────────────────────────────────────────────────┐
│ validate (15 min timeout)                                       │
│ ├─ npm ci (cached)                                              │
│ ├─ npx astro check                                              │
│ ├─ npm run build + SHA256 hash                                  │
│ └─ Upload dist/ artifact                                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│ deploy-cloudflare        │  │ deploy-vercel             │
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

1. **`validate` (CI Validation)**: Installs dependencies with npm cache, runs `npx astro check` and `npm run build`, generates a SHA256 integrity hash, uploads the compiled `dist/` static artifact, and posts a build summary (duration, artifact size, commit) to the job summary.
2. **`deploy-cloudflare` & `deploy-vercel`**: Deploys the `dist/` artifact to Cloudflare Pages (Primary) and Vercel (Backup) **in parallel** with **retry logic** (3 attempts, exponential backoff). `deploy-cloudflare` resolves the canonical Production URL (`https://lab-eim.pages.dev`) when running on `main` branch, and branch alias URLs (`https://<branch>.lab-eim.pages.dev`) on feature branches, ignoring temporary preview commit hashes. Both jobs register proper GitHub Deployment environments for deploy tracking.
3. **`comment-pr` (Post PR Preview Comment)**: Posts a formatted table with live Cloudflare and Vercel preview deployment URLs (with `cf-deploy-url` and `vercel-deploy-url` artifact fallbacks), commit SHA, and workflow run link back to the Pull Request.
4. **`lighthouse`**: Audits performance with **3 runs** (representative median score). Downloads the `dist-static-build` artifact to ensure `./dist` is present, resolves the live Cloudflare URL (with `cf-deploy-url` artifact fallback), and audits the live site (or local `./dist` static fallback). Parsed scores (Performance, Accessibility, Best Practices, SEO) are formatted into a rich Markdown table published to `$GITHUB_STEP_SUMMARY` with interactive report links, and appended directly to the PR preview comment on Pull Requests. On **Pull Requests**, a failing Lighthouse score marks the PR with a failed status check, preventing merge to `main`. On **push to main**, Lighthouse serves as post-deploy monitoring — failures generate alerts but the code is already live. Score thresholds:
   - Performance: ≥ 80% (warn only)
   - Accessibility: ≥ 90% (error — blocks PR merge)
   - Best Practices: ≥ 90% (error — blocks PR merge)
   - SEO: ≥ 90% (error — blocks PR merge; `is-crawlable` check turned off so platform `X-Robots-Tag: noindex` headers on preview builds do not skew score calculations)

### 5.3 Pipeline Security & Reliability Features

- **Action SHA Pinning**: All GitHub Actions are pinned to full 40-character commit SHAs for supply chain security (protecting against tag mutation attacks). Dependabot automatically monitors and opens PRs for SHA version updates.
- **Principle of Least Privilege**: Top-level `permissions: {}` block restricts default `GITHUB_TOKEN` access. Each job explicitly declares minimum required permissions.
- **Path Filtering (`paths-ignore`)**: Push events to `main` ignore root documentation updates (`README.md`, `DEPLOYMENT.md`, etc.), saving CI runner minutes while preserving full verification for content (`src/content/`) and source code. PR events always run full verification.
- **Centralized `.npmrc`**: Configures `legacy-peer-deps=true` at repository level for consistent dependency installation across CI and local environments.
- **Job Timeouts**: All jobs have explicit timeouts (5–15 minutes) to prevent hung pipelines.
- **Deployment Retry**: Both Cloudflare and Vercel deployments retry up to 3 times with exponential backoff (10s → 20s → 40s) to handle transient API failures.
- **Concurrency Control**: Duplicate runs on the same branch are automatically cancelled.
- **Artifact Integrity**: Build artifacts include a SHA256 hash for integrity verification between build and deploy stages.

### 5.4 Manual Dispatch Triggers

To manually deploy from GitHub Actions:
1. Go to GitHub Actions tab > **Unified CI/CD Pipeline** > **Run workflow**.
2. Select `deploy_target`:
   - `primary`: Deploy strictly to Cloudflare Pages.
   - `backup`: Force deploy to Vercel Backup.
   - `both`: Deploy to Cloudflare Pages and Vercel simultaneously.

### 5.5 Emergency Manual Failover Procedures

If Cloudflare Pages experiences an outage:

- **Option A (GitHub Actions)**: Navigate to GitHub Actions > **Unified CI/CD Pipeline** > **Run workflow** > select `deploy_target: backup`.
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

All PRs are labeled (`dependencies`, `automated`) and use Conventional Commits prefixes (`chore(deps):` for npm, `ci(deps):` for actions).

### 6.2 Dependabot Auto-Merge ([`.github/workflows/dependabot-auto-merge.yml`](file:///.github/workflows/dependabot-auto-merge.yml))

Triggered via `pull_request_target` (runs in base branch context with secret access while skipping execution for non-Dependabot PRs):
- **Minor & patch** updates: Auto-approved and auto-merged after CI passes.
- **Major** updates: Labeled `major-update` + `needs-review` for manual review.

### 6.3 Stale Cleanup ([`.github/workflows/stale.yml`](file:///.github/workflows/stale.yml))

Automatically marks and closes inactive issues and PRs:
- **Issues**: Stale after 30 days, closed after 7 more days.
- **PRs**: Stale after 30 days, closed after 14 more days.
- **Exempt labels**: `pinned`, `security`, `bug`, `work-in-progress`.

### 6.4 CodeQL Security Analysis ([`.github/workflows/codeql.yml`](file:///.github/workflows/codeql.yml))

Runs automated static application security testing (SAST) for JavaScript/TypeScript on every push to `main`, on PRs, and weekly (Monday 04:30 UTC).

### 6.5 Dependency Review ([`.github/workflows/dependency-review.yml`](file:///.github/workflows/dependency-review.yml))

Scans pull requests for newly introduced vulnerable dependencies or invalid licenses before code is merged into `main`. Fails on vulnerabilities with `high` or `critical` severity.

> **Requirement**: Requires **Dependency graph** enabled in GitHub repository settings (**Settings** > **Advanced Security** / **Code security and analysis**).

### 6.6 Recommended GitHub Repository Security Settings Guide

To maximize security and ensure all CI/CD security workflows operate smoothly, enable the following settings in your repository on GitHub (**Settings** > **Advanced Security** or **Code security and analysis**):

| Feature | Recommended Action | Purpose |
| :--- | :--- | :--- |
| **Dependency graph** | **Enable** (Required) | Required by `.github/workflows/dependency-review.yml` to parse `package-lock.json` and block vulnerable dependencies on PRs. |
| **Dependabot alerts** | **Enable** | Sends maintainer notifications when an installed npm package has a known CVE vulnerability. |
| **Dependabot security updates** | **Enable** | Automatically creates security fix PRs when patches become available for vulnerable dependencies. |
| **Secret Protection** | **Enable** | Scans commits to prevent accidental pushes of secret API keys, tokens, or credentials. |
| **Private vulnerability reporting** | **Enable** | Allows security researchers to privately disclose security vulnerabilities to repository maintainers. |

*Note: For public organization repositories, all of these features are 100% free.*




