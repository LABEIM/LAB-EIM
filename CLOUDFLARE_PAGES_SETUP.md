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
        │                             │   │    Manual Dispatch Trigger)│
        └──────────────┬──────────────┘   └──────────────┬──────────────┘
                       │                                 │
                       ▼                                 ▼
             Primary Custom Domain                     Backup Subdomain
            (e.g., eim-lab.org)                    (e.g., backup.eim-lab.org
                                                     or eim-lab.vercel.app)
```

- **Build Export**: Pure static SSG HTML/CSS/JS export in `dist/` (`astro build`).
- **Primary Hosting**: Cloudflare Pages (`cloudflare/pages-action@v1`).
- **Backup Hosting**: Vercel Static Deployment (`vercel deploy dist --prod`).

---

## 2. Setting Up Cloudflare Pages Project

To ensure GitHub Actions handles type-checking, building, and automatic failover to Vercel without duplicate or conflicting Cloudflare builds:

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** > **lab-eim** > **Settings** > **Build**.
3. Under **Git repository** (`LABEIM/LAB-EIM`), click **Disconnect**.

> **Why Disconnect Git on Cloudflare?**
> Cloudflare's connected Git mode automatically triggers a build on every push and does not offer a "Pause" toggle. Disconnecting turns the project into a **Direct Upload** project. 
> This allows GitHub Actions to handle `npx astro check`, build the site, upload `dist/` via `CLOUDFLARE_API_TOKEN`, and trigger Vercel failover if Cloudflare fails. You can re-connect GitHub in the Cloudflare Dashboard anytime if you decide to switch back to native builds.



---

## 3. Obtaining Cloudflare Credentials

### A. Cloudflare Account ID
1. On your Cloudflare Dashboard overview page, look at the right sidebar.
2. Under **Account ID**, copy your Account ID hex string (e.g. `a1b2c3d4e5f6...`).

### B. Cloudflare API Token
1. Go to **Manage account** > **Account API Tokens** (or **My Profile** > **API Tokens**).
2. Click **Create Token**.
3. Scroll to **Custom Token** and click **Get started**.
4. Set **Token name**: `GitHub Actions - Cloudflare Pages Deploy`.
5. Under **Permission policies**:
   - Set account scope: **Entire Account** (or select your specific Account).
   - Expand **Developer Platform**.
   - Next to **Pages**, click **Edit** (Grants write access to Cloudflare Pages).
   - *(Optional)* Next to **Workers Scripts**, click **Edit** (Grants write access to Cloudflare Workers scripts/assets).
6. Under **Token expiration**, select **No expiration** (recommended for automated CI/CD).
7. Click **Continue to summary** (blue button at bottom right) -> **Create Token**.
8. Copy the generated secret token string.


---

## 4. Configuring GitHub Repository Secrets

In your GitHub repository, navigate to **Settings** > **Secrets and variables** > **Actions**, and add the following repository secrets:

| Secret Name | Description | Example / Location |
| :--- | :--- | :--- |
| `CLOUDFLARE_API_TOKEN` | API Token with Cloudflare Pages Edit permission | Created in Step 3B |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare Account ID hex string | Found in Step 3A |
| `CLOUDFLARE_PROJECT_NAME` | Project name in Cloudflare Pages | `website-eim` |
| `VERCEL_TOKEN` | Vercel Personal Access Token | Vercel Account Settings > Tokens |
| `VERCEL_ORG_ID` | Vercel Organization / Team ID | `.vercel/project.json` or Vercel Team Settings |
| `VERCEL_PROJECT_ID` | Vercel Project ID | `.vercel/project.json` or Vercel Project Settings |
| `PUBLIC_GOOGLE_SHEET_SCRIPT_URL` | App Script webhook endpoint URL | Form submission endpoint |

---

## 5. Domain Setup & Failover Strategy

### Primary Domain Configuration (Cloudflare Pages)
1. In Cloudflare Pages, go to **Custom Domains** > **Set up a custom domain**.
2. Enter your main domain (e.g., `eim-lab.org` or `www.eim-lab.org`).
3. Follow the prompt to activate DNS routing automatically (if DNS is hosted on Cloudflare) or add CNAME record pointing to `<project-name>.pages.dev`.

### Backup Domain Configuration (Vercel)
1. In Vercel Project Settings, go to **Domains**.
2. Add a backup subdomain (e.g., `backup.eim-lab.org` or use default `*.vercel.app`).
3. Ensure Vercel project settings use static framework override (Build Command: `npm run build`, Output Directory: `dist`).

---

## 6. How the CI/CD Pipeline Operates

- **Automatic Trigger on Push (`main` branch)**:
  1. `validate`: Runs `npx astro check` & `npm run build`, uploading static `dist/` artifact.
  2. `deploy-cloudflare`: Downloads `dist/` and deploys directly to Cloudflare Pages.
  3. `deploy-vercel-backup`: Skipped if Cloudflare deployment succeeds. **Automatically triggers** if Cloudflare Pages deployment fails.
  4. `lighthouse`: Audits live performance.

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
   - In Cloudflare DNS management, temporarily update `eim-lab.org` / `www` CNAME target from `<project-name>.pages.dev` to `cname.vercel-dns.com` (or Vercel CNAME IP).
