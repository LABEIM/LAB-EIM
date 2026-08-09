# EIM Research Lab Website

Official website of the Enterprise Infrastructure Management (EIM) Research Lab, Faculty of Industrial Engineering, Telkom University.
Primary: https://lab-eim.pages.dev/
Backup: https://lab-eim.vercel.app/

## Key Technologies

- **Framework**: [Astro v7.0.9](https://astro.build/)
- **Styling**: [Tailwind CSS v4.0.0](https://tailwindcss.com/) via `@tailwindcss/vite`
- **Language**: TypeScript
- **Runtime**: Node.js v22

## Directory Structure

- `src/content.config.ts`: Defines Zod schemas and loaders for static markdown content collections (`news`, `events`).
- `src/content/`: Contains static Markdown files representing news articles and laboratory events.
- `src/data/`: Contains JSON files (`site.json`, `members.json`, `divisions.json`, `registration.json`) for easy website-wide metadata and team configuration, and `CONFIG_GUIDE.md`.
- `src/pages/`: File-system routing directories for Astro.
- `src/layouts/`: Base wrapper page layout (`Layout.astro`).
- `src/components/`: Reusable components such as `Navbar.astro` and `Footer.astro`.
- `src/styles/`: Global stylesheet (`globals.css`).
- `public/`: Static folder hosting images, logos, and assistant profiles.

## Setup & Deployment

For a step-by-step guide to installing dependencies, running local development, configuring Google Sheets integration, setting up Keystatic CMS, and deploying to Vercel, refer to the [Setup and Deployment Guide](SETUP.md).

## Website Configuration

The website's metadata, laboratory divisions, active members, and registration settings can be customized by editing the JSON files in `src/data/`.

For detailed instructions and schema templates, refer to the [Configuration Guide](src/data/CONFIG_GUIDE.md).
