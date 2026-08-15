import {
  validateNim,
  validatePhone,
  validateEmail,
  countWords,
  validateRegistrationForm,
} from './registration/validation';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ TEST FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('🧪 Starting Automated Registration Logic Unit Tests...\n');

// 1. NIM Format Validation Tests
console.log('1️⃣ Testing NIM Validation:');
assert(validateNim('1301210001') === true, 'Valid 10-digit NIM -> PASS');
assert(validateNim('130121000199') === true, 'Valid 12-digit NIM -> PASS');
assert(validateNim('12345') === false, 'Too short NIM (5 digits) -> FAIL');
assert(validateNim('1301210001ABC') === false, 'NIM with characters -> FAIL');

// 2. Phone Number Validation Tests
console.log('\n2️⃣ Testing Phone Number Validation:');
assert(validatePhone('081234567890') === true, 'Valid 08xx phone number -> PASS');
assert(validatePhone('+6281234567890') === true, 'Valid +628xx phone number -> PASS');
assert(validatePhone('6281234567890') === false, 'Phone without + or leading 0 -> FAIL');
assert(validatePhone('0217654321') === false, 'Non-mobile area code -> FAIL');

// 3. Email Validation Tests
console.log('\n3️⃣ Testing Email Validation:');
assert(validateEmail('student@telkomuniversity.ac.id') === true, 'Valid student email -> PASS');
assert(validateEmail('user.name@domain.co.id') === true, 'Valid subdomain email -> PASS');
assert(validateEmail('invalid-email') === false, 'Email missing @ symbol -> FAIL');
assert(validateEmail('user@') === false, 'Incomplete email -> FAIL');

// 4. Word Count Calculator Tests
console.log('\n4️⃣ Testing Word Count Helper:');
assert(countWords('Halo nama saya adalah Budi') === 5, '5 Indonesian words -> 5');
assert(countWords('   Budi    suka   coding   ') === 3, 'Words with irregular spacing -> 3');
assert(countWords('') === 0, 'Empty string -> 0');

// 5. Portfolio & Division Selection Tests
console.log('\n5️⃣ Testing Form Division Selection & Validation:');

const testRequiredModeGeneral = validateRegistrationForm(
  null,
  '1301210001',
  '081234567890',
  'Riset',
  'Cybersecurity'
);
assert(testRequiredModeGeneral.valid === true, 'General division -> PASS');

const testRequiredModeTriggerWithUrl = validateRegistrationForm(
  null,
  '1301210001',
  '081234567890',
  'Medhum',
  'Cybersecurity'
);
assert(testRequiredModeTriggerWithUrl.valid === true, 'Trigger division -> PASS');

const testDuplicateDiv = validateRegistrationForm(
  null,
  '1301210001',
  '081234567890',
  'Riset',
  'Riset'
);
assert(testDuplicateDiv.valid === false, 'Duplicate division selection -> FAIL');

console.log('\n✨ All Automated Registration Unit Tests Execution Completed Successfully!');
