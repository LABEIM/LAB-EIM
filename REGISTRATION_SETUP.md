# Complete Registration Setup & Operations Guide (EIM Research Lab)

This document is a step-by-step guide for setting up, configuring, and operating the assistant recruitment registration system from start to finish.

---

## Architecture Overview

```
┌───────────────────────────┐      POST /exec       ┌─────────────────────────────────┐
│                           │ ────────────────────> │  Google Apps Script (code.gs)   │
│  Astro Registration Form  │                       ├─────────────────────────────────┤
│    (/pendaftaran page)    │ <──────────────────── │ • Appends row to Google Sheet   │
└───────────────────────────┘    JSON Response      │ • Uploads files to Google Drive │
             │                                      │ • Sends Confirmation Email      │
             │ Read Config                          └─────────────────────────────────┘
             ▼
┌───────────────────────────┐
│  src/data/registration.json│
│   recruitment_results.json │
└───────────────────────────┘
```

---

## Phase 1: Google Apps Script & Google Sheet Setup (Backend)

### 1. Create Spreadsheet & Apps Script
1. Go to [Google Sheets](https://sheets.new) and create a new spreadsheet named **`EIM Assistant Registration 2026`**.
2. Click **Extensions > Apps Script** from the top menu.
3. In the Apps Script editor, open `Code.gs` and replace all default code with the contents of [`code.gs`](file:///home/arukast/Projects/website-eim/code.gs).

### 2. Configure Script Properties & Initial Setup
1. In the Apps Script editor toolbar, select the function `initialSetup` from the dropdown and click **Run**.
   > *This stores the active Spreadsheet ID into Script Properties so the script knows where to append form data.*
2. Go to **Project Settings ⚙️** (left sidebar menu) > **Script Properties**.
3. Click **Add script property** and configure:
   * **`DEADLINE`**: `2026-08-23T23:59:59+07:00` *(ISO date string matching your registration close date)*
   * **`HEADER_ROW`**: `1` *(Optional. Set to `4` if your column header row starts at row 4, e.g. when top rows contain metadata or title)*
   * **`SHEET_NAME`**: `Sheet1` *(Optional. Name of the target worksheet tab, defaults to `Sheet1`)*
   * **`SECRET_KEY`**: `your_custom_passphrase` *(Optional signature key for security checks)*
   * **`FOLDER_ID`**: *(Optional)* The ID of a Google Drive folder where uploaded applicant PDFs will be saved (found in `drive.google.com/drive/folders/FOLDER_ID`). If left blank, the script automatically creates a folder named `"EIM Recruitment Uploads"`.

### 3. Backend Line Reference & Key Customizations (`code.gs`)
If you need to customize email text, sheet tab names, or folder fallback logic:

* **📊 Target Worksheet Tab Name** (`code.gs` Line 1):
  ```javascript
  const sheetName = 'Sheet1' // Change to match your Google Sheet tab name (e.g. 'Pendaftar')
  ```
* **📁 Google Drive Folder Fallback** (`code.gs` Lines 42-58):
  * Reads `FOLDER_ID` from Script Properties (Line 43).
  * Automatically creates `"EIM Recruitment Uploads"` folder if `FOLDER_ID` is omitted (Line 52).
* **📧 Confirmation Email Subject & Template** (`code.gs` Lines 86-141):
  * Recipient Email (`data.Email`): Lines 87 & 134.
  * Email Subject & HTML Styling: Lines 97–130. Sent automatically from the deploying Google account.


### 3. Deploy as Web App
1. In the top right corner, click **Deploy > New deployment**.
2. Click the gear icon ⚙️ next to *Select type* and select **Web app**.
3. Fill out the deployment details:
   * **Description**: `EIM Registration API v1`
   * **Execute as**: **Me** (`your-email@gmail.com` or `@telkomuniversity.ac.id`)
   * **Who has access**: **Anyone**
4. Click **Deploy**.
5. Grant necessary Google OAuth permissions when prompted.
6. Copy the generated **Web App URL** (starts with `https://script.google.com/macros/s/.../exec`).

---

## Phase 2: Frontend Environment Configuration

### 1. Configure Local `.env` File
Create or update your `.env` file in the root directory:
```env
PUBLIC_GOOGLE_SHEET_SCRIPT_URL="https://script.google.com/macros/s/YOUR_APPS_SCRIPT_DEPLOYMENT_ID/exec"
PUBLIC_RECRUITMENT_SECRET="your_custom_passphrase"
```

### 2. Configure Production Secrets (Vercel / GitHub)
If deploying to **Vercel** or using **GitHub Actions**:
1. Go to your **Vercel Dashboard > Project > Settings > Environment Variables**.
2. Add:
   * `PUBLIC_GOOGLE_SHEET_SCRIPT_URL`: `https://script.google.com/macros/s/.../exec`
   * `PUBLIC_RECRUITMENT_SECRET`: `your_custom_passphrase`
3. Add the same `PUBLIC_GOOGLE_SHEET_SCRIPT_URL` to **GitHub Repository Secrets** (`Settings > Secrets > Actions`) if building via GitHub Actions.

---

## Phase 3: Registration Pipeline & Schedule Setup

All stage timelines are managed in [`src/data/registration.json`](file:///home/arukast/Projects/website-eim/src/data/registration.json).

### 1. Pipeline Stages Timeline (`src/data/registration.json`)
Set the key dates for each phase in ISO format (`YYYY-MM-DDTHH:mm:ss`):

```json
{
  "status": "auto",
  "upcomingStartDate": "2026-08-01T00:00:00",
  "openDate": "2026-08-13T00:00:00",
  "deadline": "2026-08-20T23:59:59",
  "extendedDeadline": "2026-08-23T23:59:59",
  "selectionEndDate": "2026-08-25T23:59:59",
  "selectionResultsDate": "2026-08-26T00:00:00",
  "technicalTestStartDate": "2026-08-29T00:00:00",
  "technicalTestEndDate": "2026-08-30T23:59:59",
  "technicalTestResultsDate": "2026-09-01T00:00:00",
  "interviewStartDate": "2026-09-05T00:00:00",
  "interviewEndDate": "2026-09-06T23:59:59",
  "announcementDate": "2026-09-09T00:00:00"
}
```

### Automatic vs Manual Stage Overrides:
* **`"status": "auto"`** *(Recommended)*: System automatically computes the current active stage based on system time vs the dates above.
* **Manual Override**: You can force a stage by changing `"status"` to one of:
  `"upcoming"`, `"open"`, `"extended"`, `"selection"`, `"selection_results"`, `"technical_test"`, `"technical_test_results"`, `"interview"`, `"announcement"`, or `"closed"`.

---

## Phase 4: Candidate Announcement & Results Management

When announcements open, applicants look up their status by entering their NIM on `/pendaftaran`. Results are stored in [`src/data/recruitment_results.json`](file:///home/arukast/Projects/website-eim/src/data/recruitment_results.json).

### 1. Updating Candidate Statuses (`src/data/recruitment_results.json`)

Add or update candidates under the `"candidates"` list:

```json
{
  "batch": "Recruitment Assistant 2026",
  "publishedDate": "2026-08-26",
  "candidates": [
    {
      "nim": "1202210001",
      "name": "Jane Doe",
      "division": "Research",
      "screeningStatus": "passed",
      "technicalTestStatus": "passed",
      "finalStatus": "accepted",
      "notes": "Selamat! Anda dinyatakan LULUS sebagai Asisten EIM Lab 2026."
    },
    {
      "nim": "1202210002",
      "name": "John Smith",
      "division": "Cyber Security",
      "screeningStatus": "passed",
      "technicalTestStatus": "failed",
      "finalStatus": "rejected",
      "notes": "Mohon maaf, Anda belum memenuhi kualifikasi untuk tahap selanjutnya."
    }
  ]
}
```

### Possible Status Values:
* `screeningStatus`: `"passed"` | `"failed"`
* `technicalTestStatus`: `"passed"` | `"failed"`
* `finalStatus`: `"accepted"` | `"waitlist"` | `"rejected"`

---

## Phase 5: Verification & Testing Checklist

Before going live, execute these commands to ensure everything is valid:

```bash
# 1. Framework diagnostics & type checks
npx astro check

# 2. Production build check
npm run build
```

### End-to-End Test Procedure:
1. Open local site at `http://localhost:4321/pendaftaran`.
2. Fill out the test registration form and attach sample PDF files.
3. Submit form and verify:
   * UI displays success confirmation modal.
   * New row appears in your Google Sheet.
   * Uploaded files appear in your Google Drive folder.
   * Automated confirmation email arrives in the candidate's inbox.

---

## Troubleshooting & Maintenance

* **Form returns "Deadline Passed" error**:
  Check `DEADLINE` in Google Script Properties and `deadline` / `extendedDeadline` in `registration.json`. Ensure timezone offsets (`+07:00`) match.
* **Form fails with CORS or Network Error**:
  Ensure the Web App deployment has access set to **Anyone** (not *Anyone with Google Account*).
* **Changes to `code.gs` not reflecting**:
  After modifying `code.gs`, you **must create a new deployment version**: `Deploy > Manage Deployments > Edit ✏️ > Version: New Version > Deploy`.
