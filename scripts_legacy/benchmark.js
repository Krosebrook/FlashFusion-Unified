// =====================================================
// FLASHFUSION BENCHMARK SUITE
// Performance testing for orchestration system
// =====================================================

const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = process.env.FLASHFUSION_URL || 'http://localhost:3000';

class FlashFusionBenchmark {
  constructor() {
    this.results = {
      health_check: [],
      status_check: [],
      agent_analysis: [],
      quickstart: [],
      concurrent_requests: []
    };
  }

  async runBenchmarks() {
    console.log('🚀 FlashFusion Orchestration System Benchmark Suite');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      await this.benchmarkHealthCheck();
      await this.benchmarkStatusCheck();
      await this.benchmarkAgentAnalysis();
      await this.benchmarkQuickStart();
      await this.benchmarkConcurrentRequests();
      
      this.generateReport();
    } catch (error) {
      console.error('❌ Benchmark failed:', error.message);
    }
  }

  async benchmarkHealthCheck() {
    console.log('\n🔍 Benchmarking Health Check...');
    
    for (let i = 0; i < 10; i++) {
      const start = performance.now();
      
      try {
        await axios.get(`${BASE_URL}/health`);
        const duration = performance.now() - start;
        this.results.health_check.push(duration);
        process.stdout.write('✅');
      } catch (error) {
        process.stdout.write('❌');
      }
    }
    
    const avg = this.results.health_check.reduce((a, b) => a + b, 0) / this.results.health_check.length;
    console.log(`\n   Average: ${avg.toFixed(2)}ms`);
  }

  async benchmarkStatusCheck() {
    console.log('\n📊 Benchmarking Status Check...');
    
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      
      try {
        await axios.get(`${BASE_URL}/api/orchestration/status`);
        const duration = performance.now() - start;
        this.results.status_check.push(duration);
        process.stdout.write('✅');
      } catch (error) {
        process.stdout.write('❌');
      }
    }
    
    const avg = this.results.status_check.reduce((a, b) => a + b, 0) / this.results.status_check.length;
    console.log(`\n   Average: ${avg.toFixed(2)}ms`);
  }

  async benchmarkAgentAnalysis() {
    console.log('\n🤖 Benchmarking Agent Analysis...');
    
    const testCases = [
      'Build a mobile e-commerce app with AI recommendations',
      'Create a web-based project management tool',
      'Develop a real-time chat application',
      'Design a data analytics dashboard',
      'Build a social media platform'
    ];

    for (const testCase of testCases) {
      const start = performance.now();
      
      try {
        await axios.post(`${BASE_URL}/api/orchestration/agents/analyze`, {
          description: testCase,
          priority: Math.floor(Math.random() * 10) + 1
        });
        const duration = performance.now() - start;
        this.results.agent_analysis.push(duration);
        process.stdout.write('✅');
      } catch (error) {
        process.stdout.write('❌');
      }
    }
    
    const avg = this.results.agent_analysis.reduce((a, b) => a + b, 0) / this.results.agent_analysis.length;
    console.log(`\n   Average: ${avg.toFixed(2)}ms`);
  }

  async benchmarkQuickStart() {
    console.log('\n⚡ Benchmarking Quick Start...');
    
    const testProjects = [
      'Simple todo list app',
      'Basic calculator web app',
      'Weather forecast application'
    ];

    for (const project of testProjects) {
      const start = performance.now();
      
      try {
        await axios.post(`${BASE_URL}/api/orchestration/quickstart`, {
          description: project
        });
        const duration = performance.now() - start;
        this.results.quickstart.push(duration);
        process.stdout.write('✅');
      } catch (error) {
        // Expected to fail without API keys, but we measure response time
        const duration = performance.now() - start;
        this.results.quickstart.push(duration);
        process.stdout.write('⚠️ ');
      }
    }
    
    const avg = this.results.quickstart.reduce((a, b) => a + b, 0) / this.results.quickstart.length;
    console.log(`\n   Average: ${avg.toFixed(2)}ms`);
  }

  async benchmarkConcurrentRequests() {
    console.log('\n🔄 Benchmarking Concurrent Requests...');
    
    const concurrentCount = 5;
    const promises = [];
    const start = performance.now();

    for (let i = 0; i < concurrentCount; i++) {
      promises.push(
        axios.get(`${BASE_URL}/health`).catch(() => {})
      );
    }

    await Promise.all(promises);
    const duration = performance.now() - start;
    this.results.concurrent_requests.push(duration);
    
    console.log(`   ${concurrentCount} concurrent requests: ${duration.toFixed(2)}ms`);
  }

  generateReport() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 BENCHMARK RESULTS SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const categories = [
      { name: 'Health Check', key: 'health_check', target: 50 },
      { name: 'Status Check', key: 'status_check', target: 200 },
      { name: 'Agent Analysis', key: 'agent_analysis', target: 500 },
      { name: 'Quick Start', key: 'quickstart', target: 1000 }
    ];

    categories.forEach(category => {
      const results = this.results[category.key];
      if (results.length > 0) {
        const avg = results.reduce((a, b) => a + b, 0) / results.length;
        const min = Math.min(...results);
        const max = Math.max(...results);
        const status = avg <= category.target ? '✅' : '⚠️ ';
        
        console.log(`\n${status} ${category.name}:`);
        console.log(`   Average: ${avg.toFixed(2)}ms (target: <${category.target}ms)`);
        console.log(`   Min: ${min.toFixed(2)}ms`);
        console.log(`   Max: ${max.toFixed(2)}ms`);
        console.log(`   Requests: ${results.length}`);
      }
    });

    console.log('\n💡 Performance Recommendations:');
    
    const healthAvg = this.results.health_check.reduce((a, b) => a + b, 0) / this.results.health_check.length;
    const statusAvg = this.results.status_check.reduce((a, b) => a + b, 0) / this.results.status_check.length;
    
    if (healthAvg > 50) {
      console.log('   - Consider optimizing health check endpoint');
    }
    if (statusAvg > 200) {
      console.log('   - Status endpoint may benefit from caching');
    }
    if (this.results.agent_analysis.some(t => t > 1000)) {
      console.log('   - Agent analysis could be optimized for complex requests');
    }
    
    console.log('\n🎯 Overall Performance: ' + 
      (healthAvg <= 50 && statusAvg <= 200 ? 'EXCELLENT ✅' : 'GOOD ⚠️ '));
  }
}

// Run benchmarks if called directly
if (require.main === module) {
  const benchmark = new FlashFusionBenchmark();
  benchmark.runBenchmarks().catch(console.error);
}

module.exports = FlashFusionBenchmark;