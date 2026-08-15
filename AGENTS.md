# AGENTS.md

## Section 1: Agent Operational Workflow

### 1.1 Startup Workflow
Before writing any code, the agent must complete these steps:
1. Confirm the working directory using `pwd`.
2. Check content collection files in `src/content/events/` and `src/content/news/` to understand current configuration states.
3. Review recent repository history by checking the last 5 commits using `git log --oneline -5`.
4. Run the required build verification using `npm run build` or `npx astro check` before starting new work. If baseline verification fails, fix that issue first before stacking new feature work on top of a broken starting state.

### 1.2 Working Rules
1. Focus entirely on one feature or task at a time.
2. Do not mark a task or feature complete just because code was added. Ensure it compiles and is verified.
3. Keep all changes within the selected task scope unless a critical blocker forces a narrow supporting fix.
4. Do not silently alter verification rules during implementation.
5. Prefer durable repository artifacts over transient chat summaries.
6. When making structural updates, dependency version bumps, framework configuration changes, schema updates, or directory layout shifts, the agent must update corresponding repository documentation (`AGENTS.md`, `README.md`, `DEPLOYMENT.md`, `REGISTRATION_SETUP.md`) and TypeScript interfaces (`src/utils/types.ts`) to reflect the new state.

### 1.3 Required Artifacts
1. `src/content.config.ts`: Defines Zod schemas and loaders for static content collections (`news`, `events`).
2. `keystatic.config.ts`: Defines Keystatic CMS schemas, singletons, and content collections.
3. `astro.config.mjs`: Central Astro configuration including i18n routing, Cloudflare adapter, integrations, and Vite plugins.
4. `src/content/`: Contains Markdown entries representing news articles and laboratory events.
5. `package.json`: Main repository dependencies, runtime constraints, and script targets.

### 1.4 Definition Of Done
A feature achieves the status of completed only when all of the following conditions are met:
1. The target behavior is fully implemented.
2. The site compiles successfully locally using `npm run build`.
3. Astro diagnostics run successfully using `npx astro check` with zero errors.
4. If testing dynamic logic (like client-side forms), manually verify correct DOM rendering and network/simulation fallbacks.

### 1.5 End Of Session Workflow
Before ending a session, the agent must perform these tasks:
1. Confirm no trailing linter or type errors remain by running validation tasks.
2. Explicitly record any unresolved risk, technical debt, or workflow blocker in the session handoff.
3. Commit the changes with a descriptive message adhering to the Conventional Commits specification once the work is in a safe state.

---

## Section 2: Tech Stack & Architecture

### 2.1 Framework & Core Stack
- **Framework**: Astro v7.1.6 (configured as a static site generator / SSG with `@astrojs/cloudflare` adapter).
- **CMS**: Keystatic CMS (`@keystatic/astro` v5.0.0, `@keystatic/core` v0.6.0).
- **UI Components**: React v19.2.8 (`@astrojs/react` v6.0.0) combined with Astro components.
- **Styling**: Tailwind CSS v4.3.3 (integrated via `@tailwindcss/vite` plugin) combined with a modular Vanilla CSS architecture (`src/styles/`).
- **Internationalization (i18n)**: Single-locale ('id') translation & UI dictionary utilities (`src/utils/i18n.ts`).
- **Typography**: `@fontsource/inter`, `@fontsource/montserrat`, `@fontsource/poppins`.
- **Languages**: TypeScript (v6.0.3), HTML5, Vanilla CSS.
- **Runtime & Build Tools**: Node.js `>=22.12.0`, npm.

### 2.2 Directory Layout & Component Roles
- `astro.config.mjs`: Astro configuration for Cloudflare adapter, integrations, Vite alias (`@/`), SSR externalized modules (`sharp`, `detect-libc`), and chunk size limits.
- `keystatic.config.ts`: Keystatic CMS singletons (e.g. recruitment settings) and collections.
- `src/content.config.ts`: Collection loaders and Zod schemas (`news`, `events`).
- `src/content/`: Static Markdown and MDX content files (`news/`, `events/`).
- `src/styles/`: Modular design system and stylesheets:
  - `variables.css`, `base.css`, `globals.css`, `mobile.css`, `icons.css`.
  - `src/styles/components/`: Dedicated stylesheets for UI components (`navbar.css`, `footer.css`, `event-card.css`, `news-card.css`, `contact-person.css`).
  - `src/styles/pages/`: Page-specific stylesheets.
- `src/layouts/Layout.astro`: Base wrapper page layout.
- `src/components/`: Reusable Astro and React UI components (Navbar, Footer, etc.).
- `src/pages/`: File-system routing directories, including localized routes and Keystatic admin (`/keystatic`).
- `src/utils/`: Business logic, i18n helpers, content filtering, registration logic, and TypeScript interfaces (`i18n.ts`, `content-helpers.ts`, `registration-config.ts`, `recruitment.ts`, `division-mapper.ts`, `types.ts`, `constants.ts`).

### 2.3 Role-Based Access Control & Scoping (If Applicable)
- **Not Applicable**: The EIM Research Lab website is a fully public-facing static application. Keystatic CMS operates locally or via GitHub integration without a database backend or authentication schemas.

### 2.4 Service & Business Logic Layer
- **Pendaftaran Form**: Posts payload client-side to Google Apps Script (`code.gs`).
- **Recruitment Pipeline**: Configured dynamically via Keystatic CMS singletons (`keystatic.config.ts`) and loaded through `src/utils/registration-config.ts`.

---

## Section 3: Privacy, Security & Specifications

### 3.1 Privacy & Environment Safety
1. Do not hardcode personal user data in the source code, comments, or documentation. Keep emails and generic references public.
2. Secrets management: Do not commit active variables or access keys. Keep `.env` and `creds.json` files out of source control using `.gitignore`.

### 3.2 Security Rules
1. XSS: Escape dynamic inputs and query params. Utilize Astro's standard HTML escaping.

### 3.3 Database Status & State Codes (If Applicable)
- **Not Applicable**: Moved from MySQL database to static markdown collections and Keystatic CMS.

---

## Section 4: Development, Testing & Operations

### 4.1 Coding Standards & Formatting
1. Indentation: 2 spaces for HTML, CSS, JS, TS, Astro, JSON, and YAML configurations.
2. Formatting: Enforced using standard Astro framework standards and strict TypeScript compiler settings.
3. Modular CSS: Component-specific styles must be placed in `src/styles/components/` (e.g. `src/styles/components/navbar.css`) and imported cleanly into the respective component or layout.
4. Commit conventions: All commits must follow the Conventional Commits specification.

### 4.2 Testing & Portability
1. Verification: 
   - Run type checks and framework linting: `npx astro check`
   - Run production compilation test: `npm run build`
2. Test Isolation: Since this is a static site without database state modification, assure local web dev environments run on isolated local host ports (default: `http://localhost:4321`).

### 4.3 Containerization & Ports (If Applicable)
- **Dev Server**: Standard local host port `http://localhost:4321`.
