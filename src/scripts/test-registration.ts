import {
  validateNim,
  validatePhone,
  validateEmail,
  countWords,
  validateSingleFile,
  validateRegistrationForm
} from './registration/validation';
import { calculateStageFromDates } from './registration/stage';
import { safeLink, internalHref } from '../utils/safe-link';
import { selectVisibleCards, type FilterCard, type FilterState, type FilterResult } from './content-filter';
import { resolveStageCta } from '../utils/constants';
import { parsePositions, buildPositionIndex, positionLabel, groupPeople, countPeopleByGroup, STRUCTURE_TREE, type Position } from '../utils/position-mapper';
import positionsData from '../data/positions.json';
import { resolveCourses, courseHasContent, summarizePracticumAssistants } from '../utils/course-helpers';

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

// Helper to mock HTMLInputElement for Node.js unit tests
function createMockFileInput(options: {
  required?: boolean;
  files?: Array<{ name: string; size: number }>;
  allowedExts?: string;
  maxMb?: number;
}): HTMLInputElement {
  const attrs: Record<string, string> = {};
  if (options.allowedExts !== undefined) {
    attrs['data-allowed-exts'] = options.allowedExts;
  }
  if (options.maxMb !== undefined) {
    attrs['data-max-mb'] = String(options.maxMb);
  }

  return {
    required: options.required ?? false,
    hasAttribute: (name: string) => (name === 'required' ? Boolean(options.required) : name in attrs),
    getAttribute: (name: string) => attrs[name] || null,
    files: options.files || null
  } as unknown as HTMLInputElement;
}

console.log('🧪 Running Registration Form Automated Unit Tests...\n');

// 1. NIM Validation Tests
console.log('1️⃣ Testing NIM Validation:');
assert(validateNim('1301210001') === true, '10-digit valid numeric NIM');
assert(validateNim('130121000112345') === true, '15-digit valid numeric NIM');
assert(validateNim('12345') === false, 'Short NIM (<9 digits) should fail');
assert(validateNim('abc12345678') === false, 'Alpha NIM should fail');

// 2. Phone Validation Tests
console.log('\n2️⃣ Testing Phone Number Validation:');
assert(validatePhone('081234567890') === true, 'Phone starting with 08 should pass');
assert(validatePhone('+6281234567890') === true, 'Phone starting with +628 should pass');
assert(validatePhone('0217654321') === false, 'Landline starting with 021 should fail');
assert(validatePhone('12345') === false, 'Short phone number should fail');

// 3. Email Validation Tests
console.log('\n3️⃣ Testing Email Validation:');
assert(validateEmail('student@telkomuniversity.ac.id') === true, 'Valid email format');
assert(validateEmail('invalid-email') === false, 'Email without @ should fail');

// 4. Word Count Tests
console.log('\n4️⃣ Testing Word Count Helper:');
assert(countWords('Halo nama saya asisten EIM lab') === 6, 'Should count 6 words accurately');
assert(countWords('   Multiple   spaces   between words   ') === 4, 'Should handle irregular spacing');
assert(countWords('') === 0, 'Empty string should return 0');

// 5. Portfolio & Certificate 4-Mode Keystatic CMS Tests
console.log('\n5️⃣ Testing Portfolio & Certificate Keystatic CMS Modes:');

const requiresPortfolioFn = (val: string) => ['medhum', 'media'].includes(val.trim().toLowerCase());
const thirtyWordsReason = 'Saya sangat berminat untuk mendaftar sebagai asisten di laboratorium ini karena saya ingin mengembangkan wawasan, ilmu pengetahuan, serta keterampilan praktis di bidang teknologi komputer, jaringan, dan riset secara mendalam bersama seluruh tim laboratorium EIM.';
const shortFiveWordsReason = 'Saya ingin daftar di sini.';

// Test 5.1 [Mode: required (Default)]: General division (Riset) with empty portfolio -> PASS (Optional for general)
const testRequiredModeGeneral = validateRegistrationForm(
  null,
  '1301210001',
  '081234567890',
  'Riset',
  'Cybersecurity',
  thirtyWordsReason,
  thirtyWordsReason,
  30,
  '', // Empty portfolio
  requiresPortfolioFn,
  []
);
assert(testRequiredModeGeneral.valid === true, '[Mode: required] General division with empty portfolio/certificate -> PASS (Optional)');

// Test 5.2 [Mode: required (Default)]: General division WITH certificate/portfolio URL -> PASS
const testRequiredModeGeneralWithCert = validateRegistrationForm(
  null,
  '1301210001',
  '081234567890',
  'Riset',
  'Cybersecurity',
  thirtyWordsReason,
  thirtyWordsReason,
  30,
  'https://drive.google.com/file/d/sample-certificate-link', // Provided certificate link
  requiresPortfolioFn,
  []
);
assert(testRequiredModeGeneralWithCert.valid === true, '[Mode: required] General division with Certificate URL -> PASS (Optional Accepted)');

// Test 5.3 [Mode: required (Default)]: Trigger division (Medhum) with empty portfolio -> FAIL (Required)
const testRequiredModeTriggerEmpty = validateRegistrationForm(
  null,
  '1301210001',
  '081234567890',
  'Medhum',
  'Cybersecurity',
  thirtyWordsReason,
  thirtyWordsReason,
  30,
  '', // Empty portfolio for Medhum
  requiresPortfolioFn,
  []
);
assert(testRequiredModeTriggerEmpty.valid === false, '[Mode: required] Trigger division (Medhum) with empty portfolio -> FAIL (Required)');

// Test 5.4 [Mode: required (Default)]: Trigger division (Medhum) WITH portfolio URL -> PASS
const testRequiredModeTriggerWithUrl = validateRegistrationForm(
  null,
  '1301210001',
  '081234567890',
  'Medhum',
  'Cybersecurity',
  thirtyWordsReason,
  thirtyWordsReason,
  30,
  'https://behance.net/sample-portfolio',
  requiresPortfolioFn,
  []
);
assert(testRequiredModeTriggerWithUrl.valid === true, '[Mode: required] Trigger division with Portfolio URL -> PASS');

// Test 5.5: Duplicate Division Selection -> FAIL
const testDuplicateDiv = validateRegistrationForm(
  null,
  '1301210001',
  '081234567890',
  'Riset',
  'Riset', // Duplicate
  thirtyWordsReason,
  thirtyWordsReason,
  30,
  '',
  requiresPortfolioFn,
  []
);
assert(testDuplicateDiv.valid === false, 'Duplicate division selection -> FAIL');

// 6. Document & Single File Upload Tests
console.log('\n6️⃣ Testing Document & Single File Upload Validation:');

const mockReqMissing = createMockFileInput({ required: true, files: [] });
assert(validateSingleFile(mockReqMissing, 'KTP', 5).valid === false, 'Required document missing -> FAIL');

const mockOptMissing = createMockFileInput({ required: false, files: [] });
assert(validateSingleFile(mockOptMissing, 'Sertifikat', 5).valid === true, 'Optional document missing -> PASS');

const mockEmptyFile = createMockFileInput({
  required: true,
  files: [{ name: 'ktp.pdf', size: 0 }]
});
assert(validateSingleFile(mockEmptyFile, 'KTP', 5).valid === false, 'Empty 0-byte file -> FAIL');

const mockOversizedFile = createMockFileInput({
  required: true,
  files: [{ name: 'transkrip.pdf', size: 6 * 1024 * 1024 }] // 6MB > 5MB
});
assert(validateSingleFile(mockOversizedFile, 'Transkrip', 5).valid === false, 'Single file exceeding max size (6MB > 5MB) -> FAIL');

const mockForbiddenExt = createMockFileInput({
  required: true,
  allowedExts: 'pdf, png, jpg, jpeg',
  files: [{ name: 'script.exe', size: 1024 * 1024 }]
});
assert(validateSingleFile(mockForbiddenExt, 'KTM', 5).valid === false, 'File with forbidden extension (.exe) -> FAIL');

const mockValidFile = createMockFileInput({
  required: true,
  allowedExts: 'pdf, png, jpg, jpeg',
  files: [{ name: 'ktm_official.pdf', size: 2 * 1024 * 1024 }]
});
assert(validateSingleFile(mockValidFile, 'KTM', 5).valid === true, 'Valid PDF file within size limit -> PASS');

// 7. Division 2 Reason Word Count Tests
console.log('\n7️⃣ Testing Division 2 Reason Word Count:');

const testDiv2ShortReason = validateRegistrationForm(
  null,
  '1301210001',
  '081234567890',
  'Riset',
  'Cybersecurity',
  thirtyWordsReason,
  shortFiveWordsReason, // Only 5 words < 30 min limit
  30,
  '',
  requiresPortfolioFn,
  []
);
assert(testDiv2ShortReason.valid === false, 'Division 2 reason shorter than minimum required words (5 < 30) -> FAIL');

const testDiv2ValidReason = validateRegistrationForm(
  null,
  '1301210001',
  '081234567890',
  'Riset',
  'Cybersecurity',
  thirtyWordsReason,
  thirtyWordsReason,
  30,
  '',
  requiresPortfolioFn,
  []
);
assert(testDiv2ValidReason.valid === true, 'Division 2 reason meeting minimum required words -> PASS');

const testDiv2EmptyOptional = validateRegistrationForm(
  null,
  '1301210001',
  '081234567890',
  'Riset',
  '', // Empty Division 2 (Optional)
  thirtyWordsReason,
  '', // Empty reason for Division 2
  30,
  '',
  requiresPortfolioFn,
  []
);
assert(testDiv2EmptyOptional.valid === true, 'Division 2 left empty (unselected/optional) -> PASS');

// 8. Cumulative Upload Payload Size Limit Tests
console.log('\n8️⃣ Testing Cumulative Upload Payload Limit (15MB Max):');

const mockDoc1 = createMockFileInput({
  required: true,
  files: [{ name: 'berkas1.pdf', size: 8 * 1024 * 1024 }] // 8MB
});
const mockDoc2 = createMockFileInput({
  required: true,
  files: [{ name: 'berkas2.pdf', size: 8 * 1024 * 1024 }] // 8MB (Total 16MB > 15MB)
});

const testCumulativeExceeded = validateRegistrationForm(
  null,
  '1301210001',
  '081234567890',
  'Riset',
  'Cybersecurity',
  thirtyWordsReason,
  thirtyWordsReason,
  30,
  '',
  requiresPortfolioFn,
  [
    { label: 'Berkas 1', input: mockDoc1, defaultMax: 10 },
    { label: 'Berkas 2', input: mockDoc2, defaultMax: 10 }
  ]
);
assert(testCumulativeExceeded.valid === false, 'Cumulative upload size exceeding 15MB limit (16MB total) -> FAIL');

const mockDocSmall1 = createMockFileInput({
  required: true,
  files: [{ name: 'berkas1.pdf', size: 4 * 1024 * 1024 }] // 4MB
});
const mockDocSmall2 = createMockFileInput({
  required: true,
  files: [{ name: 'berkas2.pdf', size: 5 * 1024 * 1024 }] // 5MB (Total 9MB <= 15MB)
});

const testCumulativeValid = validateRegistrationForm(
  null,
  '1301210001',
  '081234567890',
  'Riset',
  'Cybersecurity',
  thirtyWordsReason,
  thirtyWordsReason,
  30,
  '',
  requiresPortfolioFn,
  [
    { label: 'Berkas 1', input: mockDocSmall1, defaultMax: 10 },
    { label: 'Berkas 2', input: mockDocSmall2, defaultMax: 10 }
  ]
);
assert(testCumulativeValid.valid === true, 'Cumulative upload size within 15MB limit (9MB total) -> PASS');

// 9. Candidate Search and NIM Lookup Tests
console.log('\n9️⃣ Testing Recruitment Results NIM Lookup & Search:');

// Setup minimal mock DOM environment for Node.js test execution
class MockHTMLElement {
  id: string = '';
  value: string = '';
  innerHTML: string = '';
  className: string = '';
  attributes: Record<string, string> = {};
  listeners: Record<string, Function[]> = {};
  parentElement: MockHTMLElement | null = null;
  children: MockHTMLElement[] = [];

  constructor(id: string = '') {
    this.id = id;
  }

  getAttribute(name: string): string | null {
    return this.attributes[name] ?? null;
  }

  setAttribute(name: string, value: string) {
    this.attributes[name] = value;
  }

  addEventListener(event: string, handler: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }

  dispatchEvent(event: { type: string; key?: string; preventDefault?: Function }) {
    if (this.listeners[event.type]) {
      this.listeners[event.type].forEach(fn => fn(event));
    }
  }

  closest(_selector: string): MockHTMLElement | null {
    return this.parentElement;
  }

  querySelector(selector: string): MockHTMLElement | null {
    return this.children.find(c => c.id.includes(selector.replace(/^[.#]/, ''))) || null;
  }
}

const mockContainer = new MockHTMLElement('registration-container');
mockContainer.setAttribute(
  'data-selection-steps',
  JSON.stringify([
    {
      id: 'selection',
      title: 'Seleksi Berkas',
      resultsConfig: {
        passedMessage: 'Selamat! Anda dinyatakan lolos seleksi berkas.',
        failedMessage: 'Mohon maaf Anda dinyatakan tidak lolos seleksi berkas.'
      }
    },
    {
      id: 'technical_test',
      title: 'Tes Teknikal',
      resultsConfig: {
        passedMessage: 'Selamat! Anda dinyatakan lolos tes teknikal.',
        failedMessage: 'Mohon maaf Anda dinyatakan tidak lolos tes teknikal.'
      }
    },
    {
      id: 'interview',
      title: 'Wawancara & Microteaching',
      resultsConfig: {}
    },
    {
      id: 'final_selection',
      enabled: false,
      title: 'Seleksi Akhir',
      resultsConfig: {}
    }
  ])
);

// Provide announcementConfig so announcement search picks up proper accepted/rejected messages
mockContainer.setAttribute(
  'data-recruitment-results',
  JSON.stringify({
    announcementConfig: {
      acceptedMessage: 'Selamat! Anda dinyatakan LOLOS seleksi akhir.',
      rejectedMessage: 'Terima kasih. Anda belum berhasil lolos seleksi akhir.',
    },
    bulkImportText: [
      '102022400023\t\tpassed\tpassed\taccepted',
      '102022430045\t\tpassed\tpassed\taccepted',
      '102022400026\t\tpassed\tpassed\trejected',
      '102022400119\t\tpassed\tfailed',
    ].join('\n'),
    candidates: [],
  })
);

const elementsMap: Record<string, MockHTMLElement> = {
  'registration-container': mockContainer,
  'search-selection-nim-input': new MockHTMLElement('search-selection-nim-input'),
  'search-selection-nim-btn': new MockHTMLElement('search-selection-nim-btn'),
  'search-selection-result-box': new MockHTMLElement('search-selection-result-box'),
  'search-nim-input': new MockHTMLElement('search-nim-input'),
  'search-nim-btn': new MockHTMLElement('search-nim-btn'),
  'search-result-box': new MockHTMLElement('search-result-box'),
};

// Set parent linkages
const mockBox = new MockHTMLElement('search-lookup-box');
mockBox.children = [elementsMap['search-selection-nim-input'], elementsMap['search-selection-nim-btn'], elementsMap['search-selection-result-box']];
elementsMap['search-selection-nim-input'].parentElement = mockBox;
elementsMap['search-selection-nim-btn'].parentElement = mockBox;
elementsMap['search-selection-result-box'].parentElement = mockBox;

(globalThis as any).document = {
  getElementById: (id: string) => elementsMap[id] || null,
  querySelectorAll: (_selector: string) => [elementsMap['search-selection-nim-btn'], elementsMap['search-nim-btn']].filter(Boolean)
};

const { initRegistrationSearch } = await import('./registration/search');
initRegistrationSearch();

// Test 9.1: Screening / Selection search for candidate 102022400023 (Passed selection)
const selectionInput = elementsMap['search-selection-nim-input'];
const selectionBtn = elementsMap['search-selection-nim-btn'];
const selectionResultBox = elementsMap['search-selection-result-box'];

selectionInput.value = '102022400023';
selectionBtn.dispatchEvent({ type: 'click' });
assert(
  selectionResultBox.className.includes('status-passed') && selectionResultBox.innerHTML.includes('102022400023'),
  'Candidate 102022400023 in screening search -> Shows PASSED status with NIM'
);

// Test 9.2: Screening search with formatted NIM (e.g. spaces/dashes: " 102022400023 ")
selectionInput.value = '  102022400023  ';
selectionBtn.dispatchEvent({ type: 'click' });
assert(
  selectionResultBox.className.includes('status-passed'),
  'Candidate search with leading/trailing spaces -> Normalizes and matches candidate'
);

// Test 9.3: Search for unknown NIM -> Shows not found (muted)
selectionInput.value = '9999999999';
selectionBtn.dispatchEvent({ type: 'click' });
assert(
  selectionResultBox.className.includes('status-muted') && selectionResultBox.innerHTML.includes('tidak ditemukan'),
  'Unknown NIM search -> Shows data tidak ditemukan message'
);

// Test 9.4: Search with empty NIM query -> Shows error prompt
selectionInput.value = '';
selectionBtn.dispatchEvent({ type: 'click' });
assert(
  selectionResultBox.className.includes('status-error') && selectionResultBox.innerHTML.includes('Masukkan NIM'),
  'Empty NIM search -> Shows validation prompt'
);

// Test 9.5a: Final announcement search for ACCEPTED candidate 102022430045
const annInput = elementsMap['search-nim-input'];
const annBtn = elementsMap['search-nim-btn'];
const annResultBox = elementsMap['search-result-box'];

annInput.value = '102022430045';
annBtn.dispatchEvent({ type: 'click' });
assert(
  annResultBox.className.includes('status-passed') &&
  annResultBox.innerHTML.includes('102022430045') &&
  annResultBox.innerHTML.includes('SELAMAT'),
  'Final announcement search for accepted candidate 102022430045 -> Shows SELAMAT DITERIMA'
);

// Test 9.5b: Final announcement search for REJECTED candidate 102022400026
annInput.value = '102022400026';
annBtn.dispatchEvent({ type: 'click' });
assert(
  annResultBox.className.includes('status-error') &&
  annResultBox.innerHTML.includes('102022400026') &&
  annResultBox.innerHTML.includes('BELUM DITERIMA'),
  'Final announcement search for rejected candidate 102022400026 -> Shows BELUM DITERIMA'
);

// Test 9.5c: Accepted candidate 102022400023 shows correct result
annInput.value = '102022400023';
annBtn.dispatchEvent({ type: 'click' });
assert(
  annResultBox.className.includes('status-passed') && annResultBox.innerHTML.includes('102022400023'),
  'Final announcement search for candidate 102022400023 -> Renders accepted search result'
);

// Test 9.6: Screening search for a candidate rejected at the final stage
selectionInput.value = '102022400119';
selectionBtn.dispatchEvent({ type: 'click' });
assert(
  selectionResultBox.className.includes('status-passed') && selectionResultBox.innerHTML.includes('102022400119'),
  'Screening search for candidate rejected at final -> renders passed screening'
);

// 9.7: Testing Rich-Text Formatting for Candidate Notes
const { formatMessageMarkdown } = await import('./registration/search');
const testRawNote = 'Selamat! Anda dinyatakan **LOLOS** pada tahap *Seleksi Berkas*. Catatan: <u>Wajib hadir</u> tepat waktu. Cek `grup WA`.';
const formattedNote = formatMessageMarkdown(testRawNote);
assert(
  formattedNote.includes('<strong>LOLOS</strong>') &&
  formattedNote.includes('<em>Seleksi Berkas</em>') &&
  formattedNote.includes('<u>Wajib hadir</u>') &&
  formattedNote.includes('<code class="search-result-code">grup WA</code>'),
  'formatMessageMarkdown -> Correctly converts **bold**, *italic*, <u>underline</u>, and `code`'
);

// 9. Recruitment Lifecycle Stage & Auto-Close Tests
console.log('\n🔟 Testing Recruitment Lifecycle Stages & Auto-Close:');

const mockStageConfig = {
  status: 'auto',
  autoCloseAfterDeadline: true,
  timezoneOffset: '+07:00',
  upcomingStartDate: '2026-08-01T00:00:00',
  openDate: '2026-08-14T00:00:00',
  deadline: '2026-08-20T23:59:59',
  extendedDeadline: '',
  announcementDate: '2026-09-09T00:00:00',
  selectionSteps: [
    {
      id: 'selection',
      enabled: true,
      title: 'Seleksi Berkas',
      shortLabel: 'Seleksi Berkas',
      startDate: '2026-08-24T00:00:00',
      endDate: '2026-08-25T23:59:59',
      templateType: 'in_progress' as const
    }
  ]
};

// 9.1: Upcoming Stage (before openDate)
const tUpcoming = new Date('2026-08-10T12:00:00+07:00').getTime();
assert(calculateStageFromDates(mockStageConfig, tUpcoming) === 'upcoming', 'Timestamp before openDate should return "upcoming"');

// 9.2: Open Stage (between openDate and deadline)
const tOpen = new Date('2026-08-15T12:00:00+07:00').getTime();
assert(calculateStageFromDates(mockStageConfig, tOpen) === 'open', 'Timestamp during active period should return "open"');

// 9.3: Auto-Close Stage (after deadline, before first selection step)
const tAfterDeadline = new Date('2026-08-21T00:00:01+07:00').getTime();
assert(calculateStageFromDates(mockStageConfig, tAfterDeadline) === 'closed', 'Timestamp immediately after deadline with empty extendedDeadline should return "closed"');

// 9.4: Extended Stage (when valid extendedDeadline is explicitly defined)
const mockExtendedConfig = {
  ...mockStageConfig,
  extendedDeadline: '2026-08-23T23:59:59'
};
assert(calculateStageFromDates(mockExtendedConfig, tAfterDeadline) === 'extended', 'Timestamp past deadline with valid future extendedDeadline should return "extended"');

// 9.5: Selection Step Active Stage (when selection step startDate arrives)
const tSelectionStep = new Date('2026-08-24T10:00:00+07:00').getTime();
assert(calculateStageFromDates(mockStageConfig, tSelectionStep) === 'selection', 'Timestamp during selection step window should return "selection"');

// 10. Contact Link Sanitizer
console.log('\n🔟 Testing Contact Link Sanitizer:');
assert(safeLink('https://wa.me/6281234567890') === 'https://wa.me/6281234567890', 'HTTPS link should pass');
assert(safeLink('  mailto:lab@eimlab.org ') === 'mailto:lab@eimlab.org', 'mailto link should be trimmed and pass');
assert(safeLink('tel:+6281234567890') === 'tel:+6281234567890', 'tel link should pass');
assert(safeLink('javascript:alert(1)') === undefined, 'javascript: scheme should be rejected');
assert(safeLink('data:text/html,<script>alert(1)</script>') === undefined, 'data: scheme should be rejected');
assert(safeLink('wa.me/6281234567890') === undefined, 'Bare host without scheme should be rejected');
assert(safeLink('') === undefined, 'Empty link should be rejected');

// 11. Internal href guard (home hero CTA, event poster modal)
console.log('\n1️⃣1️⃣ Testing Internal Href Sanitizer:');
assert(internalHref('/registration', '/fallback') === '/registration', 'Root-relative path should pass');
assert(internalHref('/', '/fallback') === '/', 'Root path should pass');
assert(internalHref(' /contact?x=1#y ', '/fallback') === '/contact?x=1#y', 'Query, hash and whitespace should be trimmed and pass');
assert(internalHref('//evil.com', '/fallback') === '/fallback', 'Protocol-relative URL should be rejected');
assert(internalHref('/\\evil.com', '/fallback') === '/fallback', 'Backslash authority should be rejected');
assert(internalHref('/\t/evil.com', '/fallback') === '/fallback', 'Tab-folded authority should be rejected');
assert(internalHref('javascript:alert(1)', '/fallback') === '/fallback', 'javascript: scheme should be rejected');
assert(internalHref('https://evil.com', '/fallback') === '/fallback', 'Absolute URL should be rejected');
assert(internalHref(null, '/fallback') === '/fallback', 'Missing value should fall back');

// 12. Content Filter Selection Helper
console.log('\n1️⃣2️⃣ Testing Content Filter Selection Helper:');
const mkCard = (category: string, status: string, searchText: string, date: string, audit = false): FilterCard => ({
  el: {} as HTMLElement,
  category,
  status,
  searchText,
  dateMs: Number.isNaN(Date.parse(date)) ? 0 : Date.parse(date),
  audit,
});
const filterCards: FilterCard[] = [
  mkCard('Berita', 'published', 'alpha rilis satu', '2026-01-01'),
  mkCard('Berita', 'published', 'beta rilis dua', '2026-01-02'),
  mkCard('Berita', 'published', 'gamma rilis tiga', '2026-01-03'),
  mkCard('Berita', 'published', 'delta arsip', '2026-01-04', true),
  mkCard('Kegiatan', 'published', 'alpha acara satu', '2026-01-05'),
  mkCard('Kegiatan', 'draft', 'beta acara dua', '2026-01-06'),
  mkCard('Kegiatan', 'published', 'acara tanpa tanggal', 'not-a-date'),
];
const sel = (items: FilterCard[], over: Partial<FilterState>): FilterResult =>
  selectVisibleCards(items, {
    search: '', category: 'all', status: 'all', sort: 'desc', page: 1, perPage: 6,
    forceEmpty: false, hideAudit: false, ...over,
  });

assert(sel(filterCards, { search: '  ALPHA ' }).total === 2, 'search is trimmed and case-insensitive');
assert(sel(filterCards, { category: 'Kegiatan' }).total === 3, 'category filter is exact and case-insensitive');
assert(sel(filterCards, { search: 'zzzz' }).total === 0, 'no-match query returns nothing');
assert(sel(filterCards, { search: '', page: 1, perPage: 99 }).pageItems.at(-1)!.dateMs === 0, 'desc puts an invalid date last');
assert(sel(filterCards, { search: '', sort: 'asc', page: 1, perPage: 99 }).pageItems[0].dateMs === 0, 'asc puts an invalid date first');
assert((() => { const p = sel(filterCards, { page: 99, perPage: 3 }); return p.totalPages === 3 && p.page === 3 && p.pageItems.length === 1; })(), 'pagination clamps an out-of-range page');
assert(sel(filterCards, { forceEmpty: true }).total === 0, 'forceEmpty empties the grid');
assert(sel(filterCards, { hideAudit: true }).total === 6, 'hideAudit drops audit cards');
assert(sel(filterCards, { status: 'draft' }).total === 1, 'status filter is exact and case-insensitive');
const filterOrderBefore = filterCards.map(card => card.searchText).join('|');
sel(filterCards, { search: '', sort: 'asc', page: 1, perPage: 99 });
assert(filterCards.map(card => card.searchText).join('|') === filterOrderBefore, 'selection does not mutate the input order');

// 13. Role labels and stage CTA
console.log('\n13. Testing Stage CTA:');
assert(resolveStageCta('open').href === '/registration', 'open stage points at registration');
assert(resolveStageCta('closed').label === 'Hubungi Kami', 'closed stage points at contact');
assert(resolveStageCta('nope').href === '/contact', 'unknown stage falls back to contact');

// 14. Positions
console.log('\n14. Testing Position Mapper:');
const positionFixtures: Position[] = [
  { id: 'ketua-lab', label: 'Dosen Ketua Laboratorium', group: 'dosen', order: 1 },
  { id: 'wakil-ketua-lab', label: 'Dosen Wakil Ketua Laboratorium', group: 'dosen', order: 2 },
  { id: 'koordinator-asisten', label: 'Koordinator Asisten Laboratorium', group: 'asisten', order: 5 },
  { id: 'mahasiswa-anggota', label: 'Mahasiswa Anggota Laboratorium', group: 'mahasiswa', order: 7 },
  { id: 'tim-adhoc', label: 'Tim Adhoc', group: 'mahasiswa', order: 8 },
  { id: 'dup-a', label: 'Dup A', group: 'mahasiswa', order: 9 },
  { id: 'dup-b', label: 'Dup B', group: 'mahasiswa', order: 9 },
];
assert(parsePositions({ list: positionFixtures }).length === 7, 'parsePositions reads the list array');
assert(parsePositions({ list: positionFixtures })[5].id === 'dup-a', 'equal order keeps array order');
assert(parsePositions(null).length === 0, 'missing positions data yields an empty list');

const positionIndex = buildPositionIndex(positionFixtures);
assert(positionLabel(positionIndex, 'ketua-lab') === 'Dosen Ketua Laboratorium', 'known position returns its label');
assert(positionLabel(positionIndex, 'nope') === 'nope', 'unknown position falls back to the raw id');

const grouped = groupPeople([
  { name: 'A', role: 'ketua-lab' },
  { name: 'B', role: 'mahasiswa-anggota' },
  { name: 'C', role: 'not-a-position' },
  { name: 'D', role: 'ketua-lab' },
], positionFixtures);
assert(grouped.length === 2, 'only occupied positions form sections');
assert(grouped[0].position.id === 'ketua-lab' && grouped[0].people.length === 2, 'sections follow position order and keep all holders');
assert(grouped[1].position.id === 'mahasiswa-anggota', 'later occupied position follows');
assert(!grouped.some(section => section.position.id === 'tim-adhoc'), 'unoccupied position is skipped');
assert(!grouped.some(section => section.people.some(person => person.role === 'not-a-position')), 'unknown role is excluded, not thrown');

const groupCounts = countPeopleByGroup(
  [{ role: 'ketua-lab' }, { role: 'mahasiswa-anggota' }, { role: 'mahasiswa-anggota' }, { role: 'nope' }],
  positionFixtures,
);
assert(groupCounts.dosen === 1, 'dosen count follows the position group');
assert(groupCounts.mahasiswa === 2, 'mahasiswa count follows the position group');
assert(groupCounts.asisten === 0, 'unheld group counts zero');

const realPositions = parsePositions(positionsData);
assert(realPositions.length === 8, 'positions.json holds eight positions');
const treeIds = STRUCTURE_TREE.flatMap(node => [node.id, ...node.children]);
assert(treeIds.every(id => realPositions.some(position => position.id === id)), 'every chart node resolves to a position in positions.json');
assert(STRUCTURE_TREE[0].id === 'ketua-lab', 'tree starts at ketua-lab');

// 15. Course resolution
console.log('\n15. Testing Course Helpers:');
const courseLecturers = [{ id: 'dosen-koordinator-matkul-1', name: 'Dosen A', role: 'koordinator-matkul', image: '', scale: '1', position: 'center' }];
const courseMembers = [
  { id: 1, name: 'Asisten A', role: 'mahasiswa-anggota', image: '', scale: '1', position: 'center' },
  { id: 2, name: 'Asisten B', role: 'mahasiswa-anggota', image: '', scale: '1', position: 'center' },
];
const courseEntries = [
  { id: 'b', data: { title: 'Kedua', code: 'B', sks: 3, hasPracticum: true, modules: [{ title: 'Modul 1', topics: 'Topik' }], coordinatorId: 'dosen-koordinator-matkul-1', assistantIds: [1, 1, 2, 99], order: 2 } },
  { id: 'a', data: { title: 'Pertama', code: 'A', sks: 2, hasPracticum: false, modules: [{ title: 'Stale', topics: 'Stale' }], coordinatorId: 'missing', assistantIds: [2], order: 1 } },
];
const resolvedCourses = resolveCourses(courseEntries, courseLecturers, courseMembers);
assert(resolvedCourses.length === 2, 'every course resolves');
assert(resolvedCourses[0].id === 'a', 'courses sort by order');
assert(resolvedCourses[0].coordinator === null, 'missing coordinator resolves to null');
assert(resolvedCourses[0].modules.length === 1, 'resolution keeps raw data');
assert(courseHasContent(resolvedCourses[1]).modules.length === 1, 'practicum course exposes modules');
assert(courseHasContent(resolvedCourses[0]).modules.length === 0, 'non-practicum course exposes no modules');
assert(courseHasContent(resolvedCourses[0]).assistants.length === 0, 'non-practicum course exposes no assistants');
assert(resolvedCourses[1].assistants.length === 2, 'assistant ids resolve, dedupe, and drop missing');
assert(courseHasContent(resolvedCourses[1]).assistants[0].name === 'Asisten A', 'assistants keep member order');

// 16. Practicum assistant overlap
console.log('\n16. Testing Practicum Assistant Summary:');
const overlapCourses = [
  { id: 'a', data: { title: 'A', code: 'X', sks: 3, hasPracticum: true, modules: [], coordinatorId: 'x', assistantIds: [1, 2], order: 1 } },
  { id: 'b', data: { title: 'B', code: 'Y', sks: 3, hasPracticum: true, modules: [], coordinatorId: 'x', assistantIds: [2, 3], order: 2 } },
  { id: 'c', data: { title: 'C', code: 'Z', sks: 2, hasPracticum: false, modules: [], coordinatorId: 'x', assistantIds: [4], order: 3 } },
];
const overlapMembers = [
  { id: 1, name: 'A', role: 'mahasiswa-anggota', image: '', scale: '1', position: 'center' },
  { id: 2, name: 'B', role: 'koordinator-asisten', image: '', scale: '1', position: 'center' },
];
const overlap = summarizePracticumAssistants(
  overlapCourses.map((course) => course.data),
  overlapMembers,
);
assert(overlap.distinctCount === 3, 'distinct assistants span practicum courses and dedupe');
assert(overlap.memberCount === 1, 'only mahasiswa-anggota assistants count as members with a dual role');
const noPracticum = summarizePracticumAssistants(
  [{ title: 'D', code: 'W', sks: 2, hasPracticum: false, modules: [], coordinatorId: 'x', assistantIds: [1], order: 1 }],
  overlapMembers,
);
assert(noPracticum.distinctCount === 0 && noPracticum.memberCount === 0, 'no practicum yields zero assistants');

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;


