# EIM Lab - Configuration Guide & Templates

This guide explains how to update the laboratory positions, members, courses, and recruitment registration details using the JSON files in `src/data/` and the Markdown collections in `src/content/`.

Admin Portal: https://lab-eim.vercel.app/keystatic

---

## 1. Positions Configuration (`src/data/positions.json`)
This file defines the laboratory's role hierarchy. The `/structure` chart and role sections and the Keystatic `Position` dropdowns on members and lecturers all read from it.

The hierarchy is fixed in code (`STRUCTURE_TREE` in `src/utils/position-mapper.ts`): Ketua Lab → Wakil Ketua Lab → Dosen Anggota / Koordinator Mata Kuliah / Koordinator Asisten Lab → Asisten Koordinator Praktikum / Mahasiswa Anggota, and Asisten Praktikum sits under Asisten Koordinator Praktikum. Tim Adhoc was removed from the structure. Ketua Kelompok Keilmuan and Ka.Ur.Lab FRI are faculty-level and intentionally not listed. Asisten Praktikum belongs to a course, not to this structure.

### Fields Explanation
* **`id`** (String): Unique lowercase identifier. Member and lecturer `role` values must match one of these.
* **`label`** (String): Display label used in the chart, section headings, and member cards.
* **`group`** (String): One of `dosen`, `asisten`, `mahasiswa`. Controls the eyebrow label above each section.
* **`order`** (Integer): Sort order. Roles with equal `order` keep the array order.

### Position Template
```json
  {
    "id": "dosen-anggota",
    "label": "Dosen Anggota Laboratorium",
    "group": "dosen",
    "order": 3
  }
```
Sections render only for positions that hold at least one person; the chart shows the positions in `STRUCTURE_TREE` (`src/utils/position-mapper.ts`), so add a position to that tree as well as to `positions.json` if it belongs in the chart.

The numbers on Beranda ("Laboratorium dalam angka") and Tentang Kami are derived — dosen and anggota counts come from `positions.json` plus `members.json`/`lecturers.json`, and the third Beranda number is the course count from `src/content/courses/` (Tentang Kami shows the dosen count instead). Nothing is typed in, so the numbers follow the data automatically.

---

## 1b. Registration Divisions (`src/data/divisions.json`)
The recruitment form still uses divisions as a dropdown and as the trigger for the portfolio requirement. This file is not used by `/structure`, `/about`, or Beranda any more; it only feeds `/registration`.

* **`id`**: lowercase identifier used by `aliases` and by the old `?div=` links.
* **`registrationLabel`** / **`registrationValue`**: dropdown text and the value sent to the registration sheet.
* **`aliases`**: alternative keys accepted when importing recruitment results (e.g. `core` → `inti`, `community` → `care`).
* **`borderColor`** / **`roleColor`**: unused by the current pages; kept so the schema stays stable.

Do not delete this file without also changing the registration form.

---

## 2. Members Directory (`src/data/members.json`)
This file lists student members and assistants. On `/structure` each person renders under their position section. Photos still live in `/image/division/...`; those folder names are historical and unrelated to the current structure.

### Fields Explanation
* **`id`** (Number): A unique numeric ID for the member. Course assistant lists reference these ids.
* **`name`** (String): Full name of the assistant.
* **`role`** (String): A position id from `positions.json` (Keystatic shows it as a Position dropdown).
* **`image`** (String): Path to the member's avatar image starting from `/image/`.
* **`scale`** (String, Optional): CSS transform scale value for positioning adjustments in the square avatar frame (e.g. `"2.5"`, `"3"`, `"1"`).
* **`position`** (String, Optional): CSS transform-origin values to focus/center the avatar face inside the square avatar crop (e.g. `"center 32%"`, `"50% 15%"`).

### Member Template
```json
  {
    "id": 26,
    "name": "Nama Anggota",
    "role": "mahasiswa-anggota",
    "image": "/image/division/research/RESEARCH_Member_JDOE_Jane-Doe_00.avif",
    "scale": "2.8",
    "position": "50% 25%"
  }
```

---

## 3. Registration Settings (`src/data/registration.json`)
This file configures the 10-stage recruitment pipeline landing page (`/registration`).

### Fields Explanation
* **`status`** (String): Active recruitment stage override. Supported values:
  * `"auto"`: Automatically determines stage based on system dates.
  * `"upcoming"`: Opening Soon view (countdown to `openDate` & prep guide).
  * `"open"`: Registration Open view (displays form & countdown to `deadline`).
  * `"extended"`: Extended Registration view (displays form + "Pendaftaran Diperpanjang!" banner & countdown to `extendedDeadline`).
  * `"selection"`: Document Screening In Progress view.
  * `"selection_results"`: Document Screening Announcement view (NIM search for screening results).
  * `"technical_test"`: Technical Test Phase In Progress view.
  * `"technical_test_results"`: Technical Test Announcement view (NIM search for technical test results).
  * `"interview"`: Interview Phase In Progress view.
  * `"announcement"`: Final Selection Announcement view (NIM search & accepted candidate directory).
  * `"closed"`: Recruitment Closed view.
  * `"fallback"`: Fallback / Maintenance view (replaces standard form with direct external Google Form link).
* **Date Pipeline Fields**: `upcomingStartDate`, `openDate`, `deadline`, `extendedDeadline`, `selectionEndDate`, `selectionResultsDate`, `technicalTestStartDate`, `technicalTestEndDate`, `technicalTestResultsDate`, `interviewStartDate`, `interviewEndDate`, `announcementDate`. `upcomingStartDate` marks when the "Opening Soon" stage begins before registration officially opens (`openDate`). Each release date field (`selectionResultsDate`, `technicalTestResultsDate`, `announcementDate`) represents the exact start date of that announcement phase.
* **`timezoneOffset`** (String, Optional): Specific recruitment timezone offset override (e.g. `"+07:00"` for WIB). Defaults to global site timezone offset if omitted.
* **Stage Configurations**: `upcomingConfig`, `extendedConfig`, `selectionConfig`, `selectionResultsConfig`, `technicalTestConfig`, `technicalTestResultsConfig`, `interviewConfig`, `announcementConfig`, `closedConfig`, `fallbackConfig`.
  * **`fallbackConfig`**: Configures the maintenance/backup view text and link (`title`, `subtitle`, `message`, `formUrl`, `buttonText`).
* **`selectionSteps`**: Array of dynamic selection pipeline steps. Each step includes a `templateType` field determining its page view layout:
  * **`in_progress`** *(In-Progress / Task Details View)*: Shows step instructions, notice messages, schedule details, and test location links via `StageInfoPanel`.
  * **`results`** *(Results Announcement View)*: Shows an interactive Student ID (NIM) search box (`NimSearchBox`) checking pass/fail qualification against `recruitment_results.json`, along with news post and document download links.
  * **`info`** *(Informational Notice View)*: Displays a clean status notice without input forms during grading pauses or stage transitions.

---

## 4. Candidate Recruitment Results (`src/data/recruitment_results.json`)
This file manages candidate evaluation status entries across all selection pipeline stages.

### Fields Explanation
* **`batch`** (String): Name of the recruitment batch (e.g. `"Recruitment Assistant 2026"`).
* **`publishedDate`** (String): Announcement release date.
* **`candidates`** (Array of Objects): List of candidate status entries:
  * `nim` (String): Student ID (e.g. `"1202210001"`). NIM is strictly used as the unique search identifier for announcement checkups.
  * `division` (String): Division name.
  * `stageStatuses` (Array of Objects): Dynamic stage statuses (`[{ stepId: "selection", status: "passed" }, { stepId: "technical_test", status: "passed" }]`). Automatically maps to active steps in **Dynamic Selection Pipeline Steps**.
  * `finalStatus` (String): `"accepted"`, `"waitlist"`, or `"rejected"`.

  * `notes` (String): Custom congratulations or feedback note.

### Result Note Priority Hierarchy
1. **1st Priority (Candidate Step Note)**: Specified per candidate per step under `stageStatuses[i].notes`.
2. **2nd Priority (Candidate Top-Level Note)**: Specified in candidate's `notes` property or pasted via spreadsheet (`bulkImportText`).
3. **3rd Priority (Pipeline Step Default Note)**: Configured under **Dynamic Selection Pipeline Steps > Results Announcement View Settings** (`passedMessage` / `failedMessage`).
4. **4th Priority (System Fallback)**: Built-in default announcement text.




## 4. News Articles (`src/content/news/`)
News articles are stored as Markdown (`.md`) files in `src/content/news/`.

### Fields Explanation
* **`title`** (String): The title of the news article.
* **`category`** (String): The category tag (e.g., `"Beasiswa"`, `"Pengumuman"`, `"Riset"`).
* **`author`** (String): The publisher or author name (e.g., `"EIM Lab"`, `"UK Government"`).
* **`news_date`** (String): Date of publication in `YYYY-MM-DD` format.
* **`image`** (Array of Strings): Optional image URLs or paths to display as featured images.
* **`audit`** (Boolean, Optional): Marks preview-only content. Audit entries are reachable by direct URL (with `noindex`) but hidden from production listings.

### News Template
A helper template is located at [src/content/news/_template.md](file:///home/arukast/Projects/website-eim/src/content/news/_template.md).

```markdown
---
title: "News Title"
category: "Category Name"
author: "Author Name"
news_date: "YYYY-MM-DD"
image:
  - "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1200"
---
Write the content of the news article here in Markdown format.
```

---

## 5. Laboratory Events (`src/content/events/`)
Events are stored as Markdown (`.md`) files in `src/content/events/`.

### Fields Explanation
* **`title`** (String): The title of the event.
* **`category`** (String): The type/category of the event (e.g., `"Company Visit"`, `"Workshop"`, `"Webinar"`).
* **`status`** (String): Must be one of `"upcoming"`, `"ongoing"`, or `"completed"`.
* **`event_date`** (String): Date of the event in `YYYY-MM-DD` format.
* **`description`** (String): A short summary of the event shown in lists and as the detail lead.
* **`link`** (String, Optional): Registration or external link kept for reference; the detail page does not render a registration CTA.
* **`poster`** (String, Optional): Poster image URL. Used as the list card cover, and on the detail page only as the cover fallback when `image` is empty.
* **`image`** (Array of Strings, Optional): Optional image URLs/paths. The first non-blank image is used as the detail page cover; the remaining images render as the documentation gallery.
* **`icon`** (String, Optional): FontAwesome icon class name (e.g., `"fa-building-columns"`, `"fa-solid fa-calendar-days"`).
* **`organizer`** (String, Optional): Name of the organizer (defaults to `"EIM Lab"`).
* **`benefits`** (Array of Strings, Optional): Accepted by the schema but not rendered on the detail page.
* **`requirements`** (Array of Strings, Optional): Accepted by the schema but not rendered on the detail page.
* **`audit`** (Boolean, Optional): Marks benchmark-only content. Audit entries are reachable by direct URL but hidden from production listings and related-event pools.

### Event Template
A helper template is located at [src/content/events/_template.md](file:///home/arukast/Projects/website-eim/src/content/events/_template.md).

```markdown
---
title: "Event Title"
category: "Category Name"
status: "upcoming"
event_date: "YYYY-MM-DD"
description: "A short description of the event that will be shown in lists."
link: "https://example.com/optional-registration-link"
image:
  - "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=600"
icon: "fa-solid fa-calendar-days"
organizer: "EIM Lab"
benefits:
  - "Benefit 1"
  - "Benefit 2"
requirements:
  - "Requirement 1"
  - "Requirement 2"
---
Write the main event details, schedule, or extra information here in Markdown format.
```

The Markdown body is rendered on `/event/[id]`. Start body sections at `##` — the event title is the page's only `h1`. Dates are formatted for the site timezone on the redesigned pages; sort/filter state is held in the archive's URL query.

---

## 6. Global Site Settings (`src/data/site.json`)
This file configures the global branding, tab information, and social links of the laboratory website.

### Fields Explanation
* **`name`** (String): Short name of the lab (e.g. `"EIM"`). Used in the logo `alt` text, the footer lockup, and page titles.
* **`subName`** (String): Subtitle suffix for the logo (e.g. `"Lab"`).
* **`fullName`** (String): Complete formal name (e.g. `"Enterprise Infrastructure Management Laboratory"`). Used in copyright text and about summaries.
* **`defaultTitle`** (String): The default window/tab title for pages that do not override it.
* **`defaultDescription`** (String): Fallback meta description for search engines.
* **`defaultKeywords`** (String): Fallback meta keywords list for SEO.
* **`favicon`** (String): Path to the favicon/tab icon.
* **`logo`** (String): Path to the logo image.
* **`timezone`** (String): Global IANA timezone name for the website (e.g. `"Asia/Jakarta"`).
* **`timezoneOffset`** (String): Global UTC offset for the website (e.g. `"+07:00"` for WIB).
* **`contact`** (Object):
  * **`location`** (String): Room / building location.
  * **`university`** (String): Institution name and address.
  * **`email`** (String): Lab contact email address.
* **`socials`** (Object):
  * **`instagram`** (String): Full URL to the lab's Instagram profile.

### Site Configuration Template
```json
{
  "name": "EIM",
  "subName": "Lab",
  "fullName": "Enterprise Infrastructure Management Laboratory",
  "defaultTitle": "EIM Lab - Enterprise Infrastructure Management",
  "defaultDescription": "Website Resmi Laboratorium Enterprise Infrastructure Management (EIM) Telkom University.",
  "defaultKeywords": "EIM, EIM Lab, Telkom University, Enterprise Infrastructure Management, Laboratorium Jaringan, Cloud Computing, Praktikum Jaringan",
  "favicon": "/image/eim/logo_EIM.avif",
  "logo": "/image/eim/logo_EIM.avif",
  "timezone": "Asia/Jakarta",
  "timezoneOffset": "+07:00",
  "contact": {
    "location": "TULT Building 8th Floor, Room TULT.08.09",
    "university": "Telkom University, Bandung, Indonesia",
    "email": "eimlab@telkomuniversity.ac.id"
  },
  "socials": {
    "instagram": "https://www.instagram.com/eimresearchlab/"
  }
}
```

---

## 7. Managing Recruitment Results via Keystatic CMS (`/keystatic`)

Lab staff manage candidate recruitment search results directly on the **Keystatic Admin Page** at `/keystatic`.

### Accessing Keystatic Admin
- URL Path: `/keystatic`
- Singleton Section: **Singletons > Recruitment Results (Candidate Search)**

### How to Update Candidates inside Keystatic Admin
1. Log into the Keystatic Admin dashboard at `/keystatic`.
2. Click on **Singletons** in the left menu, then select **Recruitment Results (Candidate Search)**.
3. Update the **Batch Title** (e.g. `Recruitment Assistant 2026`) and **Published Date**.
4. Choose your preferred update method inside Keystatic:
   - **Method A (Bulk Spreadsheet Paste)**: Copy table rows directly from Google Sheets or Excel (`NIM`, `Division`, `ScreeningStatus`, `TechnicalTestStatus`, `FinalStatus`, `Notes`) and paste them into the **Bulk Spreadsheet Paste** field.
   - **Method B (Individual Entries)**: Under **Candidate List (Individual Entries)**, click **Add** to manage candidate records manually.
5. Click **Save** in Keystatic to write updates directly into `src/data/recruitment_results.json`. Candidates will immediately be searchable by NIM on the website registration page.

---

## 8. Announcement Banner (`src/data/announcement.json`)

Site administrators can toggle and configure a top global announcement banner that appears across all pages of the site via **Keystatic Admin > Singletons > Announcement Banner**.

### Fields Explanation
* **`enabled`** (Boolean): Toggle banner ON/OFF across the entire website.
* **`mode`** (`"auto_recruitment"` | `"manual"`):
  - `"auto_recruitment"`: Automatically updates banner text, alert style, icon, and CTA link to mirror the active recruitment pipeline status (e.g. Opening Soon, Registration Open, Document Screening Results, Final Results).
  - `"manual"`: Displays custom manual announcement text and settings configured below.
* **`alertType`** (`"recruitment"` | `"maintenance"` | `"info"` | `"success"`): Color-coded visual theme for manual announcements:
  - `"recruitment"`: Purple & Gold accent
  - `"maintenance"`: Amber & Crimson caution accent
  - `"info"`: Cyan & Blue accent
  - `"success"`: Emerald Green accent
* **`badgeText`** (String): Short uppercase tag displayed on the banner (e.g., `"PENGUMUMAN"`, `"MAINTENANCE"`).
* **`message`** (String): Main announcement message displayed to visitors.
* **`ctaText`** (String, Optional): Call-To-Action button text (e.g., `"Daftar Sekarang"`, `"Info Selengkapnya"`).
* **`ctaLink`** (String, Optional): Destination URL when clicking the button.
* **`dismissible`** (Boolean): Allows visitors to close/hide the banner.
* **`id`** (String): Version identifier. Changing this value (e.g. from `announcement-v1` to `announcement-v2`) forces the banner to re-appear for visitors who previously dismissed it.

---

## 9. Lecturers (`src/data/lecturers.json`)
This file holds the dosen entries. Each entry's `role` is a position id from `positions.json`, so a lecturer appears in the matching `/structure` section.

Manage it via **Keystatic Admin > Singletons > Lecturers**. Entries with an empty `image` fall back to the placeholder avatar.

### Fields Explanation
* **`id`** (String): Unique id. Course `coordinatorId` values reference these ids.
* **`name`** (String): Full name, with title.
* **`role`** (String): A position id from `positions.json` (`ketua-lab`, `wakil-ketua-lab`, `dosen-anggota`, `koordinator-matkul`, …).
* **`image`**, **`scale`**, **`position`**: Same meaning as on members.

### Lecturer Template
```json
  {
    "id": "dosen-koordinator-matkul-1",
    "name": "Nama Dosen",
    "role": "koordinator-matkul",
    "image": "",
    "scale": "1",
    "position": "center"
  }
```
## 10. Contact Page (`src/data/contact.json`)

Configures the `/contact` page. Manage it via **Keystatic Admin > Singletons > Contact Page**.

### Fields Explanation
* **`title`** / **`heroDescription`**: Hero heading and description.
* **`locationTitle`**, **`location`**, **`university`**: Location row and its label.
* **`mapsUrl`**, **`mapsEmbedUrl`**: External maps link and the map iframe URL.
* **`emailTitle`**, **`email`**: Email row label and address.
* **`hoursTitle`**, **`hoursText`**, **`hoursSubtext`**: Operating-hours row.
* **`mapSectionTitle`**, **`mapSectionSubtitle`**: Map section heading and intro.
* **`contactPersons`** (Array): Narahubung cards shown inside "Kanal komunikasi".
  These are independent of the recruitment PICs in **Registration Settings** (`src/data/registration.json`); update both if the same people appear on both pages.
  * **`name`**: PIC name.
  * **`role`**: Differentiator shown on the card (e.g. `"CP Rekrutmen"`, `"CP Riset"`). Keep it short so the badge stays on one line.
  * **`platform`**: `whatsapp`, `line`, `email`, or `phone` (selects the icon).
  * **`contactId`**: Phone number or handle shown on the card.
  * **`link`**: Direct clickable link (must start with `https://`, `mailto:`, or `tel:`, e.g. `https://wa.me/6281234567890`). Leave empty to render a non-clickable card.

> Entries in the repository currently use placeholder numbers (`08xx-xxxx-xxxx`). Replace them with real PIC data before publishing.

### Contact Person Template
```json
{
  "name": "Nama PIC",
  "role": "CP Rekrutmen",
  "platform": "whatsapp",
  "contactId": "081234567890",
  "link": "https://wa.me/6281234567890"
}
```







---

## 11. Course Catalog (`src/content/courses/`)
One Markdown file per course. The `/courses` page lists every entry (code, SKS, title, status, coordinator); `/courses/<slug>` adds the module topics and the full assistant list. The Beranda band shows the first three courses that have a practicum. Manage it via **Keystatic Admin > Collections > Courses**.

> The three files in the repository are placeholders (`Mata Kuliah Contoh 1–3`). Replace them with real courses before publishing.

### Fields Explanation
* **`title`** (String, required): Course name.
* **`code`** (String, required): Course code, shown on the list and detail page.
* **`sks`** (Number, required): Credit units, shown as "N SKS".
* **`semester`** (Number, optional): Semester number, shown when present.
* **`hasPracticum`** (Boolean, required): Whether the course has a practicum. When `false`, modules and assistants are not rendered even if data is still attached.
* **`modules`** (Array, optional): `title` plus a `topics` line. Module files cannot be shared, so only the topic list is published.
* **`coordinatorId`** (String, required): `id` of an entry in `lecturers.json`.
* **`assistantIds`** (Array of Numbers, optional): `id` values from `members.json`. Missing ids are skipped.
* **`order`** (Number, required): Sort order on the page, ties broken by title.
* Markdown body: the course description.

### Course Template
```markdown
---
title: Nama Mata Kuliah
code: SI2xxx
sks: 3
semester: 4
hasPracticum: true
modules:
  - title: Modul 1 — Nama Modul
    topics: Topik pertama, topik kedua.
coordinatorId: dosen-koordinator-matkul-1
assistantIds:
  - 1
order: 1
---

Deskripsi singkat mata kuliah dan cakupan praktikumnya.
```

## 12. Photo Gallery (`src/data/gallery.json`)
Photos shown on the Tentang Kami page. The featured studio portrait renders as a full-width band after the numbers; the activity photos render as a grid at the end of the page. The grid is hidden when there are no photos; the band is hidden when the featured photo is empty.

### Fields Explanation
* **`featured`** (Object): The special studio portrait.
  * **`image`** (String): Photo path. Upload through Keystatic; files are written to `public/image/gallery/`.
  * **`alt`** (String): Alt text for screen readers. Required.
  * **`caption`** (String): Caption shown under the band.
* **`photos`** (Array): Activity photos, each with `image`, `alt`, and `caption`. Three across at desktop, two at tablet, one at phone. The first six are shown; any extras wait behind a "Lihat semua foto" control that expands them in place.

### Notes
* The shipped entry points at `public/image/gallery/placeholder.svg` so the layout is visible. Replace it with the real portrait and activity photos in Keystatic; the placeholder can stay in the repo.
* Images are referenced by path, like member photos and news images, so keep files reasonably sized (roughly 1600px wide, under 400 KB) before uploading.
