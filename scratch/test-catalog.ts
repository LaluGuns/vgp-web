import { validateCatalog } from '../lib/catalog/validate';

const issues = validateCatalog();
console.log('=== CATALOG VALIDATION RESULTS ===');
console.log(`Total Issues: ${issues.length}`);
if (issues.length > 0) {
    console.table(issues);
} else {
    console.log('✅ CATALOG VALIDATION PASSED: 0 errors, 0 warnings.');
}
