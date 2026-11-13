# EIM Lab Website

[![License: All Rights Reserved](https://img.shields.io/badge/License-All_Rights_Reserved-red.svg)](LICENSE)
[![CI/CD](https://github.com/LABEIM/LAB-EIM/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/LABEIM/LAB-EIM/actions)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
[![Security Policy](https://img.shields.io/badge/Security-Policy-brightgreen.svg)](SECURITY.md)
[![Website](https://img.shields.io/badge/Website-eimlab.org-0284c7.svg)](https://eimlab.org)
[![Organization](https://img.shields.io/badge/Org-LABEIM-6366f1.svg)](https://eimlab.org)

Official website of the Enterprise Infrastructure Management (EIM) Laboratory, Faculty of Industrial Engineering, Telkom University — presenting laboratory news, events, courses, role-based staff profiles, and recruitment announcements.

[**Live Website**](https://eimlab.org) · [**EIM Lab**](https://eimlab.org) · [**Report Issue**](https://github.com/LABEIM/LAB-EIM/issues)

---

## About This Project

The EIM Lab website is a statically generated, Indonesian-language public site built with Astro and managed through Keystatic CMS. Content is stored as Markdown collections and JSON data files, so the site can be maintained without a database. It is deployed to Cloudflare Workers as the primary host, with Vercel available as a static backup host.

- **Primary Host:** [eimlab.org](https://eimlab.org)
- **Secondary Host:** [backup.eimlab.org](https://backup.eimlab.org)

### Key Technologies

- **Framework:** [Astro v7.4.7](https://astro.build/) (SSG with `@astrojs/cloudflare` adapter, deployed to Cloudflare Workers)
- **CMS:** [Keystatic](https://keystatic.com/) (`@keystatic/astro` v5.2.0, `@keystatic/core` v0.6.9, Keystatic Cloud in production)
- **UI Components:** React v19.3.1 (`@astrojs/react`)
- **Styling:** [Tailwind CSS v4.3.5](https://tailwindcss.com/) via `@tailwindcss/vite`, plus modular vanilla CSS
- **Language:** TypeScript v6.0.3
- **Runtime:** Node.js `>=22.12.0`

---

## Documentation Index

For detailed instructions on local development, deployment, backend integrations, brand assets, and data management, refer to the guides below:

1. **[Deployment & Hosting Guide](docs/DEPLOYMENT.md)**: Local development setup, Cloudflare Workers primary deployment, Keystatic Cloud configuration, Vercel backup hosting, and dual-hosting CI/CD pipeline.
2. **[Brand & Email Assets Hub](docs/ASSETS.md)**: Public CDN endpoints, email-optimized logos, dark/light banners, and social icons for email templates.
3. **[Registration Setup & Operations Guide](docs/REGISTRATION_SETUP.md)**: Google Apps Script (`code.gs`) backend setup, Google Drive permissions, recruitment pipeline stages, and candidate selection announcement management.
4. **[Data & Content Configuration Guide](docs/CONFIG_GUIDE.md)**: Customizing laboratory roles, staff member profiles, courses, the photo gallery, site metadata, and Keystatic CMS singletons.
5. **[Design Token Reference](docs/DESIGN_TOKENS.md)**: Token layers, naming rules, preferred spacing/type subsets, the full token index, and the starter recipe for a new lab site.

---

## Directory Structure

- `src/content.config.ts`: Defines Zod schemas and loaders for static markdown content collections (`news`, `events`, `courses`).
- `src/content/`: Contains static Markdown files representing news articles and laboratory events.
- `src/data/`: Contains JSON files (`site.json`, `members.json`, `lecturers.json`, `positions.json`, `gallery.json`, `registration.json`) for website-wide metadata, the role model and team configuration, and the guide in `docs/CONFIG_GUIDE.md`.
- `src/pages/`: File-system routing directories for Astro.
- `src/layouts/`: Base wrapper page layout (`Layout.astro`).
- `src/components/`: Reusable components such as `Navbar.astro` and `Footer.astro`.
- `src/styles/`: Modular CSS stylesheets (`variables.css`, `base.css`, `globals.css`, component styles).
- `public/`: Static folder hosting images, logos, and assistant profiles.

---

## Community & Contributing

We are committed to fostering an open, welcoming, and harassment-free environment for all researchers, developers, and contributors. All participants and team members are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

For contribution workflows, git branching standards, and Pull Request guidelines, please refer to our [Contributing Guide](CONTRIBUTING.md).

To report security vulnerabilities responsibly, please review our [Security Policy](SECURITY.md).

For concerns or incident reports, please contact the project team or laboratory administration at [`lab@eimlab.org`](mailto:lab@eimlab.org).

---

## License & Ownership

Copyright (c) 2026 **Enterprise Infrastructure Management (EIM) Laboratory**, Telkom University.  
**All Rights Reserved.**

This repository, its source code, website design, assets, and documentation are proprietary and confidential to Enterprise Infrastructure Management (EIM) Laboratory. Unauthorized copying, modification, distribution, public display, or re-hosting is strictly prohibited without prior written consent. See [LICENSE](LICENSE) for full terms.
