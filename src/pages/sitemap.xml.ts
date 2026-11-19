import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getCleanSlug } from '../utils/i18n';

export const prerender = true;

const STATIC_PATHS = ['/', '/about/', '/structure/', '/courses/', '/event/', '/news/', '/registration/', '/contact/'];

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ site, url }) => {
  const base = site ?? url;
  const paths = new Set(STATIC_PATHS);

  for (const course of await getCollection('courses')) {
    paths.add(`/courses/${getCleanSlug(course.id)}/`);
  }
  for (const item of await getCollection('news')) {
    if (!item.data.audit) paths.add(`/news/${getCleanSlug(item.id)}/`);
  }
  for (const item of await getCollection('events')) {
    if (!item.data.audit) paths.add(`/event/${getCleanSlug(item.id)}/`);
  }

  const entries = [...paths]
    .map((path) => `  <url><loc>${escapeXml(new URL(path, base).href)}</loc></url>`)
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
  );
};
