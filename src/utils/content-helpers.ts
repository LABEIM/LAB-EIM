/**
 * Determines whether the current environment is production.
 * - Returns `true` for production builds (where audit benchmark content should be excluded from listings).
 * - Returns `false` for local development (`astro dev`) or preview deployments (where audit content is shown as example content).
 */
export function isProductionEnv(): boolean {
  // Explicit override: if SHOW_AUDIT_CONTENT or PUBLIC_SHOW_AUDIT_CONTENT is set
  if (
    process.env.SHOW_AUDIT_CONTENT === 'true' ||
    process.env.PUBLIC_SHOW_AUDIT_CONTENT === 'true' ||
    import.meta.env.PUBLIC_SHOW_AUDIT_CONTENT === 'true'
  ) {
    return false;
  }

  // Local development server (astro dev)
  if (import.meta.env.DEV) {
    return false;
  }

  // Vercel deployment check (preview or development)
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
    return false;
  }

  // Cloudflare Pages deployment check (preview branch)
  if (
    process.env.CF_PAGES_BRANCH &&
    process.env.CF_PAGES_BRANCH !== 'main' &&
    process.env.CF_PAGES_BRANCH !== 'master'
  ) {
    return false;
  }

  // GitHub Actions pull request build
  if (process.env.GITHUB_EVENT_NAME === 'pull_request') {
    return false;
  }

  // Explicit preview environment flag
  if (process.env.IS_PREVIEW === 'true' || process.env.ENVIRONMENT === 'preview') {
    return false;
  }

  return true;
}

/**
 * Filters audit content from news or events collections.
 * - In Production: items with `audit: true` are excluded.
 * - In Local Dev / Preview: items with `audit: true` are retained so they can be viewed/toggled.
 */
export function filterAuditContent<T extends { data: { audit?: boolean } }>(items: T[]): T[] {
  if (isProductionEnv()) {
    return items.filter(item => !item.data.audit);
  }
  return items;
}
