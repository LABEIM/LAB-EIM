# Setup and Deployment Guide

This guide explains how to set up, run, and deploy the EIM Research Lab website.

## Local Development

Follow these steps to run the website locally on your machine.

### Prerequisites

- **Node.js**: Version 22 or higher is recommended.
- **npm**: Standard Node package manager.

### 1. Install Dependencies

In the root directory, run:
```bash
npm install
```

### 2. Run Development Server

To start the local development server:
```bash
npm run dev
```
Once started, access the local site via [http://localhost:4321](http://localhost:4321).

### 3. Type-Checking & Diagnostics

To run type-checks and Astro framework diagnostics:
```bash
npx astro check
```

### 4. Production Build

To test compiling the production build locally:
```bash
npm run build
```
The compiled static files will be exported to the `dist/` directory.

---

## Google Sheets Integration & Security (`code.gs`)

The assistant registration form submits data asynchronously to a Google Apps Script endpoint (`code.gs`).

### Public Repository Safety
This codebase is designed with **Defense in Depth**. Storing `code.gs` or frontend form logic in a **public repository** is completely safe because:
1. **Server-Side Deadline Enforcement**: Google's servers calculate timestamps against `DEADLINE` using Google's clock. Attackers cannot bypass deadlines via client-side request tampering.
2. **Secret Signature Key (`SECRET_KEY`)**: Secret keys are kept exclusively in Vercel Environment Variables and Google Script Properties—never committed to Git.
3. **Google Drive File Isolation**: Files uploaded to Google Drive inherit private owner-only permissions. Direct link sharing (`ANYONE_WITH_LINK`) is disabled.
4. **HTML Sanitization**: All incoming inputs are escaped before rendering confirmation emails or updating Google Sheets.

---

## Vercel Deployment & Keystatic CMS Setup

This project uses **Keystatic CMS** for content management, stored in Git and deployed seamlessly to **Vercel**. When deployed, Keystatic uses GitHub OAuth to allow authorized administrators to save edits directly to the GitHub repository.

### 1. Deploying to Vercel
1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New** -> **Project**.
3. Import your repository. Vercel will automatically detect Astro and apply the correct build settings.

### 2. Setting up GitHub OAuth for Keystatic CMS
To enable login on your live website (e.g., `https://your-site.vercel.app/keystatic`):
1. In GitHub, go to your profile **Settings** -> **Developer Settings** -> **OAuth Apps** -> **New OAuth App**.
2. Fill out the registration form:
   - **Application Name**: `EIM Lab CMS` (or any description)
   - **Homepage URL**: `https://your-site.vercel.app` (your Vercel deployment URL)
   - **Authorization callback URL**: `https://your-site.vercel.app/api/keystatic/github/callback`
3. Click **Register application**.
4. Generate a **Client Secret** and copy both the **Client ID** and **Client Secret**.

### 3. Adding Vercel Environment Variables
In your Vercel project dashboard, go to **Settings** -> **Environment Variables** and add the following variables:

| Key | Value | Description |
| --- | --- | --- |
| `PUBLIC_GOOGLE_SHEET_SCRIPT_URL` | `https://script.google.com/macros/s/.../exec` | The Web App deployment URL of your Google Apps Script handler |
| `PUBLIC_RECRUITMENT_SECRET` | `your_secret_passphrase_here` | *(Optional)* Secret signature key matching `SECRET_KEY` in Google Apps Script properties |
| `KEYSTATIC_GITHUB_CLIENT_ID` | `Iv1.xxxxxxxxxxxx` | The Client ID from your GitHub OAuth App |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | `xxxxxxxxxxxxxxxxxxxxxxxx` | The Client Secret from your GitHub OAuth App |
| `KEYSTATIC_SECRET` | `any_long_random_string` | A secret key used to sign the Keystatic session cookie |

### 4. Setting Script Properties in Google Apps Script
1. Open your Google Apps Script project at [script.google.com](https://script.google.com/).
2. Click **Project Settings** ⚙️ on the left menu.
3. Under **Script Properties**, add:
   - `DEADLINE`: e.g. `2026-08-23T23:59:59+07:00`
   - `SECRET_KEY`: `your_secret_passphrase_here` *(must match `PUBLIC_RECRUITMENT_SECRET` in Vercel)*
4. Save properties and re-deploy a new Web App version (**Deploy > Manage Deployments > Edit > New Version > Deploy**).

---

## CI/CD Workflow with GitHub Actions

A custom GitHub Actions pipeline is configured in this repository to automate and gatekeeper deployments to Vercel. 

### Setup Repository Secrets

To enable the deployment workflow, add the following secrets under **Settings > Secrets and variables > Actions > New repository secret** in your GitHub repository:

1. `VERCEL_TOKEN`: Your Vercel Personal Access Token (created at [Vercel Settings > Tokens](https://vercel.com/account/tokens)).
2. `VERCEL_ORG_ID`: Your Vercel Organization ID (found as `orgId` in `.vercel/project.json` or by running `npx vercel link`).
3. `VERCEL_PROJECT_ID`: Your Vercel Project ID (found as `projectId` in `.vercel/project.json` or by running `npx vercel link`).
4. `PUBLIC_GOOGLE_SHEET_SCRIPT_URL`: The URL of your Google Apps Script handler (to inject it during build time).

### Features of the CI/CD Pipeline
- **Automation**: Triggers on push or pull requests targeting the `main` branch.
- **Fail-Safe Checks**: Dependencies are installed and validated before running builds. If tests or formatting checks are added later, they will run and block deployment if they fail.
- **Preview Comments**: On Pull Requests, the workflow automatically deploys a preview and uses the GitHub CLI to write a comment on the PR containing the exact preview URL.
