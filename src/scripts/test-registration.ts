import {
  validateNim,
  validatePhone,
  validateEmail,
  countWords,
  validateSingleFile,
  validateRegistrationForm
} from './registration/validation';
import { calculateStageFromDates } from './registration/stage';

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASSED: ${testName}`);
  } else {
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
    }
  ])
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

// Test 9.5: Final announcement search for candidate 102022400023
const annInput = elementsMap['search-nim-input'];
const annBtn = elementsMap['search-nim-btn'];
const annResultBox = elementsMap['search-result-box'];

annInput.value = '102022400023';
annBtn.dispatchEvent({ type: 'click' });
assert(
  annResultBox.className.includes('is-visible') && annResultBox.innerHTML.includes('102022400023'),
  'Final announcement search for candidate 102022400023 -> Renders candidate search result'
);

// Test 9.6: Screening search for candidate with failed status (102022400119)
selectionInput.value = '102022400119';
selectionBtn.dispatchEvent({ type: 'click' });
assert(
  selectionResultBox.className.includes('status-muted') && selectionResultBox.innerHTML.includes('102022400119'),
  'Screening search for failed candidate -> Renders muted result with NIM'
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

console.log('\n✨ All Automated Registration Unit Tests Execution Completed Successfully!');


