/**
 * Contact links come from CMS data. Only allow schemes that cannot execute
 * script, and trim stray whitespace from editor input.
 */
export function safeLink(value?: string): string | undefined {
  const link = value?.trim();
  return link && /^(https?:|mailto:|tel:)/i.test(link) ? link : undefined;
}
