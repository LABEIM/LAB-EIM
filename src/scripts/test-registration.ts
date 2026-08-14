import {
  validateNim,
  validatePhone,
  validateEmail,
  countWords,
  validateSingleFile,
  validateRegistrationForm
} from './registration/validation';

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

console.log('\n✨ All Automated Registration Unit Tests Execution Completed Successfully!');

