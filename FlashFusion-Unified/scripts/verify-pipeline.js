#!/usr/bin/env node

/**
 * Pipeline Verification Script
 * Tests the complete You → Claude → Git → Vercel → GoDaddy → FlashFusion.co pipeline
 */

const https = require('https');
const dns = require('dns').promises;

class PipelineVerifier {
    constructor() {
        this.domain = 'flashfusion.co';
        this.expectedIPs = ['76.76.19.19', '76.223.126.88']; // Vercel IPs
        this.testEndpoints = [
            '/',
            '/health',
            '/api/status'
        ];
    }

    async verify() {
        console.log('🔍 Verifying FlashFusion.co Pipeline\n');
        
        const results = {
            dns: await this.checkDNS(),
            ssl: await this.checkSSL(),
            endpoints: await this.checkEndpoints(),
            performance: await this.checkPerformance()
        };
        
        this.generateReport(results);
    }

    async checkDNS() {
        console.log('1. 🌐 Checking DNS Configuration...');
        
        const dnsResults = {
            domain: this.domain,
            aRecord: null,
            cnameRecord: null,
            status: 'unknown'
        };

        try {
            // Check A record
            const aRecords = await dns.resolve4(this.domain);
            dnsResults.aRecord = aRecords[0];
            console.log(`   A Record: ${aRecords[0]}`);
            
            // Check if IP matches Vercel
            const isVercelIP = this.expectedIPs.some(ip => aRecords.includes(ip));
            if (isVercelIP) {
                dnsResults.status = 'vercel';
                console.log('   ✅ DNS points to Vercel');
            } else {
                dnsResults.status = 'other';
                console.log('   ⚠️ DNS points elsewhere');
            }
            
        } catch (error) {
            try {
                // Try CNAME
                const cnameRecords = await dns.resolveCname(this.domain);
                dnsResults.cnameRecord = cnameRecords[0];
                console.log(`   CNAME: ${cnameRecords[0]}`);
                
                if (cnameRecords[0].includes('vercel')) {
                    dnsResults.status = 'vercel';
                    console.log('   ✅ CNAME points to Vercel');
                } else {
                    dnsResults.status = 'other';
                    console.log('   ⚠️ CNAME points elsewhere');
                }
                
            } catch (cnameError) {
                console.log('   ❌ DNS resolution failed');
                dnsResults.status = 'failed';
            }
        }
        
        return dnsResults;
    }

    async checkSSL() {
        console.log('\n2. 🔒 Checking SSL Certificate...');
        
        return new Promise((resolve) => {
            const options = {
                hostname: this.domain,
                port: 443,
                path: '/',
                method: 'GET',
                rejectUnauthorized: false
            };

            const req = https.request(options, (res) => {
                const cert = res.socket.getPeerCertificate();
                
                const sslResult = {
                    valid: res.socket.authorized,
                    issuer: cert.issuer?.CN || 'Unknown',
                    validFrom: cert.valid_from,
                    validTo: cert.valid_to,
                    daysUntilExpiry: cert.valid_to ? 
                        Math.floor((new Date(cert.valid_to) - new Date()) / (1000 * 60 * 60 * 24)) : 0
                };

                if (sslResult.valid) {
                    console.log(`   ✅ SSL Certificate valid`);
                    console.log(`   Issuer: ${sslResult.issuer}`);
                    console.log(`   Expires: ${sslResult.validTo} (${sslResult.daysUntilExpiry} days)`);
                } else {
                    console.log(`   ⚠️ SSL Certificate issues detected`);
                }
                
                resolve(sslResult);
            });

            req.on('error', (error) => {
                console.log(`   ❌ SSL check failed: ${error.message}`);
                resolve({ valid: false, error: error.message });
            });

            req.setTimeout(5000, () => {
                console.log('   ❌ SSL check timeout');
                resolve({ valid: false, error: 'timeout' });
            });

            req.end();
        });
    }

    async checkEndpoints() {
        console.log('\n3. 🎯 Testing Endpoints...');
        
        const endpointResults = [];
        
        for (const endpoint of this.testEndpoints) {
            const result = await this.testEndpoint(endpoint);
            endpointResults.push(result);
            
            const status = result.status === 200 ? '✅' : '❌';
            console.log(`   ${status} ${endpoint} - ${result.status} (${result.responseTime}ms)`);
        }
        
        return endpointResults;
    }

    async testEndpoint(path) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            
            const options = {
                hostname: this.domain,
                port: 443,
                path: path,
                method: 'GET'
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        path,
                        status: res.statusCode,
                        responseTime: Date.now() - startTime,
                        headers: res.headers,
                        bodyLength: data.length
                    });
                });
            });

            req.on('error', (error) => {
                resolve({
                    path,
                    status: 0,
                    responseTime: Date.now() - startTime,
                    error: error.message
                });
            });

            req.setTimeout(10000, () => {
                resolve({
                    path,
                    status: 0,
                    responseTime: 10000,
                    error: 'timeout'
                });
            });

            req.end();
        });
    }

    async checkPerformance() {
        console.log('\n4. ⚡ Performance Test...');
        
        const performanceTest = await this.testEndpoint('/');
        
        let performanceGrade = 'F';
        let message = '';
        
        if (performanceTest.responseTime < 500) {
            performanceGrade = 'A';
            message = 'Excellent performance';
        } else if (performanceTest.responseTime < 1000) {
            performanceGrade = 'B';
            message = 'Good performance';
        } else if (performanceTest.responseTime < 2000) {
            performanceGrade = 'C';
            message = 'Average performance';
        } else if (performanceTest.responseTime < 5000) {
            performanceGrade = 'D';
            message = 'Slow performance';
        } else {
            performanceGrade = 'F';
            message = 'Very slow performance';
        }
        
        console.log(`   Grade: ${performanceGrade} - ${message} (${performanceTest.responseTime}ms)`);
        
        return {
            responseTime: performanceTest.responseTime,
            grade: performanceGrade,
            message
        };
    }

    generateReport(results) {
        console.log('\n📊 PIPELINE VERIFICATION REPORT\n');
        
        // DNS Status
        console.log('🌐 DNS Configuration:');
        if (results.dns.status === 'vercel') {
            console.log('   ✅ Properly configured for Vercel');
        } else if (results.dns.status === 'other') {
            console.log('   ⚠️ Points to different service');
        } else {
            console.log('   ❌ DNS configuration issues');
        }
        
        // SSL Status
        console.log('\n🔒 SSL Certificate:');
        if (results.ssl.valid) {
            console.log('   ✅ Valid and secure');
        } else {
            console.log('   ❌ SSL issues detected');
        }
        
        // Endpoints Status
        console.log('\n🎯 Endpoint Health:');
        const workingEndpoints = results.endpoints.filter(e => e.status === 200).length;
        const totalEndpoints = results.endpoints.length;
        console.log(`   ${workingEndpoints}/${totalEndpoints} endpoints working`);
        
        if (workingEndpoints === totalEndpoints) {
            console.log('   ✅ All endpoints operational');
        } else {
            console.log('   ⚠️ Some endpoints have issues');
        }
        
        // Performance
        console.log('\n⚡ Performance:');
        console.log(`   ${results.performance.grade} - ${results.performance.message}`);
        
        // Overall Status
        console.log('\n🎯 OVERALL PIPELINE STATUS:');
        
        const dnsOk = results.dns.status === 'vercel';
        const sslOk = results.ssl.valid;
        const endpointsOk = workingEndpoints === totalEndpoints;
        const performanceOk = results.performance.responseTime < 2000;
        
        if (dnsOk && sslOk && endpointsOk && performanceOk) {
            console.log('   🎉 PIPELINE FULLY OPERATIONAL');
            console.log('   ✅ You → Claude → Git → Vercel → GoDaddy → FlashFusion.co');
        } else {
            console.log('   ⚠️ PIPELINE NEEDS ATTENTION');
            if (!dnsOk) console.log('   - Fix DNS configuration');
            if (!sslOk) console.log('   - Fix SSL certificate');
            if (!endpointsOk) console.log('   - Fix failing endpoints');
            if (!performanceOk) console.log('   - Improve performance');
        }
        
        console.log(`\n🌐 Test your site: https://${this.domain}`);
    }
}

// Run verification
const verifier = new PipelineVerifier();
verifier.verify().catch(console.error);