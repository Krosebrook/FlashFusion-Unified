#!/usr/bin/env node

/**
 * Key Validation Script
 * Run this before deployment to ensure all keys are valid
 */

require('dotenv').config();
const KeyValidator = require('../src/utils/keyValidator');

async function main() {
    console.log('🔍 Validating FlashFusion API Keys...\n');
    
    const validator = new KeyValidator();
    const validation = validator.validateEnvironment();
    
    // Print detailed report
    console.log(validator.generateReport());
    
    // Exit with error code if validation failed
    if (!validation.valid) {
        console.log('\n❌ Validation failed! Fix the errors above before deployment.');
        process.exit(1);
    } else {
        console.log('\n✅ All validations passed! Ready for deployment.');
        process.exit(0);
    }
}

main().catch(error => {
    console.error('Error during validation:', error);
    process.exit(1);
});