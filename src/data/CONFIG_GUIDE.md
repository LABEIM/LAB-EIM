# EIM Research Lab - Configuration Guide & Templates

This guide explains how to update the laboratory divisions, staff members, and recruitment registration details using the JSON files in the `src/data/` directory.

Admin Portal: https://lab-eim.vercel.app/keystatic

---

## 1. Divisions Configuration (`src/data/divisions.json`)
This file defines all operational divisions in the laboratory. Adding a new division here automatically updates the homepage grid, the filter tabs on the team structure page, and the dropdown choices on the registration page.

### Fields Explanation
* **`id`** (String): A unique, lowercase identifier for the division. This matches the `division` field in `members.json`. (e.g. `"core"`, `"research"`, `"security"`)
* **`name`** (String): The title-case name of the division, displayed on the filter tabs. (e.g. `"Cyber Security"`)
* **`displayName`** (String): The uppercase badge text displayed on the member's card. (e.g. `"CYBER SECURITY"`)
* **`description`** (String): A brief description of the division's role, displayed on the homepage division grid.
* **`registrationLabel`** (String): The text displayed in the division choices selection dropdowns on the registration page.
* **`registrationValue`** (String): The database/Sheets value sent upon registration (historically Indonesian terms, e.g. `"Inti"`, `"Riset"`, `"Lomba"`, etc.).
* **`aliases`** (Array of Strings): Alternative keys (like Indonesian legacy translations) to support existing URL bookmarks. For example, if a user goes to `/structure?div=riset`, it maps to `"research"`.
* **`borderColor`** (String): A CSS color string defining the border glow of the member cards in this division. (Supports `rgba()`, `hex`, or theme custom properties).
* **`roleColor`** (String): A CSS color string defining the coordinator/staff role text color.

### Division Template
```json
  {
    "id": "security",
    "name": "Cyber Security",
    "displayName": "CYBER SECURITY",
    "description": "Focuses on network defense, penetration testing, security audits, and cryptography studies.",
    "registrationLabel": "Cyber Security (Defense & Penetration Testing)",
    "registrationValue": "Security",
    "aliases": ["security", "keamanan"],
    "borderColor": "rgba(231, 76, 60, 0.3)",
    "roleColor": "#e74c3c"
  }
```

---

## 2. Members Directory (`src/data/members.json`)
This file contains the list of all active laboratory assistants.

### Fields Explanation
* **`id`** (Number): A unique numeric ID for the member.
* **`name`** (String): Full name of the assistant.
* **`role`** (String): Role or title in the lab (e.g. `"EIM Lab Coordinator"`, `"Staff"`, `"Research Coordinator"`).
* **`division`** (String): Must exactly match the **`id`** of one of the divisions defined in `divisions.json` (e.g. `"core"`, `"research"`, `"pku"`).
* **`image`** (String): Path to the member's avatar image starting from `/image/`.
* **`scale`** (String, Optional): CSS transform scale value for positioning adjustments in the circle frame (e.g. `"2.5"`, `"3"`, `"1"`).
* **`position`** (String, Optional): CSS object position values to focus/center the avatar face inside the crop circle (e.g. `"center 32%"`, `"50% 15%"`).

### Member Template
```json
  {
    "id": 26,
    "name": "Jane Doe",
    "role": "Staff",
    "division": "research",
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
* **Stage Configurations**: `upcomingConfig`, `extendedConfig`, `selectionConfig`, `selectionResultsConfig`, `technicalTestConfig`, `technicalTestResultsConfig`, `interviewConfig`, `announcementConfig`, `closedConfig`, `fallbackConfig`.
  * **`fallbackConfig`**: Configures the maintenance/backup view text and link (`title`, `subtitle`, `message`, `formUrl`, `buttonText`).

---

## 4. Candidate Recruitment Results (`src/data/recruitment_results.json`)
This file manages candidate evaluation status entries across all announcement checkpoints.

### Fields Explanation
* **`batch`** (String): Name of the recruitment batch (e.g. `"Recruitment Assistant 2026"`).
* **`publishedDate`** (String): Announcement release date.
* **`candidates`** (Array of Objects): List of candidate status entries:
  * `nim` (String): Student ID (e.g. `"1202210001"`). NIM is strictly used as the unique search identifier for announcement checkups.
  * `name` (String): Full name of the candidate (kept internally for record keeping).
  * `division` (String): Division name.
  * `screeningStatus` (String): `"passed"` or `"failed"`.
  * `technicalTestStatus` (String): `"passed"` or `"failed"`.
  * `finalStatus` (String): `"accepted"`, `"waitlist"`, or `"rejected"`.
  * `notes` (String): Custom congratulations or feedback note.


## 4. News Articles (`src/content/news/`)
News articles are stored as Markdown (`.md`) files in `src/content/news/`.

### Fields Explanation
* **`title`** (String): The title of the news article.
* **`category`** (String): The category tag (e.g., `"Beasiswa"`, `"Pengumuman"`, `"Riset"`).
* **`author`** (String): The publisher or author name (e.g., `"EIM Research Lab"`, `"UK Government"`).
* **`news_date`** (String): Date of publication in `YYYY-MM-DD` format.
* **`image`** (Array of Strings): Optional image URLs or paths to display as featured images.

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
* **`description`** (String): A short summary of the event shown in lists.
* **`link`** (String, Optional): Registration or external link.
* **`image`** (Array of Strings, Optional): Optional image URLs/paths.
* **`icon`** (String, Optional): FontAwesome icon class name (e.g., `"fa-building-columns"`, `"fa-solid fa-calendar-days"`).
* **`organizer`** (String, Optional): Name of the organizer (defaults to EIM).
* **`benefits`** (Array of Strings, Optional): List of benefits for participants.
* **`requirements`** (Array of Strings, Optional): List of requirements/criteria for participants.
* **`show_register`** (Boolean, Optional): Whether to display a register button (defaults to `true`).

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
organizer: "EIM Research Lab"
benefits:
  - "Benefit 1"
  - "Benefit 2"
requirements:
  - "Requirement 1"
  - "Requirement 2"
show_register: true
---
Write the main event details, schedule, or extra information here in Markdown format.
```

---

## 6. Global Site Settings (`src/data/site.json`)
This file configures the global branding, tab information, and social links of the laboratory website.

### Fields Explanation
* **`name`** (String): Short name of the lab (e.g. `"EIM"`). Used in the Navbar logo and title.
* **`subName`** (String): Subtitle suffix for the logo (e.g. `"Research Lab"`).
* **`fullName`** (String): Complete formal name (e.g. `"Enterprise Infrastructure Management Research Laboratory"`). Used in copyright text and about summaries.
* **`defaultTitle`** (String): The default window/tab title for pages that do not override it.
* **`defaultDescription`** (String): Fallback meta description for search engines.
* **`defaultKeywords`** (String): Fallback meta keywords list for SEO.
* **`favicon`** (String): Path to the favicon/tab icon.
* **`logo`** (String): Path to the logo image.
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
  "subName": "Research Lab",
  "fullName": "Enterprise Infrastructure Management Research Laboratory",
  "defaultTitle": "EIM Research Lab - Enterprise Infrastructure Management",
  "defaultDescription": "Website Resmi Enterprise Infrastructure Management (EIM) Research Lab Telkom University.",
  "defaultKeywords": "EIM, EIM Research Lab, Telkom University, Enterprise Infrastructure Management, Laboratorium Jaringan, Cloud Computing, Riset Jaringan",
  "favicon": "/image/eim/logo_EIM.avif",
  "logo": "/image/eim/logo_EIM.avif",
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


