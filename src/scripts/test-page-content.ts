import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sectionOn } from '../utils/page-content';
import type { ChromeData, HomePageData } from '../utils/types';

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
  labels: ['upcoming', 'details', 'learnMore', 'statsDosen', 'statsMembers', 'statsCourses', 'organizerFallback', 'coordinator', 'sks', 'practicumYes', 'practicumNo', 'featured', 'search', 'close'],
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

assert(Boolean(home.meta?.title?.trim()), 'home.meta.title is a non-empty string');
assert(
  Array.isArray(home.hero?.lines) && home.hero.lines.length >= 1 && home.hero.lines.length <= 3,
  'home.hero.lines has 1 to 3 lines'
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
