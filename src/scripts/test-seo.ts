import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { escapeXml } from '../utils/sitemap';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const distDir = join(root, 'dist/client');
const siteData = JSON.parse(readFileSync(join(root, 'src/data/site.json'), 'utf8')) as {
  name: string;
  subName: string;
};
const brandName = `${siteData.name} ${siteData.subName}`;

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

console.log('🧪 Running SEO Metadata & Sitemap Tests...\n');

const hasDist = existsSync(distDir);
assert(hasDist, 'dist/client exists (run pnpm run build first)');
if (!hasDist) {
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(1);
}

const htmlFiles = collectHtml(distDir);
assert(htmlFiles.length > 0, 'built HTML exists in dist/client');

for (const file of htmlFiles) {
  const rel = relative(distDir, file).split(sep).join('/');
  const html = readFileSync(file, 'utf8');
  const headEnd = html.indexOf('</head>');
  assert(headEnd > 0, `${rel} has a <head>`);
  const head = headEnd > 0 ? html.slice(0, headEnd) : '';
  assert(/<meta name="description"/.test(head), `${rel} keeps a meta description`);

  const canonical = head.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? '';
  const ogUrl = head.match(/<meta property="og:url" content="([^"]+)"/)?.[1] ?? '';
  const ogSiteName = head.match(/<meta property="og:site_name" content="([^"]+)"/)?.[1] ?? '';
  assert(/^https?:\/\//.test(canonical), `${rel} has an absolute canonical URL`);
  assert(!canonical.includes('?'), `${rel} canonical has no query string`);
  assert(canonical === ogUrl, `${rel} canonical matches og:url`);
  assert(ogSiteName === brandName, `${rel} og:site_name is the full brand name`);

  for (const tag of ['og:type', 'og:site_name', 'og:title', 'og:description', 'og:locale', 'og:image']) {
    assert(head.includes(`property="${tag}"`), `${rel} has ${tag}`);
  }
  for (const tag of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
    assert(head.includes(`name="${tag}"`), `${rel} has ${tag}`);
  }
  const ogImage = head.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ?? '';
  assert(/^https?:\/\//.test(ogImage), `${rel} og:image is an absolute URL`);
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
assert(escapeXml(`a&b<c>d"e'f`) === 'a&amp;b&lt;c&gt;d&quot;e&apos;f', 'escapeXml escapes XML entities');

// Every indexable built page must be listed; nothing noindex may be listed.
const sitemapPaths = new Set(locs.map((loc) => new URL(loc).pathname));
for (const file of htmlFiles) {
  const rel = relative(distDir, file).split(sep).join('/');
  if (!rel.endsWith('index.html')) continue;
  const html = readFileSync(file, 'utf8');
  if (/<meta name="robots"[^>]*noindex/.test(html)) continue;
  const path = '/' + rel.replace(/index\.html$/, '');
  assert(sitemapPaths.has(path), `${path} is listed in sitemap.xml`);
}
for (const path of sitemapPaths) {
  const file = join(distDir, path.replace(/^\//, ''), 'index.html');
  if (!existsSync(file)) continue;
  assert(
    !/<meta name="robots"[^>]*noindex/.test(readFileSync(file, 'utf8')),
    `${path} in sitemap.xml is indexable`
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
