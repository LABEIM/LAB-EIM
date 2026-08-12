# EIM Research Lab Website

Official website of the Enterprise Infrastructure Management (EIM) Research Lab, Faculty of Industrial Engineering, Telkom University.
- **Primary Host**: [eimlab.org](https://eimlab.org)
- **Secondary Host**: [backup.eimlab.org](https://backup.eimlab.org)

## Key Technologies

- **Framework**: [Astro v7.1.3](https://astro.build/)
- **Styling**: [Tailwind CSS v4.3.3](https://tailwindcss.com/) via `@tailwindcss/vite`
- **Language**: TypeScript (`v6.0.3`)
- **Runtime**: Node.js `>=22.12.0`

## Documentation Index

For detailed instructions on local development, deployment, backend integrations, and data management, refer to the guides below:

1. **[Deployment & Hosting Guide](DEPLOYMENT.md)**: Local development setup, Cloudflare Pages primary deployment, Keystatic CMS configuration, Vercel backup hosting, and dual-hosting CI/CD pipeline.
2. **[Registration Setup & Operations Guide](REGISTRATION_SETUP.md)**: Google Apps Script (`code.gs`) backend setup, Google Drive permissions, recruitment pipeline stages, and candidate selection announcement management.
3. **[Data & Content Configuration Guide](src/data/CONFIG_GUIDE.md)**: Customizing laboratory divisions, staff member profiles, site metadata, and Keystatic CMS singletons.

## Directory Structure

- `src/content.config.ts`: Defines Zod schemas and loaders for static markdown content collections (`news`, `events`).
- `src/content/`: Contains static Markdown files representing news articles and laboratory events.
- `src/data/`: Contains JSON files (`site.json`, `members.json`, `divisions.json`, `registration.json`) for easy website-wide metadata and team configuration, and `CONFIG_GUIDE.md`.
- `src/pages/`: File-system routing directories for Astro.
- `src/layouts/`: Base wrapper page layout (`Layout.astro`).
- `src/components/`: Reusable components such as `Navbar.astro` and `Footer.astro`.
- `src/styles/`: Modular CSS stylesheets (`variables.css`, `base.css`, `globals.css`, component styles).
- `public/`: Static folder hosting images, logos, and assistant profiles.

