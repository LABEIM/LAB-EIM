import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sectionOn } from '../utils/page-content';
import type { AboutData, ChromeData, CoursesPageData, HomePageData, StructurePageData } from '../utils/types';

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

console.log('\n6️⃣ Testing pages/structure.json:');
const structurePath = join(dataDir, 'pages/structure.json');
const structureExists = existsSync(structurePath);
assert(structureExists, 'pages/structure.json exists');
const structure = (structureExists ? JSON.parse(readFileSync(structurePath, 'utf8')) : {}) as Partial<StructurePageData>;

for (const key of ['hero', 'chart', 'roles', 'cta'] as const) {
  const section = structure[key];
  assert(Boolean(section) && typeof section === 'object', `structure.${key} exists`);
}

for (const key of ['chart', 'roles', 'cta'] as const) {
  assert(typeof structure[key]?.enabled === 'boolean', `structure.${key}.enabled is a boolean`);
}
assert(Boolean(structure.hero) && !('enabled' in (structure.hero as object)), 'structure.hero has no enabled toggle');

const structureHero = structure.hero;
for (const key of ['eyebrow', 'description', 'meta', 'primaryLabel', 'secondaryLabel'] as const) {
  const value = structureHero?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `structure.hero.${key} is a non-empty string`);
}
assert(
  Array.isArray(structureHero?.lines) && structureHero.lines.length >= 1 && structureHero.lines.length <= 3,
  'structure.hero.lines has 1 to 3 lines'
);

const structureChart = structure.chart;
for (const key of ['title', 'intro', 'ariaLabel', 'memberAssistantNote', 'practicumAssistant', 'emptyPosition', 'positionCount'] as const) {
  const value = structureChart?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `structure.chart.${key} is a non-empty string`);
}
const structureGroups = structure.groups;
for (const key of ['dosen', 'asisten', 'mahasiswa'] as const) {
  const value = structureGroups?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `structure.groups.${key} is a non-empty string`);
}
assert(Boolean(structure.roles?.positionIntro?.trim()), 'structure.roles.positionIntro is a non-empty string');

for (const key of ['chart', 'join'] as const) {
  const value = structure.navDots?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `structure.navDots.${key} is a non-empty string`);
}
assert(Boolean(structure.sectionLabel?.trim()), 'structure.sectionLabel is a non-empty string');
assert(Boolean(structure.meta?.title?.trim()), 'structure.meta.title is a non-empty string');
assert(Boolean(structure.meta?.description?.trim()), 'structure.meta.description is a non-empty string');

// The copy still carries its placeholders, so editors cannot drop the counts.
assert(Boolean(structureHero?.meta?.includes('{members}')), 'structure.hero.meta keeps {members}');
assert(Boolean(structureChart?.positionCount?.includes('{n}')), 'structure.chart.positionCount keeps {n}');
assert(
  Boolean(structureChart?.memberAssistantNote?.includes('{n}') && structureChart?.memberAssistantNote?.includes('{total}')),
  'structure.chart.memberAssistantNote keeps {n} and {total}'
);
assert(Boolean(structure.roles?.positionIntro?.includes('{n}')), 'structure.roles.positionIntro keeps {n}');

console.log('\n7️⃣ Testing pages/courses.json:');
const coursesPagePath = join(dataDir, 'pages/courses.json');
const coursesPageExists = existsSync(coursesPagePath);
assert(coursesPageExists, 'pages/courses.json exists');
const coursesPage = (coursesPageExists ? JSON.parse(readFileSync(coursesPagePath, 'utf8')) : {}) as Partial<CoursesPageData>;

for (const key of ['hero', 'list'] as const) {
  const section = coursesPage[key];
  assert(Boolean(section) && typeof section === 'object', `courses.${key} exists`);
}
assert(typeof coursesPage.list?.enabled === 'boolean', 'courses.list.enabled is a boolean');
assert(Boolean(coursesPage.hero) && !('enabled' in (coursesPage.hero as object)), 'courses.hero has no enabled toggle');

const coursesHero = coursesPage.hero;
for (const key of ['eyebrow', 'description', 'primaryLabel', 'secondaryLabel'] as const) {
  const value = coursesHero?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `courses.hero.${key} is a non-empty string`);
}
assert(
  Array.isArray(coursesHero?.lines) && coursesHero.lines.length >= 1 && coursesHero.lines.length <= 3,
  'courses.hero.lines has 1 to 3 lines'
);

const coursesList = coursesPage.list;
for (const key of ['eyebrow', 'title', 'intro', 'empty'] as const) {
  const value = coursesList?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `courses.list.${key} is a non-empty string`);
}

for (const key of ['list'] as const) {
  const value = coursesPage.navDots?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `courses.navDots.${key} is a non-empty string`);
}
assert(Boolean(coursesPage.sectionLabel?.trim()), 'courses.sectionLabel is a non-empty string');
assert(Boolean(coursesPage.meta?.title?.trim()), 'courses.meta.title is a non-empty string');
assert(Boolean(coursesPage.meta?.description?.trim()), 'courses.meta.description is a non-empty string');

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
