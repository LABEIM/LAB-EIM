import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const distDir = join(root, 'dist/client');

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ PASSED: ${testName}`);
  } else {
    failed++;
    console.error(`  ❌ FAILED: ${testName}`);
    process.exitCode = 1;
  }
}

function collectHtml(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return collectHtml(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

const htmlFiles = collectHtml(distDir);
assert(htmlFiles.length > 0, 'built HTML exists in dist/client');

for (const file of htmlFiles) {
  const rel = relative(distDir, file).split(sep).join('/');
  const html = readFileSync(file, 'utf8');
  const head = html.slice(0, html.indexOf('</head>'));
  assert(head.length > 0, `${rel} has a <head>`);
  assert(/<meta name="description"/.test(head), `${rel} keeps a meta description`);

  const canonical = head.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? '';
  const ogUrl = head.match(/<meta property="og:url" content="([^"]+)"/)?.[1] ?? '';
  assert(/^https?:\/\//.test(canonical), `${rel} has an absolute canonical URL`);
  assert(!canonical.includes('?'), `${rel} canonical has no query string`);
  assert(canonical === ogUrl, `${rel} canonical matches og:url`);

  for (const tag of ['og:type', 'og:site_name', 'og:title', 'og:description', 'og:locale', 'og:image']) {
    assert(head.includes(`property="${tag}"`), `${rel} has ${tag}`);
  }
  for (const tag of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
    assert(head.includes(`name="${tag}"`), `${rel} has ${tag}`);
  }
}

const sitemapFile = join(distDir, 'sitemap.xml');
assert(existsSync(sitemapFile), 'sitemap.xml is generated during build');
const sitemap = existsSync(sitemapFile) ? readFileSync(sitemapFile, 'utf8') : '';
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert(locs.length >= 8, 'sitemap lists the static routes');
assert(locs.some((loc) => /\/courses\/$/.test(loc)), 'sitemap lists /courses/');
assert(locs.some((loc) => /\/courses\/[^/]+\/$/.test(loc)), 'sitemap lists a course detail page');
assert(!locs.some((loc) => loc.includes('audit-benchmark')), 'sitemap excludes noindex audit content');
assert(locs.every((loc) => /^https?:\/\//.test(loc)), 'sitemap URLs are absolute');
assert(new Set(locs).size === locs.length, 'sitemap URLs are unique');
assert(!/&(?!amp;|lt;|gt;|quot;|apos;)/.test(sitemap), 'sitemap XML escapes ampersands');

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
