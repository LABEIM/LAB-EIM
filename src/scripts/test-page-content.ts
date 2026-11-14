import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sectionOn } from '../utils/page-content';
import type { AboutData, ChromeData, HomePageData } from '../utils/types';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const dataDir = join(root, 'src/data');
const publicDir = join(root, 'public');

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

const chromeGroups: Record<keyof ChromeData, string[]> = {
  nav: ['home', 'about', 'structure', 'courses', 'event', 'news', 'register', 'contact', 'joinUs'],
  footer: ['description', 'quickLinks', 'contact', 'resources', 'assets', 'linkHub', 'rights', 'backToTop'],
  cta: ['title', 'description', 'contactLabel'],
  brand: ['logoHorizontal', 'logoIcon'],
  labels: ['upcoming', 'details', 'learnMore', 'statsDosen', 'statsMembers', 'statsCourses', 'organizerFallback', 'coordinator', 'sks', 'practicumYes', 'practicumNo', 'featured', 'search', 'close', 'vision', 'mission', 'values'],
};

console.log('🧪 Running Page Content Guard Tests...\n');

console.log('1️⃣ Testing chrome.json:');
const chromePath = join(dataDir, 'chrome.json');
const chromeExists = existsSync(chromePath);
assert(chromeExists, 'chrome.json exists');
const chrome = (chromeExists ? JSON.parse(readFileSync(chromePath, 'utf8')) : {}) as Partial<
  Record<keyof ChromeData, Record<string, unknown>>
>;

for (const [group, keys] of Object.entries(chromeGroups)) {
  for (const key of keys) {
    const value = chrome[group as keyof ChromeData]?.[key];
    assert(typeof value === 'string' && value.trim().length > 0, `chrome.${group}.${key} is a non-empty string`);
  }
}

console.log('\n2️⃣ Testing sectionOn:');
assert(sectionOn(undefined) === true, 'sectionOn(undefined) is true');
assert(sectionOn({}) === true, 'sectionOn({}) is true');
assert(sectionOn({ enabled: true }) === true, 'sectionOn({ enabled: true }) is true');
assert(sectionOn({ enabled: false }) === false, 'sectionOn({ enabled: false }) is false');

console.log('\n3️⃣ Testing chrome.brand files:');
for (const key of chromeGroups.brand) {
  const value = chrome.brand?.[key];
  const file = typeof value === 'string' ? join(publicDir, value.replace(/^\//, '')) : '';
  assert(Boolean(file) && existsSync(file), `chrome.brand.${key} resolves under public/`);
}

console.log('\n4️⃣ Testing pages/home.json:');
const homePath = join(dataDir, 'pages/home.json');
const homeExists = existsSync(homePath);
assert(homeExists, 'pages/home.json exists');
const home = (homeExists ? JSON.parse(readFileSync(homePath, 'utf8')) : {}) as Partial<HomePageData>;

const homeSections = ['meta', 'navDots', 'hero', 'reveal', 'focus', 'visiMisi', 'numbers', 'courses', 'events', 'news', 'cta'] as const;
for (const key of homeSections) {
  assert(Boolean(home[key]) && typeof home[key] === 'object', `home.${key} exists`);
}

const toggleableSections = ['reveal', 'focus', 'visiMisi', 'numbers', 'courses', 'events', 'news', 'cta'] as const;
for (const key of toggleableSections) {
  assert(typeof home[key]?.enabled === 'boolean', `home.${key}.enabled is a boolean`);
}

for (const key of ['hero', 'meta', 'navDots'] as const) {
  const section = home[key];
  assert(Boolean(section) && !('enabled' in (section as object)), `home.${key} has no enabled toggle`);
}

for (const key of ['reveal', 'focus', 'vision', 'courses', 'events', 'articles', 'sectionLabel'] as const) {
  const value = home.navDots?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `home.navDots.${key} is a non-empty string`);
}

assert(Boolean(home.meta?.title?.trim()), 'home.meta.title is a non-empty string');
assert(
  Array.isArray(home.hero?.lines) && home.hero.lines.length >= 1 && home.hero.lines.length <= 3,
  'home.hero.lines has 1 to 3 lines'
);

console.log('\n5️⃣ Testing about.json:');
const aboutPath = join(dataDir, 'about.json');
const aboutExists = existsSync(aboutPath);
assert(aboutExists, 'about.json exists');
const about = (aboutExists ? JSON.parse(readFileSync(aboutPath, 'utf8')) : {}) as Partial<AboutData>;

for (const key of [
  'title',
  'description',
  'overviewTitle',
  'overviewContent1',
  'overviewContent2',
  'overviewImage',
  'vision',
  'sectionLabel',
] as const) {
  const value = about[key];
  assert(typeof value === 'string' && value.trim().length > 0, `about.${key} is a non-empty string`);
}
assert(Array.isArray(about.missions) && about.missions.length > 0, 'about.missions is a non-empty array');
assert(Array.isArray(about.values) && about.values.length > 0, 'about.values is a non-empty array');

assert(Boolean(about.meta?.title?.trim()), 'about.meta.title is a non-empty string');

const aboutSections = ['hero', 'profile', 'stats', 'teamLink', 'galleryBand', 'visiMisi', 'gallery', 'cta'] as const;
for (const key of aboutSections) {
  const section = about.sections?.[key];
  assert(Boolean(section) && typeof section === 'object', `about.sections.${key} exists`);
}

for (const key of ['profile', 'stats', 'teamLink', 'galleryBand', 'visiMisi', 'gallery', 'cta'] as const) {
  assert(typeof about.sections?.[key]?.enabled === 'boolean', `about.sections.${key}.enabled is a boolean`);
}
const aboutHero = about.sections?.hero;
assert(Boolean(aboutHero) && !('enabled' in (aboutHero as object)), 'about.sections.hero has no enabled toggle');
for (const key of ['eyebrow', 'description', 'meta', 'primaryLabel', 'secondaryLabel'] as const) {
  const value = aboutHero?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `about.sections.hero.${key} is a non-empty string`);
}
assert(
  Array.isArray(aboutHero?.lines) && aboutHero.lines.length >= 1 && aboutHero.lines.length <= 3,
  'about.sections.hero.lines has 1 to 3 lines'
);

const aboutProfile = about.sections?.profile;
for (const key of [
  'eyebrow',
  'factsLabel',
  'factName',
  'factFaculty',
  'factFacultyValue',
  'factProgram',
  'factProgramValue',
  'factLocation',
  'factEmail',
] as const) {
  const value = aboutProfile?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `about.sections.profile.${key} is a non-empty string`);
}

const aboutStats = about.sections?.stats;
assert(Boolean(aboutStats?.label?.trim()), 'about.sections.stats.label is a non-empty string');
assert(
  !Object.prototype.hasOwnProperty.call(aboutStats ?? {}, 'stats'),
  'about.sections.stats carries no stats array'
);

for (const key of ['teamLink', 'galleryBand'] as const) {
  const value = about.sections?.[key]?.label;
  assert(typeof value === 'string' && value.trim().length > 0, `about.sections.${key}.label is a non-empty string`);
}

assert(Boolean(about.sections?.visiMisi?.heading?.trim()), 'about.sections.visiMisi.heading is a non-empty string');

const aboutGallery = about.sections?.gallery;
for (const key of ['eyebrow', 'intro', 'title', 'showAll', 'hideAll'] as const) {
  const value = aboutGallery?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `about.sections.gallery.${key} is a non-empty string`);
}

for (const key of ['profile', 'stats', 'vision', 'cta', 'gallery'] as const) {
  const value = about.navDots?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `about.navDots.${key} is a non-empty string`);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
