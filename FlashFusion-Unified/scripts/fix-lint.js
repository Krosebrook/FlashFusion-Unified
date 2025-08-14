#!/usr/bin/env node

/**
 * Quick Lint Fix Script
 * Fixes common lint issues in the codebase
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files with specific issues to fix
const fileFixes = [
    {
        file: 'src/server/services/mcp/MCPEnhancedApiKeyService.ts',
        fixes: [
            {
                search: "'API_KEY_PATTERNS' is not defined",
                replace: 'const API_KEY_PATTERNS = {};'
            }
        ]
    }
];

function fixFile(filePath, fixes) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        fixes.forEach(fix => {
            if (content.includes(fix.search) || fix.search === 'add-const') {
                if (fix.search === 'add-const') {
                    // Add missing constant
                    content = fix.replace + '\n' + content;
                    modified = true;
                }
            }
        });

        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log(`✅ Fixed: ${filePath}`);
        }
    } catch (error) {
        console.log(`⚠️  Could not fix ${filePath}: ${error.message}`);
    }
}

// Fix specific file issues
function fixSpecificIssues() {
    console.log('🔧 Fixing specific lint issues...');

    // Fix missing API_KEY_PATTERNS
    const mcpFile = 'src/server/services/mcp/MCPEnhancedApiKeyService.ts';
    if (fs.existsSync(mcpFile)) {
        try {
            let content = fs.readFileSync(mcpFile, 'utf8');
            if (!content.includes('API_KEY_PATTERNS')) {
                // Add the missing constant at the top
                const constDef = `
const API_KEY_PATTERNS = {
    openai: /^sk-[A-Za-z0-9]{48}$/,
    anthropic: /^sk-ant-[A-Za-z0-9-]{95}$/,
    gemini: /^AIza[A-Za-z0-9_-]{35}$/
};

`;
                content = constDef + content;
                fs.writeFileSync(mcpFile, content);
                console.log(`✅ Fixed API_KEY_PATTERNS in ${mcpFile}`);
            }
        } catch (error) {
            console.log(`⚠️  Could not fix ${mcpFile}: ${error.message}`);
        }
    }
}

// Fix unused variables by prefixing with underscore
function fixUnusedVars() {
    console.log('🔧 Fixing unused variables...');
    
    const patterns = [
        { file: 'src/index.js', search: 'next', replace: '_next' },
        { file: 'src/middleware/mcpMiddleware.js', search: 'next', replace: '_next' },
        { file: 'src/workflows/research/UserResearchWorkflow.js', search: 'studyConfig', replace: '_studyConfig' }
    ];

    patterns.forEach(pattern => {
        const filePath = pattern.file;
        if (fs.existsSync(filePath)) {
            try {
                let content = fs.readFileSync(filePath, 'utf8');
                // Only replace function parameter names, not all occurrences
                content = content.replace(
                    new RegExp(`\\b${pattern.search}\\b(?=\\s*[,)])`, 'g'),
                    pattern.replace
                );
                fs.writeFileSync(filePath, content);
                console.log(`✅ Fixed unused variable in ${filePath}`);
            } catch (error) {
                console.log(`⚠️  Could not fix ${filePath}: ${error.message}`);
            }
        }
    });
}

// Main execution
function main() {
    console.log('🚀 FlashFusion Lint Fix Script');
    console.log('===============================');

    try {
        // Run auto-fix first
        console.log('🔄 Running ESLint auto-fix...');
        execSync('npm run lint:fix', { stdio: 'inherit' });

        // Fix specific issues
        fixSpecificIssues();
        fixUnusedVars();

        console.log('\n✅ Lint fixes completed!');
        console.log('\nRun "npm run lint" to verify fixes.');

    } catch (error) {
        console.log('\n⚠️  Some issues may remain. Check output above.');
    }
}

if (require.main === module) {
    main();
}

module.exports = { fixSpecificIssues, fixUnusedVars };