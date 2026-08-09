# Cloudflare Pages Primary Deployment & Vercel Failover Backup Guide

This guide explains how to set up, configure, and maintain the dual-hosting CI/CD pipeline for the EIM Research Lab website, with **Cloudflare Pages** serving as the primary host and **Vercel** configured as an automatic/manual failover backup.

---

## 1. Architecture Overview

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
            (e.g., eim-lab.org)                    (e.g., backup.eim-lab.org
                                                     or eim-lab.vercel.app)
```

- **Build Export**: Pure static SSG HTML/CSS/JS export in `dist/` (`astro build`).
- **Primary Hosting**: Cloudflare Pages (`npx wrangler pages deploy`).
- **Backup Hosting**: Vercel Static Deployment (`vercel deploy dist --prod`).

---

## 2. Setting Up Cloudflare Pages Project

**Zero Manual Dashboard Creation Required**:
You **do not** need to create the project manually in the Cloudflare Dashboard. 

Our GitHub Actions pipeline automatically creates the Cloudflare Pages project (`lab-eim`) via `npx wrangler pages project create` on its very first run using your `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

Simply follow Section 3 and Section 4 to set up your API Token and GitHub Secrets, then push to `main`!



---

## 3. Obtaining Cloudflare Credentials

### A. Cloudflare Account ID
1. On your Cloudflare Dashboard overview page (or **Workers & Pages** right sidebar), find **Account Details**.
2. Under **Account ID**, click the copy icon to copy your hex Account ID string (e.g. `f9bfa5167a145b0c2ff643b...`).

### B. Cloudflare API Token
1. Go to **Manage account** > **Account API Tokens** (or **My Profile** > **API Tokens**).
2. Click **Create Token**.
3. Scroll to **Custom Token** and click **Get started**.
4. Set **Token name**: `GitHub Actions - Cloudflare Pages Deploy`.
5. Under **Permission policies**:
   - Set account scope: **Entire Account** (or select your specific Account).
   - Expand **Developer Platform**.
   - Next to **Pages**, click **Edit** (Grants write access to Cloudflare Pages).
   - *(Optional)* Next to **Workers Scripts**, click **Edit**.
6. Under **Token expiration**, select **No expiration** (recommended for automated CI/CD).
7. Click **Continue to summary** -> **Create Token**.
8. Copy the generated secret token string.

---

## 4. Configuring GitHub Repository Secrets

In your GitHub repository, navigate to **Settings** > **Secrets and variables** > **Actions**, and add the following repository secrets:

| Secret Name | Description | Example / Location |
| :--- | :--- | :--- |
| `CLOUDFLARE_API_TOKEN` | API Token with Cloudflare Pages Edit permission | Created in Step 3B |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare Account ID hex string | Found in Step 3A |
| `CLOUDFLARE_PROJECT_NAME` | Project name in Cloudflare Pages | `lab-eim` |
| `VERCEL_TOKEN` | Vercel Personal Access Token | Vercel Account Settings > Tokens |
| `VERCEL_ORG_ID` | Vercel Organization / Team ID | `.vercel/project.json` or Vercel Team Settings |
| `VERCEL_PROJECT_ID` | Vercel Project ID | `.vercel/project.json` or Vercel Project Settings |
| `PUBLIC_GOOGLE_SHEET_SCRIPT_URL` | App Script webhook endpoint URL | Form submission endpoint |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | Keystatic GitHub App slug | e.g. `eim-lab-cms` |

---

## 4.1 Keystatic CMS Setup on Cloudflare Pages

For Keystatic CMS (`/keystatic`) to function properly when hosted on Cloudflare Pages, you must configure environment variables, Cloudflare compatibility flags, and update your GitHub App callback URL:

### A. Environment Variables in Cloudflare Pages Dashboard
1. Go to **Cloudflare Dashboard** > **Workers & Pages** > Select your project (`lab-eim`).
2. Go to **Settings** > **Environment variables**.
3. Add the following variables under both **Production** and **Preview**:
   - `KEYSTATIC_GITHUB_CLIENT_ID`: GitHub App Client ID (e.g. `Iv1.xxxxxxxxxxxx`)
   - `KEYSTATIC_GITHUB_CLIENT_SECRET`: GitHub App Client Secret
   - `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`: GitHub App Slug (e.g. `eim-lab-cms`)
   - `KEYSTATIC_SECRET`: Random secret string used for session cookie signing

### B. Enable Functions Compatibility Flag (`nodejs_compat`)
1. In Cloudflare Pages project (`lab-eim`), go to **Settings** > **Functions**.
2. Under **Compatibility flags**, click **Add flag** (or Edit).
3. Add `nodejs_compat` for both Production and Preview environments. *(Required for Keystatic server-side Node.js built-ins).*

### C. Update GitHub App Callback & Homepage URLs
1. Navigate to your GitHub App settings at [GitHub Developer Settings](https://github.com/settings/apps).
2. Select your Keystatic GitHub App (e.g. `EIM Lab CMS`).
3. Update the URLs to match your Cloudflare Pages domain (or primary custom domain):
   - **Homepage URL**: `https://lab-eim.pages.dev` (or `https://eim-lab.org`)
   - **Authorization callback URL**: `https://lab-eim.pages.dev/api/keystatic/github/oauth/callback` (or `https://eim-lab.org/api/keystatic/github/oauth/callback`)
4. Save changes.

---

## 5. Domain Setup & Failover Strategy

### Primary Domain Configuration (Cloudflare Pages)
1. In Cloudflare Pages (`lab-eim`), go to **Custom Domains** > **Set up a custom domain**.
2. Enter your main domain (e.g., `eim-lab.org` or `www.eim-lab.org`).
3. Follow the prompt to activate DNS routing automatically (if DNS is hosted on Cloudflare) or add CNAME record pointing to `lab-eim.pages.dev`.

### Backup Domain Configuration (Vercel)
1. In Vercel Project Settings, go to **Domains**.
2. Add a backup subdomain (e.g., `backup.eim-lab.org` or use default `*.vercel.app`).
3. Ensure Vercel project settings use static framework override (Build Command: `npm run build`, Output Directory: `dist`).

---

## 6. How the CI/CD Pipeline Operates

- **Automatic Trigger on Push (`main` branch)**:
  1. `validate`: Cleans cache (`rm -rf .astro dist`), runs `npx astro check` & `npm run build`, uploading static `dist/` artifact.
  2. `deploy-cloudflare`: Downloads `dist/` and deploys directly to Cloudflare Pages using `npx wrangler pages deploy`.
  3. `deploy-vercel-backup`: Skipped if Cloudflare deployment succeeds. **Automatically triggers** if Cloudflare Pages deployment fails.
  4. `lighthouse`: Audits live performance on `https://lab-eim.pages.dev`.

- **Manual Trigger (`workflow_dispatch`)**:
  Go to GitHub repository **Actions** tab > **Unified CI/CD Pipeline** > **Run workflow**, and select `deploy_target`:
  - `primary`: Deploy strictly to Cloudflare Pages.
  - `backup`: Force deploy static build to Vercel Backup.
  - `both`: Deploy to Cloudflare Pages AND Vercel simultaneously.

---

## 7. Emergency Manual Failover Procedures

If Cloudflare experiences outages:

1. **Option A: Trigger Vercel Backup via GitHub Actions**:
   - Navigate to GitHub Actions > **Unified CI/CD Pipeline** > **Run workflow**.
   - Select `deploy_target: backup` and click **Run workflow**.

2. **Option B: Switch DNS CNAME / A Records**:
   - In Cloudflare DNS management, temporarily update `eim-lab.org` / `www` CNAME target from `lab-eim.pages.dev` to `cname.vercel-dns.com` (or Vercel CNAME IP).
