#!/usr/bin/env node

/**
 * FlashFusion Web Scraping Test Script
 * Demonstrates Firecrawl and Playwright functionality
 * Use context7 to ensure we're using latest best practices
 */

const WebScrapingService = require('../server/services/webScrapingService');
const logger = require('../utils/logger');

class WebScrapingTester {
    constructor() {
        this.webScrapingService = new WebScrapingService();
        this.testResults = {
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    async runTest(testName, testFunction) {
        console.log(`\n🧪 Running test: ${testName}`);
        try {
            const result = await testFunction();
            if (result.success) {
                console.log(`✅ ${testName}: PASSED`);
                this.testResults.passed++;
                this.testResults.tests.push({ name: testName, status: 'PASSED', result });
            } else {
                console.log(`❌ ${testName}: FAILED - ${result.error}`);
                this.testResults.failed++;
                this.testResults.tests.push({ name: testName, status: 'FAILED', error: result.error });
            }
        } catch (error) {
            console.log(`❌ ${testName}: ERROR - ${error.message}`);
            this.testResults.failed++;
            this.testResults.tests.push({ name: testName, status: 'ERROR', error: error.message });
        }
    }

    async testHealthCheck() {
        return await this.webScrapingService.healthCheck();
    }

    // Test with a simple public website (no API key required for this test)
    async testPlaywrightScreenshot() {
        return await this.webScrapingService.takeScreenshot('https://example.com', {
            format: 'png',
            viewport: { width: 1280, height: 720 }
        });
    }

    async testPlaywrightDataExtraction() {
        const selectors = {
            title: 'h1',
            description: 'p',
            links: { 
                selector: 'a', 
                multiple: true, 
                attribute: 'href' 
            }
        };

        return await this.webScrapingService.extractStructuredData('https://example.com', selectors);
    }

    async testFirecrawlExtraction() {
        // This test will work if FIRECRAWL_API_KEY is configured
        // Otherwise it will demonstrate the error handling
        return await this.webScrapingService.extractContent('https://example.com', {
            formats: ['markdown'],
            onlyMainContent: true
        });
    }

    async testBrowserCompatibility() {
        const browsers = ['chromium', 'firefox', 'webkit'];
        const results = [];

        for (const browserType of browsers) {
            try {
                const result = await this.webScrapingService.takeScreenshot('https://example.com', {
                    browserType,
                    format: 'png',
                    viewport: { width: 800, height: 600 }
                });
                
                results.push({
                    browser: browserType,
                    success: result.success,
                    error: result.error || null
                });
            } catch (error) {
                results.push({
                    browser: browserType,
                    success: false,
                    error: error.message
                });
            }
        }

        const successfulBrowsers = results.filter(r => r.success).length;
        return {
            success: successfulBrowsers > 0,
            data: {
                totalBrowsers: browsers.length,
                successfulBrowsers,
                results
            },
            error: successfulBrowsers === 0 ? 'No browsers working' : null
        };
    }

    async testPageMonitoring() {
        // Test with a very short monitoring period
        return await this.webScrapingService.monitorPageChanges('https://example.com', {
            duration: 5000, // 5 seconds
            interval: 2000  // Check every 2 seconds
        });
    }

    async runAllTests() {
        console.log('🚀 Starting FlashFusion Web Scraping Tests\n');
        console.log('=' .repeat(60));

        // Test 1: Health Check
        await this.runTest('Health Check', () => this.testHealthCheck());

        // Test 2: Playwright Screenshot
        await this.runTest('Playwright Screenshot', () => this.testPlaywrightScreenshot());

        // Test 3: Playwright Data Extraction
        await this.runTest('Playwright Data Extraction', () => this.testPlaywrightDataExtraction());

        // Test 4: Browser Compatibility
        await this.runTest('Browser Compatibility', () => this.testBrowserCompatibility());

        // Test 5: Firecrawl Content Extraction
        await this.runTest('Firecrawl Content Extraction', () => this.testFirecrawlExtraction());

        // Test 6: Page Monitoring
        await this.runTest('Page Monitoring', () => this.testPageMonitoring());

        // Summary
        console.log('\n' + '=' .repeat(60));
        console.log('📊 TEST SUMMARY');
        console.log('=' .repeat(60));
        console.log(`✅ Passed: ${this.testResults.passed}`);
        console.log(`❌ Failed: ${this.testResults.failed}`);
        console.log(`📝 Total:  ${this.testResults.passed + this.testResults.failed}`);

        if (this.testResults.failed > 0) {
            console.log('\n⚠️  FAILED TESTS:');
            this.testResults.tests.filter(t => t.status !== 'PASSED').forEach(test => {
                console.log(`   - ${test.name}: ${test.error}`);
            });
        }

        // Cleanup
        await this.webScrapingService.cleanup();

        console.log('\n🎉 Testing completed!');
        return this.testResults;
    }

    // Demo functions for specific use cases
    async demoWebsiteCrawling() {
        console.log('\n🕷️  DEMO: Website Crawling with Firecrawl');
        console.log('=' .repeat(50));

        const result = await this.webScrapingService.crawlWebsite('https://example.com', {
            limit: 5,
            scrapeOptions: {
                formats: ['markdown'],
                onlyMainContent: true
            }
        });

        if (result.success) {
            console.log(`✅ Successfully crawled ${result.data.totalPages} pages`);
            result.data.pages.forEach((page, index) => {
                console.log(`   ${index + 1}. ${page.url} - ${page.title}`);
            });
        } else {
            console.log(`❌ Crawling failed: ${result.error}`);
        }

        return result;
    }

    async demoFormAutomation() {
        console.log('\n🤖 DEMO: Form Automation with Playwright');
        console.log('=' .repeat(50));

        // Demo with a hypothetical contact form
        const formData = {
            '#name': 'FlashFusion Test',
            '#email': 'test@flashfusion.dev',
            '#message': 'This is an automated test message'
        };

        const result = await this.webScrapingService.automateForm('https://example.com', formData, {
            submitSelector: '#submit-button',
            takeScreenshots: true,
            waitAfterSubmit: 3000
        });

        if (result.success) {
            console.log('✅ Form automation completed');
            console.log(`   Form submitted: ${result.data.formSubmitted}`);
            if (result.data.screenshots.before) {
                console.log('   📸 Before screenshot captured');
            }
            if (result.data.screenshots.after) {
                console.log('   📸 After screenshot captured');
            }
        } else {
            console.log(`❌ Form automation failed: ${result.error}`);
        }

        return result;
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'test';

    const tester = new WebScrapingTester();

    try {
        switch (command) {
            case 'test':
                await tester.runAllTests();
                break;
            case 'crawl':
                await tester.demoWebsiteCrawling();
                break;
            case 'form':
                await tester.demoFormAutomation();
                break;
            case 'health':
                const health = await tester.testHealthCheck();
                console.log('Health Status:', JSON.stringify(health, null, 2));
                break;
            default:
                console.log('Available commands:');
                console.log('  test   - Run all tests');
                console.log('  crawl  - Demo website crawling');
                console.log('  form   - Demo form automation');
                console.log('  health - Check service health');
        }
    } catch (error) {
        console.error('Test execution failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = WebScrapingTester;