/**
 * Test that all exports from @input-kit/dropzone are accessible
 */
import * as Pkg from '../src/index';

console.log('✅ Successfully imported @input-kit/dropzone');
console.log('Exports:', Object.keys(Pkg));

// Verify exports exist
if (Object.keys(Pkg).length === 0) {
  console.error('❌ No exports found!');
  process.exit(1);
}

console.log('✅ All exports verified');
