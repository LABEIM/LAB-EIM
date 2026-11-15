import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildBackgroundEmbed, buildPlayerEmbed, planRevealVideo, resolveExternalImageUrl, resolveVideoUrl } from '../utils/media';
import { sectionNumber, sectionOn, splitWordCount } from '../utils/page-content';
import type { RecruitmentConfig } from '../utils/types';
import type { AboutData, ChromeData, ContactData, CourseDetailPageData, CoursesPageData, EventDetailPageData, EventsPageData, GalleryData, HomePageData, Lecturer, Member, NewsDetailPageData, NewsPageData, StructurePageData } from '../utils/types';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const dataDir = join(root, 'src/data');
const publicDir = join(root, 'public');

// Resolve a public URL to a file inside public/, or '' when the path escapes it.
function publicFile(value: unknown): string {
  if (typeof value !== 'string') return '';
  const file = resolve(publicDir, value.replace(/^\//, ''));
  return file.startsWith(publicDir + sep) ? file : '';
}

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

function collectFiles(dir: string, extensions: string[]): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return collectFiles(path, extensions);
    return extensions.some((ext) => entry.name.endsWith(ext)) ? [path] : [];
  });
}

function collectEntries(value: unknown, path = ''): { path: string; value: string }[] {
  if (typeof value === 'string') return [{ path, value }];
  if (Array.isArray(value)) return value.flatMap((item, index) => collectEntries(item, `${path}[${index}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => collectEntries(item, path ? `${path}.${key}` : key));
  }
  return [];
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function normaliseHtml(html: string): string {
  const withAttributes = decodeEntities(html).replace(/\s+/g, ' ');
  const textOnly = decodeEntities(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ');
  return `${withAttributes}\n${textOnly}`;
}

function skipReason(value: string): string | null {
  if (/^\{\w+\}$/.test(value)) return 'placeholder only';
  if (/^(?:https?:)?\/\//.test(value) || /^\/\S*$/.test(value)) return 'URL or path';
  if (/^fa[srlb]? fa-/.test(value)) return 'icon class';
  if (!/[A-Za-z]/.test(value)) return 'no letters';
  return null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Treat {placeholder} tokens as wildcards so interpolated copy still matches.
function containsText(haystack: string, needle: string): boolean {
  const pattern = needle
    .split(/(\{\w+\})/)
    .map((part) => (/^\{\w+\}$/.test(part) ? '[\\s\\S]+?' : escapeRegExp(part)))
    .join('');
  return new RegExp(pattern).test(haystack);
}

const chromeGroups: Record<Exclude<keyof ChromeData, 'ui'>, string[]> = {
  nav: ['home', 'about', 'structure', 'courses', 'event', 'news', 'register', 'contact', 'joinUs'],
  footer: ['description', 'quickLinks', 'contact', 'resources', 'assets', 'linkHub', 'rights', 'backToTop'],
  cta: ['title', 'description', 'contactLabel'],
  brand: ['logoHorizontal', 'logoIcon'],
  labels: ['upcoming', 'details', 'statsDosen', 'statsMembers', 'statsCourses', 'organizerFallback', 'sectionNav', 'coordinator', 'sks', 'practicumYes', 'practicumNo', 'featured', 'search', 'close', 'vision', 'mission', 'values'],
};

console.log('🧪 Running Page Content Guard Tests...\n');

console.log('0️⃣ Testing entity decoding:');
// &amp; decodes last so `&amp;lt;` becomes `&lt;`, never a second `<`.
assert(decodeEntities('&amp;lt;') === '&lt;', 'decodeEntities unescapes & once, not twice');
assert(decodeEntities('&amp;amp;') === '&amp;', 'decodeEntities keeps a double-encoded &amp;amp; at one level');

console.log('1️⃣ Testing chrome.json:');
const chromePath = join(dataDir, 'chrome.json');
const chromeExists = existsSync(chromePath);
assert(chromeExists, 'chrome.json exists');
const chromeRaw: unknown = chromeExists ? JSON.parse(readFileSync(chromePath, 'utf8')) : {};
const chrome = chromeRaw as Partial<Record<keyof ChromeData, Record<string, unknown>>>;
const chromeTyped = chromeRaw as Partial<ChromeData>;

for (const [group, keys] of Object.entries(chromeGroups)) {
  for (const key of keys) {
    const value = chrome[group as Exclude<keyof ChromeData, 'ui'>]?.[key];
    assert(typeof value === 'string' && value.trim().length > 0, `chrome.${group}.${key} is a non-empty string`);
  }
}

console.log('\n1️⃣b Testing chrome.ui:');
const ui = chromeTyped.ui;
const uiStrings: [string, unknown][] = [
  ['backToHome', ui?.backToHome],
  ['titleSuffix', ui?.titleSuffix],
  ['revealPlay', ui?.revealPlay],
  ['pagination.previous', ui?.pagination?.previous],
  ['pagination.previousAria', ui?.pagination?.previousAria],
  ['pagination.next', ui?.pagination?.next],
  ['pagination.nextAria', ui?.pagination?.nextAria],
  ['pagination.info', ui?.pagination?.info],
  ['filter.clearSearch', ui?.filter?.clearSearch],
  ['filter.resultsCount', ui?.filter?.resultsCount],
  ['filter.searchPlaceholder', ui?.filter?.searchPlaceholder],
  ['filter.sortLabel', ui?.filter?.sortLabel],
  ['filter.sortNewest', ui?.filter?.sortNewest],
  ['filter.sortOldest', ui?.filter?.sortOldest],
  ['filter.statusLabel', ui?.filter?.statusLabel],
  ['filter.allStatuses', ui?.filter?.allStatuses],
  ['filter.categoryLabel', ui?.filter?.categoryLabel],
  ['filter.allCategories', ui?.filter?.allCategories],
  ['filter.reset', ui?.filter?.reset],
  ['contentFilter.noResults', ui?.contentFilter?.noResults],
  ['contentFilter.resultsRange', ui?.contentFilter?.resultsRange],
  ['registration.optional', ui?.registration?.optional],
  ['registration.wordCount', ui?.registration?.wordCount],
  ['aria.mainNav', ui?.aria?.mainNav],
  ['aria.openMenu', ui?.aria?.openMenu],
  ['aria.closeMenu', ui?.aria?.closeMenu],
  ['aria.homeLink', ui?.aria?.homeLink],
  ['aria.mediaIntro', ui?.aria?.mediaIntro],
  ['aria.closeAnnouncement', ui?.aria?.closeAnnouncement],
  ['aria.closeModal', ui?.aria?.closeModal],
  ['aria.previousEvent', ui?.aria?.previousEvent],
  ['aria.nextEvent', ui?.aria?.nextEvent],
  ['aria.slideDot', ui?.aria?.slideDot],
  ['aria.zoomIn', ui?.aria?.zoomIn],
  ['aria.zoomOut', ui?.aria?.zoomOut],
  ['aria.zoomReset', ui?.aria?.zoomReset],
];
for (const [path, value] of uiStrings) {
  assert(typeof value === 'string' && value.trim().length > 0, `chrome.ui.${path} is a non-empty string`);
}
for (const [path, value, tokens] of [
  ['pagination.info', ui?.pagination?.info, ['{page}', '{total}']],
  ['filter.resultsCount', ui?.filter?.resultsCount, ['{n}']],
  ['contentFilter.noResults', ui?.contentFilter?.noResults, ['{item}']],
  ['contentFilter.resultsRange', ui?.contentFilter?.resultsRange, ['{from}', '{to}', '{total}', '{item}']],
  ['registration.wordCount', ui?.registration?.wordCount, ['{count}', '{min}']],
  ['aria.homeLink', ui?.aria?.homeLink, ['{name}']],
  ['aria.slideDot', ui?.aria?.slideDot, ['{n}']],
] as [string, string | undefined, string[]][]) {
  for (const token of tokens) {
    assert(Boolean(value?.includes(token)), `chrome.ui.${path} keeps ${token}`);
  }
}

console.log('\n2️⃣ Testing sectionOn:');
assert(sectionOn(undefined) === true, 'sectionOn(undefined) is true');
assert(sectionOn({}) === true, 'sectionOn({}) is true');
assert(sectionOn({ enabled: true }) === true, 'sectionOn({ enabled: true }) is true');
assert(sectionOn({ enabled: false }) === false, 'sectionOn({ enabled: false }) is false');

console.log('\n2️⃣b Testing sectionNumber:');
assert(sectionNumber([true], 0) === '01', 'sectionNumber numbers the first visible section 01');
assert(sectionNumber([true, true, true], 1) === '02', 'sectionNumber numbers the second section 02');
assert(sectionNumber([false, true, true], 1) === '01', 'sectionNumber keeps numbers contiguous after a hidden first section');
assert(sectionNumber([true, false, true], 2) === '02', 'sectionNumber keeps numbers contiguous after a hidden middle section');

console.log('\n2️⃣c Testing the word-count template:');
const wordCountBefore = splitWordCount('Jumlah kata: {min} minimal, {count} terisi', 30);
assert(
  wordCountBefore.prefix === 'Jumlah kata: 30 minimal, ' && wordCountBefore.suffix === ' terisi',
  '{min} before {count} fills both tokens'
);
const wordCountAfter = splitWordCount('{count} dari {min}', 30);
assert(wordCountAfter.prefix === '' && wordCountAfter.suffix === ' dari 30', '{min} after {count} still fills');
assert(
  splitWordCount('{count}', 30).prefix === '' && splitWordCount('{count}', 30).suffix === '',
  'a template without {min} is unchanged'
);

console.log('\n3️⃣ Testing chrome.brand files:');
for (const key of chromeGroups.brand) {
  const file = publicFile(chrome.brand?.[key]);
  assert(Boolean(file) && existsSync(file), `chrome.brand.${key} resolves under public/`);
}

console.log('\n3️⃣b Testing uploaded images resolve under public/:');
const siteData = JSON.parse(readFileSync(join(dataDir, 'site.json'), 'utf8')) as { favicon?: string };
assert(typeof siteData.favicon === 'string' && siteData.favicon.trim().length > 0, 'site.favicon is set');
assert(
  existsSync(publicFile(siteData.favicon)),
  'site.favicon resolves under public/'
);

const galleryData = JSON.parse(readFileSync(join(dataDir, 'gallery.json'), 'utf8')) as GalleryData;
const galleryImages = [galleryData.featured?.image, ...(galleryData.photos ?? []).map((photo) => photo.image)];
assert(galleryImages.length > 0, 'gallery.json has at least one image');
galleryImages.forEach((image, index) => {
  assert(typeof image === 'string' && image.trim().length > 0, `gallery image ${index} is a non-empty string`);
  assert(
    existsSync(publicFile(image)),
    `gallery image ${index} resolves under public/`
  );
});

console.log('\n3️⃣c Testing member and lecturer portraits:');
// Placeholder rows ("Nama Asisten" / "Nama Dosen") ship with an empty image and
// fall back to initials or the placeholder avatar, so only set paths must resolve.
const membersData = JSON.parse(readFileSync(join(dataDir, 'members.json'), 'utf8')) as { list: Member[] };
assert(Array.isArray(membersData.list) && membersData.list.length > 0, 'members.json has a non-empty list');
membersData.list.forEach((member, index) => {
  const label = `member ${index} (${member.name || member.id})`;
  assert(member.image == null || typeof member.image === 'string', `${label} image is a string when present`);
  if (member.image?.trim()) {
    assert(existsSync(publicFile(member.image)), `${label} image resolves under public/`);
  }
});

const lecturersData = JSON.parse(readFileSync(join(dataDir, 'lecturers.json'), 'utf8')) as { list: Lecturer[] };
assert(Array.isArray(lecturersData.list) && lecturersData.list.length > 0, 'lecturers.json has a non-empty list');
lecturersData.list.forEach((lecturer, index) => {
  const label = `lecturer ${index} (${lecturer.id})`;
  assert(lecturer.image == null || typeof lecturer.image === 'string', `${label} image is a string when present`);
  if (lecturer.image?.trim()) {
    assert(existsSync(publicFile(lecturer.image)), `${label} image resolves under public/`);
  }
});

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
for (const key of ['primaryLabel', 'secondaryLabel'] as const) {
  const value = home.hero?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `home.hero.${key} is a non-empty string`);
}
assert(
  typeof home.reveal?.pendingCta === 'string' && home.reveal.pendingCta.trim().length > 0,
  'home.reveal.pendingCta is a non-empty string'
);
assert(
  Array.isArray(home.hero?.lines) && home.hero.lines.length >= 1 && home.hero.lines.length <= 3,
  'home.hero.lines has 1 to 3 lines'
);

console.log('\n4️⃣b Testing home.reveal media:');
const reveal = home.reveal;
assert(
  reveal?.mediaKind === 'none' || reveal?.mediaKind === 'image' || reveal?.mediaKind === 'video',
  'home.reveal.mediaKind is none, image, or video'
);

// The pasted image link wins over the upload, and video comes from links only,
// so a file is only required when the matching URL is empty. The URL itself is
// checked further down.
type RevealMedia = Pick<HomePageData['reveal'], 'mediaKind' | 'mediaAlt' | 'image' | 'poster' | 'imageUrl' | 'backgroundUrl' | 'videoUrl'>;
function assertRevealMedia(value: RevealMedia | undefined) {
  if (value?.mediaKind === 'image' || value?.mediaKind === 'video') {
    assert(Boolean(value.mediaAlt?.trim()), `home.reveal.mediaAlt is set for ${value.mediaKind} media`);
  }
  if (value?.mediaKind === 'image' && !value.imageUrl?.trim()) {
    assert(typeof value.image === 'string' && value.image.trim().length > 0, 'home.reveal.image is a non-empty string');
    assert(existsSync(publicFile(value.image)), 'home.reveal.image resolves under public/');
  }
  if (value?.mediaKind === 'video') {
    assert(
      Boolean(value.backgroundUrl?.trim() || value.videoUrl?.trim()),
      'home.reveal has a video link when mediaKind is video'
    );
  }
  if (value?.poster) {
    assert(existsSync(publicFile(value.poster)), 'home.reveal.poster resolves under public/');
  }
}
assertRevealMedia(reveal);
// A page using only the pasted link must pass; this is the documented precedence.
assertRevealMedia({ mediaKind: 'image', mediaAlt: 'intro', imageUrl: 'https://cdn.example.com/intro.jpg' });
assertRevealMedia({ mediaKind: 'video', mediaAlt: 'intro', videoUrl: 'https://youtu.be/dQw4w9WgXcQ' });
assertRevealMedia({ mediaKind: 'video', mediaAlt: 'intro', backgroundUrl: 'https://youtu.be/dQw4w9WgXcQ' });

// A hand-edited home.json may drop mediaKind entirely; the component must still
// land on the placeholder state instead of an empty stage.
const revealComponent = readFileSync(join(root, 'src/components/home/EimReveal.astro'), 'utf8');
assert(
  revealComponent.includes("content.mediaKind ?? 'none'"),
  "EimReveal treats a missing mediaKind as 'none'"
);
assert(
  revealComponent.includes('allow="autoplay; encrypted-media; picture-in-picture; fullscreen"'),
  'EimReveal iframe allows fullscreen in its allow list'
);
assert(/\ballowfullscreen\b/.test(revealComponent), 'EimReveal iframe keeps allowfullscreen');
assert(
  revealComponent.includes('controls={videoPlan?.controls}'),
  'EimReveal native video takes its controls from the reveal plan'
);
assert(
  revealComponent.includes('{playerSrc && (') && revealComponent.includes('class="e-reveal-open"'),
  'EimReveal overlay and modal render only when the link provides a player'
);

// The two roles: `backgroundUrl` loops as the background, a provider `videoUrl`
// is the click-to-open player. These plans mirror the rendered matrix (controls,
// background iframe, overlay, modal).
const embedPlan = planRevealVideo('', 'https://youtu.be/dQw4w9WgXcQ');
assert(embedPlan.nativeSrc === null, 'youtube only: no native video');
assert(
  embedPlan.backgroundSrc?.includes('controls=0') === true,
  'youtube only: the link becomes the muted background embed'
);
assert(embedPlan.playerSrc !== null, 'youtube only: the overlay and modal accompany the background');

const directPlan = planRevealVideo('', 'https://cdn.example.com/intro.mp4');
assert(directPlan.nativeSrc === 'https://cdn.example.com/intro.mp4', 'direct mp4: the link is the native background');
assert(directPlan.controls === true && directPlan.playerSrc === null, 'direct mp4: inline player, no modal');

const driveOnlyPlan = planRevealVideo('', 'https://drive.google.com/file/d/1AbCdEfGhIjK/view');
assert(
  driveOnlyPlan.backgroundSrc !== null && driveOnlyPlan.backgroundSrc === driveOnlyPlan.playerSrc,
  'drive only: the preview serves as both background and modal player'
);

// Case 2: a direct background link plays natively while a provider link only
// opens the modal.
const linkBackgroundPlan = planRevealVideo('https://cdn.example.com/bg.mp4', 'https://youtu.be/dQw4w9WgXcQ');
assert(linkBackgroundPlan.nativeSrc === 'https://cdn.example.com/bg.mp4', 'link background: the backgroundUrl file is native');
assert(linkBackgroundPlan.controls === false, 'link background: controls drop while the player overlay exists');
assert(linkBackgroundPlan.backgroundSrc === null, 'link background: no iframe beside the native background');
assert(
  linkBackgroundPlan.playerSrc?.includes('/embed/dQw4w9WgXcQ') === true,
  'link background: the player comes from videoUrl'
);

// Case 3: a short provider loop as background and a different full video as
// the modal player.
const shortId = 'abcdefghijk';
const fullId = 'dQw4w9WgXcQ';
const loopPlan = planRevealVideo(`https://youtu.be/${shortId}`, `https://youtu.be/${fullId}`);
assert(loopPlan.nativeSrc === null, 'loop: no native video when both links are providers');
assert(
  loopPlan.backgroundSrc?.includes(`/embed/${shortId}`) === true && loopPlan.backgroundSrc?.includes('controls=0') === true,
  'loop: the short video is the muted background embed'
);
assert(
  loopPlan.playerSrc?.includes(`/embed/${fullId}`) === true,
  'loop: the modal player uses the full video'
);
assert(loopPlan.backgroundSrc !== loopPlan.playerSrc, 'loop: background and player embeds differ');
assert(loopPlan.controls === false, 'loop: the background iframe needs no native controls');

// Precedence: backgroundUrl, then a direct videoUrl.
const linkWinsPlan = planRevealVideo('https://cdn.example.com/bg.mp4', 'https://cdn.example.com/player.mp4');
assert(linkWinsPlan.nativeSrc === 'https://cdn.example.com/bg.mp4', 'precedence: backgroundUrl wins over a direct videoUrl');
assert(linkWinsPlan.playerSrc === null, 'precedence: a direct videoUrl is not a modal player');
const backgroundProviderPlan = planRevealVideo('https://youtu.be/dQw4w9WgXcQ', 'https://cdn.example.com/player.mp4');
assert(
  backgroundProviderPlan.backgroundSrc !== null && backgroundProviderPlan.playerSrc === null,
  'precedence: a provider backgroundUrl needs no player link'
);
assert(backgroundProviderPlan.controls === true, 'precedence: no player means controls stay available');

// Embeds autoplay muted in the stage and open a sound-on player in a modal;
// a file with no link keeps its inline native player and no modal.
const youtubeMedia = resolveVideoUrl('https://youtu.be/dQw4w9WgXcQ');
const vimeoMedia = resolveVideoUrl('https://vimeo.com/76979871');
const driveMedia = resolveVideoUrl('https://drive.google.com/file/d/1AbCdEfGhIjK/view');
if (youtubeMedia?.kind !== 'iframe' || vimeoMedia?.kind !== 'iframe' || driveMedia?.kind !== 'iframe') {
  throw new Error('expected iframe media for the intro embed tests');
}

const youtubeBackground = buildBackgroundEmbed(youtubeMedia);
for (const fragment of ['autoplay=1', 'mute=1', 'loop=1', 'playlist=dQw4w9WgXcQ', 'controls=0']) {
  assert(youtubeBackground.includes(fragment), `youtube background embed keeps ${fragment}`);
}
const youtubePlayer = buildPlayerEmbed(youtubeMedia);
assert(youtubePlayer.includes('autoplay=1'), 'youtube player embed autoplays on the click');
assert(!youtubePlayer.includes('mute=1'), 'youtube player embed keeps sound on');
assert(!youtubePlayer.includes('controls=0'), 'youtube player embed keeps its controls');
assert(!youtubePlayer.includes('loop=1'), 'youtube player embed does not loop');

assert(buildBackgroundEmbed(vimeoMedia).includes('background=1'), 'vimeo background embed uses background=1');
assert(!buildPlayerEmbed(vimeoMedia).includes('background=1'), 'vimeo player embed is not a background player');

assert(buildBackgroundEmbed(driveMedia) === driveMedia.src, 'drive background keeps its preview URL');
assert(buildPlayerEmbed(driveMedia) === driveMedia.src, 'drive player keeps its preview URL');

const stageMarkup = revealComponent.slice(0, revealComponent.indexOf('class="e-reveal-modal"'));
assert(stageMarkup.includes('src={backgroundSrc}'), 'EimReveal stage iframe uses the background embed');
assert(
  stageMarkup.includes('class="e-reveal-stage-media e-reveal-embed"'),
  'EimReveal stage iframe carries the pointer-events class'
);
assert(
  /<button\b[^>]*\bclass="e-reveal-open"[^>]*\baria-label=(?:"[^"]+"|\{[^}]+\})/.test(stageMarkup),
  'EimReveal overlay control is a button with a non-empty aria-label'
);
assert(
  stageMarkup.includes('class="e-reveal-open-pill"') &&
    stageMarkup.includes('class="e-reveal-open-label">{chrome.ui.revealPlay}</span>') &&
    !stageMarkup.includes('Putar intro'),
  'EimReveal play pill shows the label from the CMS value, not a literal'
);
assert(
  /<span class="e-reveal-open-glyph" aria-hidden="true">/.test(stageMarkup),
  'EimReveal play glyph is hidden from assistive tech'
);
assert(
  revealComponent.includes("matchMedia('(pointer: fine)')") &&
    revealComponent.includes('prefers-reduced-motion') &&
    revealComponent.includes("addEventListener('pointerleave', park)") &&
    revealComponent.includes("matches(':focus-visible')"),
  'EimReveal pill trails the pointer only on fine pointers, parks on leave, and yields to keyboard focus'
);

const modalMarkup = revealComponent.slice(
  revealComponent.indexOf('id="e-reveal-modal"'),
  revealComponent.indexOf('<script>')
);
for (const fragment of [
  'role="dialog"',
  'aria-modal="true"',
  'aria-labelledby="e-reveal-modal-title"',
  'data-player-src={playerSrc}',
]) {
  assert(modalMarkup.includes(fragment), `EimReveal modal keeps ${fragment}`);
}
assert(!modalMarkup.includes('<iframe'), 'EimReveal modal emits no iframe in the server HTML (built on open)');

const modalScript = revealComponent.slice(
  revealComponent.indexOf("document.getElementById('e-reveal-modal')")
);
for (const fragment of [
  "document.createElement('iframe')",
  'iframe.src = playerSrc',
  'playerHost.replaceChildren(iframe)',
  'playerHost.replaceChildren()',
]) {
  assert(modalScript.includes(fragment), `EimReveal modal script includes ${fragment}`);
}

// Pasted links feed the modal (and stand in for a missing file), so a broken
// link must not slip into a built src.
if (reveal?.videoUrl) {
  assert(resolveVideoUrl(reveal.videoUrl) !== null, 'home.reveal.videoUrl resolves to a supported provider or video file');
}
if (reveal?.backgroundUrl) {
  assert(
    resolveVideoUrl(reveal.backgroundUrl) !== null,
    'home.reveal.backgroundUrl resolves to a supported provider or video file'
  );
}
if (reveal?.imageUrl) {
  assert(resolveExternalImageUrl(reveal.imageUrl) !== null, 'home.reveal.imageUrl resolves to an https image');
}

console.log('\n4️⃣c Testing external media URL resolution:');
const youtubeEmbedSrc = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}`;
const youtubeCases: [string, string][] = [
  ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', youtubeEmbedSrc('dQw4w9WgXcQ')],
  ['https://youtube.com/watch?v=dQw4w9WgXcQ&t=10', youtubeEmbedSrc('dQw4w9WgXcQ')],
  ['https://m.youtube.com/watch?v=dQw4w9WgXcQ', youtubeEmbedSrc('dQw4w9WgXcQ')],
  ['https://youtu.be/dQw4w9WgXcQ', youtubeEmbedSrc('dQw4w9WgXcQ')],
  ['https://www.youtube.com/shorts/dQw4w9WgXcQ', youtubeEmbedSrc('dQw4w9WgXcQ')],
  ['https://www.youtube.com/embed/dQw4w9WgXcQ', youtubeEmbedSrc('dQw4w9WgXcQ')],
];
for (const [input, expected] of youtubeCases) {
  const resolved = resolveVideoUrl(input);
  assert(
    resolved?.kind === 'iframe' && resolved.provider === 'youtube' && resolved.src === expected,
    `youtube URL resolves: ${input}`
  );
  assert(
    resolved?.kind === 'iframe' && resolved.id === 'dQw4w9WgXcQ',
    `youtube URL resolves the video id: ${input}`
  );
}

// Autoplay needs mute, and loop needs playlist to repeat the same video. The
// default player keeps play/pause, seek, mute and fullscreen, so controls stay on.
const youtubeResolved = resolveVideoUrl('https://youtu.be/dQw4w9WgXcQ');
const youtubeSrc = youtubeResolved?.kind === 'iframe' ? youtubeResolved.src : '';
for (const fragment of ['autoplay=1', 'mute=1', 'loop=1', 'playlist=dQw4w9WgXcQ']) {
  assert(youtubeSrc.includes(fragment), `youtube embed keeps ${fragment}`);
}
assert(!youtubeSrc.includes('controls=0'), 'youtube embed keeps the default interactive controls');

const vimeoCases: [string, string][] = [
  ['https://vimeo.com/76979871', 'https://player.vimeo.com/video/76979871'],
  ['https://www.vimeo.com/76979871', 'https://player.vimeo.com/video/76979871'],
  ['https://player.vimeo.com/video/76979871', 'https://player.vimeo.com/video/76979871'],
];
for (const [input, expected] of vimeoCases) {
  const resolved = resolveVideoUrl(input);
  assert(
    resolved?.kind === 'iframe' && resolved.provider === 'vimeo' && resolved.src === expected,
    `vimeo URL resolves: ${input}`
  );
  assert(
    resolved?.kind === 'iframe' && resolved.id === '76979871',
    `vimeo URL resolves the video id: ${input}`
  );
}

const driveCases: [string, string][] = [
  ['https://drive.google.com/file/d/1AbCdEfGhIjK/view?usp=sharing', 'https://drive.google.com/file/d/1AbCdEfGhIjK/preview'],
  ['https://drive.google.com/file/d/1AbCdEfGhIjK/preview', 'https://drive.google.com/file/d/1AbCdEfGhIjK/preview'],
  ['https://drive.google.com/open?id=1AbCdEfGhIjK', 'https://drive.google.com/file/d/1AbCdEfGhIjK/preview'],
];
for (const [input, expected] of driveCases) {
  const resolved = resolveVideoUrl(input);
  assert(
    resolved?.kind === 'iframe' && resolved.provider === 'drive' && resolved.src === expected,
    `google drive URL resolves: ${input}`
  );
  assert(
    resolved?.kind === 'iframe' && resolved.id === '1AbCdEfGhIjK',
    `google drive URL resolves the file id: ${input}`
  );
}

for (const [input, expected] of [
  ['https://cdn.example.com/intro.mp4', 'https://cdn.example.com/intro.mp4'],
  ['https://cdn.example.com/intro.mp4?token=x', 'https://cdn.example.com/intro.mp4?token=x'],
  ['https://cdn.example.com/intro.WEBM', 'https://cdn.example.com/intro.WEBM'],
  ['https://cdn.example.com/intro.ogv', 'https://cdn.example.com/intro.ogv'],
  ['/assets/media/intro.mp4', '/assets/media/intro.mp4'],
  ['  /assets/media/intro.webm  ', '/assets/media/intro.webm'],
] as [string, string][]) {
  const resolved = resolveVideoUrl(input);
  assert(resolved?.kind === 'video' && resolved.src === expected, `direct video URL resolves: ${input}`);
}

for (const input of [
  'http://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'javascript:alert(1)',
  'data:video/mp4;base64,AAAA',
  '//www.youtube.com/watch?v=dQw4w9WgXcQ',
  '//cdn.example.com/intro.mp4',
  '/\\cdn.example.com/intro.mp4',
  '/assets/media/intro.txt',
  '/assets/media/../secret.mp4',
  'https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ',
  'https://www.youtube.com/watch?v=abc',
  'https://vimeo.com/not-a-number',
  'https://vimeo.com.evil.test/76979871',
  'https://drive.google.com.evil.test/file/d/1AbCdEfGhIjK/view',
  'https://example.com/page',
  'not a url',
  '',
] as string[]) {
  assert(resolveVideoUrl(input) === null, `unsupported video URL rejected: ${input || '(empty)'}`);
}
assert(resolveVideoUrl(undefined) === null && resolveVideoUrl(null) === null, 'missing video URL resolves to null');
assert(resolveVideoUrl('https://127.0.0.1/v.mp4') === null, 'IPv4 literal video URL rejected');
assert(resolveVideoUrl('https://[::1]/v.mp4') === null, 'IPv6 literal video URL rejected');
assert(
  resolveVideoUrl('https://CDN.Example.com/intro.mp4')?.src === 'https://cdn.example.com/intro.mp4',
  'direct video URL emits the parsed URL'
);

for (const input of [
  'https://cdn.example.com/photo.jpg',
  'https://cdn.example.com/photo.PNG?w=1200',
  'https://cdn.example.com/page',
] as string[]) {
  assert(resolveExternalImageUrl(input) === input, `external image URL accepted unchanged: ${input}`);
}

for (const input of [
  'http://cdn.example.com/photo.jpg',
  'javascript:alert(1)',
  'data:image/svg+xml;base64,AAAA',
  '//cdn.example.com/photo.jpg',
  'https://cdn.example.com/tracker.js',
  'https://cdn.example.com/page.html',
  'https://cdn.example.com/icon.svg',
  'https://cdn.example.com/doc.pdf',
  'https://cdn.example.com/bundle.zip',
  '',
] as string[]) {
  assert(resolveExternalImageUrl(input) === null, `unsupported image URL rejected: ${input || '(empty)'}`);
}
assert(resolveExternalImageUrl(undefined) === null && resolveExternalImageUrl(null) === null, 'missing image URL resolves to null');
assert(resolveExternalImageUrl('https://192.168.1.10/a.png') === null, 'IPv4 literal image URL rejected');
assert(resolveExternalImageUrl('https://[::1]/a.png') === null, 'IPv6 literal image URL rejected');
assert(
  resolveExternalImageUrl('https://CDN.Example.com/a.png') === 'https://cdn.example.com/a.png',
  'external image URL emits the parsed URL'
);
for (const [input, expected] of [
  ['https://cdn.example.com/a".png', 'https://cdn.example.com/a%22.png'],
  ['https://cdn.example.com/a\r\nb.png', 'https://cdn.example.com/ab.png'],
] as [string, string][]) {
  let resolved: string | null = null;
  let threw = false;
  try {
    resolved = resolveExternalImageUrl(input);
  } catch {
    threw = true;
  }
  assert(!threw && resolved === expected, `image URL with quotes or line breaks is handled: ${JSON.stringify(input)}`);
}

console.log('\n5️⃣ Testing about.json:');
const aboutPath = join(dataDir, 'about.json');
const aboutExists = existsSync(aboutPath);
assert(aboutExists, 'about.json exists');
const about = (aboutExists ? JSON.parse(readFileSync(aboutPath, 'utf8')) : {}) as Partial<AboutData>;

for (const key of [
  'description',
  'overviewTitle',
  'overviewContent1',
  'overviewContent2',
  'vision',
] as const) {
  const value = about[key];
  assert(typeof value === 'string' && value.trim().length > 0, `about.${key} is a non-empty string`);
}
assert(Array.isArray(about.missions) && about.missions.length > 0, 'about.missions is a non-empty array');
assert(Array.isArray(about.values) && about.values.length > 0, 'about.values is a non-empty array');
assert(!Object.prototype.hasOwnProperty.call(about, 'title'), 'about carries no dead title field');

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
for (const key of ['eyebrow', 'title', 'intro', 'emptyTitle', 'empty'] as const) {
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
  'item',
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
  'item',
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
assert(
  typeof contactPage.meta?.description === 'string' &&
    contactPage.meta.description.includes('{location}') &&
    contactPage.meta.description.includes('{university}'),
  'contact.meta.description exists and keeps {location} and {university}'
);

// Card copy, maps, and the PIC list keep their legacy top-level homes.
for (const key of [
  'title',
  'heroDescription',
  'locationTitle',
  'mapsEmbedUrl',
  'emailTitle',
  'hoursTitle',
  'hoursText',
  'hoursSubtext',
] as const) {
  const value = contactPage[key];
  assert(typeof value === 'string' && value.trim().length > 0, `contact.${key} is a non-empty string`);
}
assert(
  /^https:\/\/((www\.)?google\.com|maps\.google\.com)\/maps\/embed(\?|\/v1\/)/.test(contactPage.mapsEmbedUrl ?? ''),
  `contact.mapsEmbedUrl is a Google Maps embed URL (https://www.google.com/maps/embed?… or /maps/embed/v1/…) — got "${contactPage.mapsEmbedUrl ?? ''}"`
);
assert(Array.isArray(contactPage.contactPersons), 'contact.contactPersons is an array');

console.log('\n1️⃣4️⃣ Testing registration.json labels:');
const registrationPath = join(dataDir, 'registration.json');
const registrationExists = existsSync(registrationPath);
assert(registrationExists, 'registration.json exists');
const registration = (registrationExists ? JSON.parse(readFileSync(registrationPath, 'utf8')) : {}) as Partial<RecruitmentConfig>;

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
  'sendingTitle',
  'closeError',
  'done',
  'saveDraft',
  'draftSaved',
  'draftRestored',
  'clearDraft',
  'legendPersonal',
  'legendDivision',
  'timerDays',
  'timerHours',
  'timerMinutes',
  'timerSeconds',
  'resultsPlaceholder',
] as const) {
  const value = registration.labels?.[key];
  assert(typeof value === 'string' && value.trim().length > 0, `registration.labels.${key} is a non-empty string`);
}
assert(
  Boolean(registration.labels?.draftRestored?.includes('{time}')),
  'registration.labels.draftRestored keeps {time}'
);

for (const key of ['heroTag', 'heroTitle', 'heroPeriod', 'heroPrimaryLabel', 'heroSecondaryLabel'] as const) {
  const value = (registration as Record<string, unknown>)[key];
  assert(typeof value === 'string' && value.trim().length > 0, `registration.${key} is a non-empty string`);
}
assert(
  String((registration as Record<string, unknown>).heroPeriod).includes('{start}') &&
    String((registration as Record<string, unknown>).heroPeriod).includes('{end}'),
  'registration.heroPeriod keeps {start} and {end}'
);

console.log('\n1️⃣5️⃣ Testing the dictionary is gone:');
const sourceFiles = collectFiles(join(root, 'src'), ['.ts', '.tsx', '.astro']);
const dictionaryCall = /\bt\(\s*['"]/;
const dictionaryOffenders = sourceFiles.filter((file) => dictionaryCall.test(readFileSync(file, 'utf8')));
assert(
  dictionaryOffenders.length === 0,
  `no legacy t() call sites remain under src/${
    dictionaryOffenders.length ? ` (${dictionaryOffenders.map((file) => file.slice(root.length + 1)).join(', ')})` : ''
  }`
);
const i18nSource = readFileSync(join(root, 'src/utils/i18n.ts'), 'utf8');
assert(!/export\s+const\s+uiTranslations/.test(i18nSource), 'i18n.ts no longer exports uiTranslations');

console.log('\n1️⃣6️⃣ Testing page copy renders in the built HTML (needs `pnpm run build` first):');
const clientDir = join(root, 'dist/client');
const htmlIndexFiles = (dir: string): string[] => {
  const base = join(clientDir, dir);
  return existsSync(base)
    ? readdirSync(base, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => join(base, entry.name, 'index.html'))
        .filter(existsSync)
    : [];
};
const allHtml = existsSync(clientDir) ? collectFiles(clientDir, ['.html']).filter((file) => file.endsWith('index.html')) : [];

const renderTargets: [string, string[]][] = [
  ['chrome.json', allHtml],
  ['about.json', [join(clientDir, 'about/index.html')]],
  ['contact.json', [join(clientDir, 'contact/index.html')]],
  ['registration.json', [join(clientDir, 'registration/index.html')]],
  ['pages/home.json', [join(clientDir, 'index.html')]],
  ['pages/structure.json', [join(clientDir, 'structure/index.html')]],
  ['pages/courses.json', [join(clientDir, 'courses/index.html')]],
  ['pages/news.json', [join(clientDir, 'news/index.html')]],
  ['pages/events.json', [join(clientDir, 'event/index.html')]],
  ['pages/course-detail.json', htmlIndexFiles('courses')],
  ['pages/news-detail.json', htmlIndexFiles('news')],
  ['pages/event-detail.json', htmlIndexFiles('event')],
];

// Copy that only renders in a state the sample content does not reach: empty lists,
// collapsed gallery controls, disabled upload fields, or candidate-specific messages.
const stateDependent: Record<string, RegExp[]> = {
  'about.json': [/^sections\.gallery\.(showAll|hideAll)$/],
  'contact.json': [/^details\.pics(Title|Subtitle)$/],
  'registration.json': [
    /^labels\.ksm$/,
    /^contactPersons\[\d+\]\.role$/,
    /^announcementConfig\.(accepted|rejected)Message$/,
    /^selectionSteps\[\d+\]\.resultsConfig\.(passed|failed)Message$/,
  ],
  'pages/home.json': [/^events\.empty$/, /^news\.empty$/, /^reveal\.(pending|pendingCta)$/],
  'pages/structure.json': [/^chart\.emptyPosition$/],
  'pages/courses.json': [/^list\.(emptyTitle|empty)$/],
  'pages/news.json': [/^list\.(emptyTitle|emptyDesc|contactLabel)$/, /^hero\.metaEmpty$/],
  'pages/events.json': [/^list\.(emptyTitle|emptyDesc|contactLabel)$/, /^hero\.metaEmpty$/],
  'pages/event-detail.json': [/^gallery\.empty$/],
  'chrome.json': [
    /^labels\.(featured|upcoming)$/,
    // Rendered only on a list page that has content, or on a modal/banner state.
    /^ui\.pagination\.(previous|previousAria|next|nextAria)$/,
    /^ui\.filter\./,
    /^ui\.contentFilter\./,
    /^ui\.aria\.(closeAnnouncement|previousEvent|closeModal|nextEvent|slideDot|zoomIn|zoomOut|zoomReset)$/,
  ],
};

if (!existsSync(clientDir)) {
  console.log('  ⚠️ SKIPPED: dist/client is missing. Run `PUBLIC_SHOW_AUDIT_CONTENT=true pnpm run build` first to enable this guard.');
} else {
  // Production builds hide the audit sample content, so list pages only render their
  // empty state; skip the copy that belongs to the other branch of that same page.
  const contentBranch: Record<string, { marker: string; content: RegExp }> = {
    'pages/news.json': {
      marker: 'id="news-list-grid"',
      content: /^(list\.(eyebrow|title|intro|searchPlaceholder|noMatchTitle|noMatchDesc)|hero\.meta)$/,
    },
    'pages/events.json': {
      marker: 'id="kegiatan-list-grid"',
      content: /^(list\.(eyebrow|title|intro|searchPlaceholder|noMatchTitle|noMatchDesc)|hero\.meta)$/,
    },
    'pages/news-detail.json': {
      marker: 'id="article-related-title"',
      content: /^related\./,
    },
    'pages/event-detail.json': {
      marker: 'id="kegiatan-related-title"',
      content: /^related\./,
    },
  };

  for (const [file, htmlFiles] of renderTargets) {
    const data = JSON.parse(readFileSync(join(dataDir, file), 'utf8')) as unknown;
    const haystack = htmlFiles.map((html) => normaliseHtml(readFileSync(html, 'utf8'))).join('\n');
    assert(htmlFiles.length > 0, `${file} has built HTML to compare against`);
    const entries = collectEntries(data).filter(({ value }) => value.trim().length >= 12);
    const branch = contentBranch[file];
    const emptyBranch = Boolean(branch) && !haystack.includes(branch.marker);
    let checked = 0;
    const skipped: string[] = [];
    for (const { path, value } of entries) {
      if (skipReason(value.trim())) continue;
      if (stateDependent[file]?.some((pattern) => pattern.test(path))) {
        skipped.push(path);
        continue;
      }
      if (emptyBranch && branch.content.test(path)) {
        skipped.push(path);
        continue;
      }
      if (containsText(haystack, value.trim())) {
        checked++;
        continue;
      }
      assert(false, `${file} string renders in built HTML: ${path} "${value.trim()}"`);
    }
    assert(checked > 0, `${file} has at least one rendered string checked`);
    // Ignore inline scripts, styles and data-* attributes: regex literals such as
    // \d{2} and client-side templates such as {item} are not unresolved copy.
    const visibleHaystack = htmlFiles
      .map((html) =>
        normaliseHtml(
          readFileSync(html, 'utf8')
            .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
            .replace(/\sdata-[\w-]+="[^"]*"/gi, ' ')
        )
      )
      .join('\n');
    assert(!/\{\w+\}/.test(visibleHaystack), `${file} built HTML has no unresolved {placeholder}`);
    console.log(`  ✅ ${file}: ${checked} strings rendered${skipped.length ? `, ${skipped.length} state-dependent skipped` : ''}`);
    if (skipped.length > 0) {
      console.log(`  ⏭️  ${file}: skipped state-dependent copy at ${skipped.join(', ')}`);
    }
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
