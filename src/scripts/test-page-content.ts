import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sectionOn } from '../utils/page-content';
import type { AboutData, ChromeData, ContactData, CourseDetailPageData, CoursesPageData, EventDetailPageData, EventsPageData, HomePageData, NewsDetailPageData, NewsPageData, StructurePageData } from '../utils/types';

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
  labels: ['upcoming', 'details', 'learnMore', 'statsDosen', 'statsMembers', 'statsCourses', 'organizerFallback', 'sectionNav', 'coordinator', 'sks', 'practicumYes', 'practicumNo', 'featured', 'search', 'close', 'vision', 'mission', 'values'],
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

for (const key of ['reveal', 'focus', 'vision', 'courses', 'events', 'articles'] as const) {
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
assert(Boolean(structure.meta?.title?.trim()), 'structure.meta.title is a non-empty string');
assert(Boolean(structure.meta?.description?.trim()), 'structure.meta.description is a non-empty string');

// The copy still carries its placeholders, so editors cannot drop the counts.
for (const token of ['{members}', '{dosen}', '{positions}'] as const) {
  assert(Boolean(structureHero?.meta?.includes(token)), `structure.hero.meta keeps ${token}`);
}
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
assert(
  typeof coursesHero?.summary === 'string' && coursesHero.summary.trim().length > 0,
  'courses.hero.summary is a non-empty string'
);
assert(
  Boolean(coursesHero?.summary?.includes('{n}') && coursesHero?.summary?.includes('{p}')),
  'courses.hero.summary keeps {n} and {p}'
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
assert(Boolean(coursesPage.meta?.title?.trim()), 'courses.meta.title is a non-empty string');
assert(Boolean(coursesPage.meta?.description?.trim()), 'courses.meta.description is a non-empty string');

console.log('\n8️⃣ Testing pages/course-detail.json:');
const courseDetailPath = join(dataDir, 'pages/course-detail.json');
const courseDetailExists = existsSync(courseDetailPath);
assert(courseDetailExists, 'pages/course-detail.json exists');
const courseDetail = (courseDetailExists ? JSON.parse(readFileSync(courseDetailPath, 'utf8')) : {}) as Partial<CourseDetailPageData>;

// The header carries the course title, so it stays course data and has no section here.
for (const key of ['meta', 'description', 'modules', 'assistants', 'backLink'] as const) {
  const section = courseDetail[key];
  assert(Boolean(section) && typeof section === 'object', `courseDetail.${key} exists`);
}

for (const key of ['description', 'modules', 'assistants', 'backLink'] as const) {
  assert(typeof courseDetail[key]?.enabled === 'boolean', `courseDetail.${key}.enabled is a boolean`);
}

assert(Boolean(courseDetail.meta?.title?.trim()), 'courseDetail.meta.title is a non-empty string');
assert(Boolean(courseDetail.meta?.description?.trim()), 'courseDetail.meta.description is a non-empty string');

for (const key of ['modules', 'assistants'] as const) {
  const value = courseDetail[key]?.heading;
  assert(typeof value === 'string' && value.trim().length > 0, `courseDetail.${key}.heading is a non-empty string`);
}
assert(
  typeof courseDetail.assistants?.note === 'string' && courseDetail.assistants.note.trim().length > 0,
  'courseDetail.assistants.note is a non-empty string'
);
assert(
  typeof courseDetail.backLink?.label === 'string' && courseDetail.backLink.label.trim().length > 0,
  'courseDetail.backLink.label is a non-empty string'
);

// The meta description carries the course title, so the placeholder must survive.
assert(
  Boolean(courseDetail.meta?.description?.includes('{title}')),
  'courseDetail.meta.description keeps {title}'
);

console.log('\n9️⃣ Testing pages/news.json:');
const newsPagePath = join(dataDir, 'pages/news.json');
const newsPageExists = existsSync(newsPagePath);
assert(newsPageExists, 'pages/news.json exists');
const newsPage = (newsPageExists ? JSON.parse(readFileSync(newsPagePath, 'utf8')) : {}) as Partial<NewsPageData>;

for (const key of ['hero', 'list'] as const) {
  const section = newsPage[key];
  assert(Boolean(section) && typeof section === 'object', `news.${key} exists`);
}
assert(typeof newsPage.list?.enabled === 'boolean', 'news.list.enabled is a boolean');
assert(Boolean(newsPage.hero) && !('enabled' in (newsPage.hero as object)), 'news.hero has no enabled toggle');

const newsHero = newsPage.hero;
for (const key of ['eyebrow', 'description', 'meta', 'metaEmpty', 'primaryLabel', 'secondaryLabel'] as const) {
  const value = newsHero?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `news.hero.${key} is a non-empty string`);
}
assert(
  Array.isArray(newsHero?.lines) && newsHero.lines.length >= 1 && newsHero.lines.length <= 3,
  'news.hero.lines has 1 to 3 lines'
);

const newsList = newsPage.list;
for (const key of [
  'eyebrow',
  'title',
  'intro',
  'emptyTitle',
  'emptyDesc',
  'noMatchTitle',
  'noMatchDesc',
  'searchPlaceholder',
  'contactLabel',
] as const) {
  const value = newsList?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `news.list.${key} is a non-empty string`);
}

for (const key of ['list'] as const) {
  const value = newsPage.navDots?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `news.navDots.${key} is a non-empty string`);
}
assert(Boolean(newsPage.meta?.title?.trim()), 'news.meta.title is a non-empty string');
assert(Boolean(newsPage.meta?.description?.trim()), 'news.meta.description is a non-empty string');

// The hero meta carries the counts, so the placeholders must survive.
for (const token of ['{articles}', '{categories}', '{year}'] as const) {
  assert(Boolean(newsHero?.meta?.includes(token)), `news.hero.meta keeps ${token}`);
}

console.log('\n🔟 Testing pages/news-detail.json:');
const newsDetailPath = join(dataDir, 'pages/news-detail.json');
const newsDetailExists = existsSync(newsDetailPath);
assert(newsDetailExists, 'pages/news-detail.json exists');
const newsDetail = (newsDetailExists ? JSON.parse(readFileSync(newsDetailPath, 'utf8')) : {}) as Partial<NewsDetailPageData>;

// The header carries the article title, so it stays collection data and has no section here.
for (const key of ['meta', 'hero', 'body', 'gallery', 'related', 'backLink', 'share'] as const) {
  const section = newsDetail[key];
  assert(Boolean(section) && typeof section === 'object', `newsDetail.${key} exists`);
}

assert(Boolean(newsDetail.hero) && !('enabled' in (newsDetail.hero as object)), 'newsDetail.hero has no enabled toggle');
assert(
  typeof newsDetail.hero?.backLabel === 'string' && newsDetail.hero.backLabel.trim().length > 0,
  'newsDetail.hero.backLabel is a non-empty string'
);

for (const key of ['body', 'gallery', 'related', 'backLink', 'share'] as const) {
  assert(typeof newsDetail[key]?.enabled === 'boolean', `newsDetail.${key}.enabled is a boolean`);
}

for (const key of ['author', 'topics'] as const) {
  const value = newsDetail[key];
  assert(typeof value === 'string' && value.trim().length > 0, `newsDetail.${key} is a non-empty string`);
}

assert(Boolean(newsDetail.meta?.title?.trim()), 'newsDetail.meta.title is a non-empty string');
assert(Boolean(newsDetail.meta?.description?.trim()), 'newsDetail.meta.description is a non-empty string');

const newsDetailGallery = newsDetail.gallery;
for (const key of ['eyebrow', 'title'] as const) {
  const value = newsDetailGallery?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `newsDetail.gallery.${key} is a non-empty string`);
}

const newsDetailRelated = newsDetail.related;
for (const key of ['eyebrow', 'title', 'intro'] as const) {
  const value = newsDetailRelated?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `newsDetail.related.${key} is a non-empty string`);
}

assert(
  typeof newsDetail.backLink?.label === 'string' && newsDetail.backLink.label.trim().length > 0,
  'newsDetail.backLink.label is a non-empty string'
);
assert(
  typeof newsDetail.share?.label === 'string' && newsDetail.share.label.trim().length > 0,
  'newsDetail.share.label is a non-empty string'
);

// The meta description stands in for a missing excerpt, so the placeholder must survive.
assert(
  Boolean(newsDetail.meta?.description?.includes('{title}')),
  'newsDetail.meta.description keeps {title}'
);

console.log('\n1️⃣1️⃣ Testing pages/events.json:');
const eventsPagePath = join(dataDir, 'pages/events.json');
const eventsPageExists = existsSync(eventsPagePath);
assert(eventsPageExists, 'pages/events.json exists');
const eventsPage = (eventsPageExists ? JSON.parse(readFileSync(eventsPagePath, 'utf8')) : {}) as Partial<EventsPageData>;

for (const key of ['hero', 'list'] as const) {
  const section = eventsPage[key];
  assert(Boolean(section) && typeof section === 'object', `events.${key} exists`);
}
assert(typeof eventsPage.list?.enabled === 'boolean', 'events.list.enabled is a boolean');
assert(Boolean(eventsPage.hero) && !('enabled' in (eventsPage.hero as object)), 'events.hero has no enabled toggle');

const eventsHero = eventsPage.hero;
for (const key of ['eyebrow', 'description', 'meta', 'metaEmpty', 'primaryLabel', 'secondaryLabel'] as const) {
  const value = eventsHero?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `events.hero.${key} is a non-empty string`);
}
assert(
  Array.isArray(eventsHero?.lines) && eventsHero.lines.length >= 1 && eventsHero.lines.length <= 3,
  'events.hero.lines has 1 to 3 lines'
);

const eventsList = eventsPage.list;
for (const key of [
  'eyebrow',
  'title',
  'intro',
  'emptyTitle',
  'emptyDesc',
  'noMatchTitle',
  'noMatchDesc',
  'searchPlaceholder',
  'contactLabel',
] as const) {
  const value = eventsList?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `events.list.${key} is a non-empty string`);
}

for (const key of ['list'] as const) {
  const value = eventsPage.navDots?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `events.navDots.${key} is a non-empty string`);
}
assert(Boolean(eventsPage.meta?.title?.trim()), 'events.meta.title is a non-empty string');
assert(Boolean(eventsPage.meta?.description?.trim()), 'events.meta.description is a non-empty string');

// The hero meta carries the counts, so the placeholders must survive.
for (const token of ['{events}', '{categories}', '{year}'] as const) {
  assert(Boolean(eventsHero?.meta?.includes(token)), `events.hero.meta keeps ${token}`);
}

console.log('\n1️⃣2️⃣ Testing pages/event-detail.json:');
const eventDetailPath = join(dataDir, 'pages/event-detail.json');
const eventDetailExists = existsSync(eventDetailPath);
assert(eventDetailExists, 'pages/event-detail.json exists');
const eventDetail = (eventDetailExists ? JSON.parse(readFileSync(eventDetailPath, 'utf8')) : {}) as Partial<EventDetailPageData>;

// The header carries the event title, standfirst, and dates, so they stay collection data and have no section here.
for (const key of ['meta', 'hero', 'story', 'gallery', 'related', 'backLink', 'share'] as const) {
  const section = eventDetail[key];
  assert(Boolean(section) && typeof section === 'object', `eventDetail.${key} exists`);
}

assert(Boolean(eventDetail.hero) && !('enabled' in (eventDetail.hero as object)), 'eventDetail.hero has no enabled toggle');
assert(
  typeof eventDetail.hero?.backLabel === 'string' && eventDetail.hero.backLabel.trim().length > 0,
  'eventDetail.hero.backLabel is a non-empty string'
);

for (const key of ['story', 'gallery', 'related', 'backLink', 'share'] as const) {
  assert(typeof eventDetail[key]?.enabled === 'boolean', `eventDetail.${key}.enabled is a boolean`);
}

assert(Boolean(eventDetail.meta?.title?.trim()), 'eventDetail.meta.title is a non-empty string');
assert(
  !Object.prototype.hasOwnProperty.call(eventDetail.meta ?? {}, 'description'),
  'eventDetail.meta carries no description (the event standfirst doubles as the meta description)'
);

const eventDetailGallery = eventDetail.gallery;
for (const key of ['eyebrow', 'title', 'empty'] as const) {
  const value = eventDetailGallery?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `eventDetail.gallery.${key} is a non-empty string`);
}

const eventDetailRelated = eventDetail.related;
for (const key of ['eyebrow', 'title', 'intro'] as const) {
  const value = eventDetailRelated?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `eventDetail.related.${key} is a non-empty string`);
}

assert(
  typeof eventDetail.backLink?.label === 'string' && eventDetail.backLink.label.trim().length > 0,
  'eventDetail.backLink.label is a non-empty string'
);
assert(
  typeof eventDetail.share?.label === 'string' && eventDetail.share.label.trim().length > 0,
  'eventDetail.share.label is a non-empty string'
);

console.log('\n1️⃣3️⃣ Testing contact.json:');
const contactPath = join(dataDir, 'contact.json');
const contactExists = existsSync(contactPath);
assert(contactExists, 'contact.json exists');
const contactPage = (contactExists ? JSON.parse(readFileSync(contactPath, 'utf8')) : {}) as Partial<ContactData>;

for (const key of ['meta', 'navDots', 'hero', 'details', 'map', 'socials'] as const) {
  const section = contactPage[key];
  assert(Boolean(section) && typeof section === 'object', `contact.${key} exists`);
}

for (const key of ['details', 'map', 'socials'] as const) {
  assert(typeof contactPage[key]?.enabled === 'boolean', `contact.${key}.enabled is a boolean`);
}
assert(Boolean(contactPage.hero) && !('enabled' in (contactPage.hero as object)), 'contact.hero has no enabled toggle');

const contactHero = contactPage.hero;
for (const key of ['eyebrow', 'primaryLabel', 'secondaryLabel'] as const) {
  const value = contactHero?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `contact.hero.${key} is a non-empty string`);
}

const contactDetails = contactPage.details;
for (const key of [
  'eyebrow',
  'title',
  'intro',
  'emailAction',
  'copyEmail',
  'copied',
  'copyFailed',
  'copySuccessStatus',
  'copyFailedStatus',
  'routingNote',
  'picsTitle',
  'picsSubtitle',
] as const) {
  const value = contactDetails?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `contact.details.${key} is a non-empty string`);
}

const contactMap = contactPage.map;
for (const key of ['title', 'subtitle', 'navDot'] as const) {
  const value = contactMap?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `contact.map.${key} is a non-empty string`);
}

const contactSocials = contactPage.socials;
for (const key of ['eyebrow', 'title', 'intro'] as const) {
  const value = contactSocials?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `contact.socials.${key} is a non-empty string`);
}

for (const key of ['detail', 'social'] as const) {
  const value = contactPage.navDots?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `contact.navDots.${key} is a non-empty string`);
}
assert(Boolean(contactPage.meta?.title?.trim()), 'contact.meta.title is a non-empty string');

// Card copy, maps, and the PIC list keep their legacy top-level homes.
for (const key of [
  'title',
  'heroDescription',
  'locationTitle',
  'location',
  'university',
  'mapsUrl',
  'mapsEmbedUrl',
  'emailTitle',
  'email',
  'hoursTitle',
  'hoursText',
  'hoursSubtext',
] as const) {
  const value = contactPage[key];
  assert(typeof value === 'string' && value.trim().length > 0, `contact.${key} is a non-empty string`);
}
assert(Array.isArray(contactPage.contactPersons), 'contact.contactPersons is an array');

console.log('\n1️⃣4️⃣ Testing registration.json labels:');
const registrationPath = join(dataDir, 'registration.json');
const registrationExists = existsSync(registrationPath);
assert(registrationExists, 'registration.json exists');
const registration = (registrationExists ? JSON.parse(readFileSync(registrationPath, 'utf8')) : {}) as {
  labels?: Record<string, unknown>;
};

for (const key of [
  'fullName',
  'fullNamePlaceholder',
  'nim',
  'nimPlaceholder',
  'email',
  'emailPlaceholder',
  'phone',
  'phonePlaceholder',
  'classYear',
  'selectClassYear',
  'div1',
  'selectDiv1',
  'div2',
  'selectDiv2',
  'reason',
  'reasonPlaceholder',
  'portfolioLink',
  'portfolioPlaceholder',
  'ksm',
  'khs',
  'ml',
  'cv',
  'pi',
  'downloadPiTemplate',
  'chooseFile',
  'noFile',
  'requirementsTitle',
  'dataUse',
  'submit',
  'submitting',
  'saveDraft',
  'draftSaved',
] as const) {
  const value = registration.labels?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `registration.labels.${key} is a non-empty string`);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
