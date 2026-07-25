import { validateCatalogSuite } from '../lib/catalog/validate';
import { beatsCatalog } from '../lib/catalog';

console.log('=== BEAT STORE CATALOG VALIDATION SUITE ===\n');

const issues = validateCatalogSuite();
const errors = issues.filter((i) => i.severity === 'error');
const warnings = issues.filter((i) => i.severity === 'warning');

console.log(`Total Catalog Beats Evaluated: ${beatsCatalog.length}`);
console.log(`Total Validation Issues: ${issues.length}`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}\n`);

if (errors.length > 0) {
    console.error('❌ Validation Failed with Errors:');
    errors.forEach((e) => {
        console.error(` - [Rule ${e.ruleId}: ${e.ruleName}] ${e.message}`);
    });
    process.exit(1);
} else {
    console.log('✅ Catalog Validation Passed Successfully (0 Errors)!');
    if (warnings.length > 0) {
        console.log('\nWarnings:');
        warnings.forEach((w) => {
            console.log(` - [Rule ${w.ruleId}: ${w.ruleName}] ${w.message}`);
        });
    }
}
