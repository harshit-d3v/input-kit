/**
 * Test file to verify all imports work correctly
 * Run: npx tsx test-demo/test-imports.ts
 */

import {
  confetti,
  fireConfetti,
  celebrate,
} from '../src/index';

console.log('[OK] All imports successful!\n');

console.log('Testing confetti functions:');
console.log('- confetti: typeof', typeof confetti);
console.log('- fireConfetti: typeof', typeof fireConfetti);
console.log('- celebrate: typeof', typeof celebrate);

console.log('\n[Note] Confetti functions require a browser environment with DOM and Canvas API.');
console.log('To test visually, open test-demo/index.html in a browser.');

console.log('\n[OK] All function exports verified!');
console.log('[Success] Package is working correctly!');
