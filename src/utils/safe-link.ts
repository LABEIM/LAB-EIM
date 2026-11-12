/**
 * Contact links come from CMS data. Only allow schemes that cannot execute
 * script, and trim stray whitespace from editor input.
 */
export function safeLink(value?: string): string | undefined {
  const link = value?.trim();
  return link && /^(https?:|mailto:|tel:)/i.test(link) ? link : undefined;
}

/**
 * Internal-only links built from data-* attributes. Only same-origin absolute
 * paths pass; `//host`, `/\host` and tab/newline variants are rejected because
 * the URL parser folds or strips those characters.
 */
export function internalHref(value: string | null | undefined, fallback: string): string {
  const href = (value || '').trim();
  return /^\/(?![/\\\t\n\r])/.test(href) ? href : fallback;
}
