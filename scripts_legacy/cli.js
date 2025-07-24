#!/usr/bin/env node

// =====================================================
// FLASHFUSION CLI - Command Line Interface
// Manage orchestration system from command line
// =====================================================

const { program } = require('commander');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = process.env.FLASHFUSION_URL || 'http://localhost:3000';

program
  .name('flashfusion')
  .description('FlashFusion Digital Product Orchestration CLI')
  .version('1.0.0');

// Status command
program
  .command('status')
  .description('Check system status and health')
  .action(async () => {
    try {
      console.log('🔍 Checking FlashFusion system status...\n');
      
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ System Health:', healthResponse.data.status);
      console.log('   Uptime:', Math.round(healthResponse.data.uptime), 'seconds');
      console.log('   Memory:', Math.round(healthResponse.data.memory.rss / 1024 / 1024), 'MB');
      
      const orchResponse = await axios.get(`${BASE_URL}/api/orchestration/status`);
      if (orchResponse.data.success) {
        console.log('\n🎭 Orchestration Status:', orchResponse.data.data.system.status);
        console.log('   AI Services:', orchResponse.data.data.system.ai_services.status);
        console.log('   Active Workflows:', orchResponse.data.data.system.active_workflows);
      }
      
    } catch (error) {
      console.error('❌ Failed to get status:', error.message);
      process.exit(1);
    }
  });

// Create project command
program
  .command('create')
  .description('Create a new product development project')
  .requiredOption('-d, --description <description>', 'Project description')
  .option('-p, --priority <priority>', 'Priority (1-10)', '5')
  .option('--platform <platform>', 'Platform (web, mobile, desktop)', 'web')
  .option('--audience <audience>', 'Target audience')
  .option('--budget <budget>', 'Budget level (low, medium, high)', 'medium')
  .option('--timeline <timeline>', 'Timeline (fast, standard, flexible)', 'standard')
  .action(async (options) => {
    try {
      console.log('🚀 Creating new project...\n');
      
      const projectData = {
        description: options.description,
        priority: parseInt(options.priority),
        platform: options.platform,
        targetAudience: options.audience,
        budget: options.budget,
        timeline: options.timeline
      };
      
      const response = await axios.post(`${BASE_URL}/api/orchestration/projects`, projectData);
      
      if (response.data.success) {
        console.log('✅ Project created successfully!');
        console.log('   Project ID:', response.data.data.projectId);
        console.log('   Agents:', response.data.data.agents.join(', '));
        console.log('   Results:', response.data.data.results.length, 'agent responses');
      } else {
        console.error('❌ Project creation failed');
      }
      
    } catch (error) {
      console.error('❌ Failed to create project:', error.response?.data?.details || error.message);
      process.exit(1);
    }
  });

// Quick start command
program
  .command('quickstart')
  .description('Quick start a project with minimal configuration')
  .requiredOption('-d, --description <description>', 'Project description')
  .action(async (options) => {
    try {
      console.log('⚡ Quick starting project...\n');
      
      const response = await axios.post(`${BASE_URL}/api/orchestration/quickstart`, {
        description: options.description
      });
      
      if (response.data.success) {
        console.log('✅ Quick start completed!');
        console.log('   Project ID:', response.data.data.projectId);
        console.log('   Agents Used:', response.data.data.agents.join(', '));
      }
      
    } catch (error) {
      console.error('❌ Quick start failed:', error.response?.data?.details || error.message);
    }
  });

// List projects command
program
  .command('projects')
  .description('List all active workflows and projects')
  .action(async () => {
    try {
      console.log('📋 Active workflows and projects:\n');
      
      const response = await axios.get(`${BASE_URL}/api/orchestration/workflows`);
      
      if (response.data.success) {
        const workflows = response.data.data.workflows;
        const analytics = response.data.data.analytics;
        
        console.log('📊 Analytics:');
        console.log('   Total Workflows:', analytics.totalWorkflows);
        console.log('   Average Progress:', analytics.averageProgress + '%');
        
        console.log('\n🔄 Active Workflows:');
        workflows.forEach(workflow => {
          console.log(`   ${workflow.projectId}`);
          console.log(`     Phase: ${workflow.currentPhase}`);
          console.log(`     Progress: ${workflow.overallProgress}%`);
          console.log(`     Status: ${workflow.status}`);
        });
      }
      
    } catch (error) {
      console.error('❌ Failed to list projects:', error.message);
    }
  });

// Agents command
program
  .command('agents')
  .description('Show agent status and capabilities')
  .action(async () => {
    try {
      console.log('🤖 Agent Status and Capabilities:\n');
      
      const response = await axios.get(`${BASE_URL}/api/orchestration/agents/roles`);
      
      if (response.data.success) {
        response.data.data.forEach(agent => {
          console.log(`${agent.name}`);
          console.log(`   Priority: ${agent.priority}`);
          console.log(`   Capabilities: ${agent.capabilities.join(', ')}`);
          console.log(`   Description: ${agent.description}`);
          console.log('');
        });
      }
      
    } catch (error) {
      console.error('❌ Failed to get agent info:', error.message);
    }
  });

// Analyze command
program
  .command('analyze')
  .description('Analyze a project description and get agent recommendations')
  .requiredOption('-d, --description <description>', 'Project description to analyze')
  .option('-p, --priority <priority>', 'Priority (1-10)', '5')
  .action(async (options) => {
    try {
      console.log('🔍 Analyzing project requirements...\n');
      
      const response = await axios.post(`${BASE_URL}/api/orchestration/agents/analyze`, {
        description: options.description,
        priority: parseInt(options.priority)
      });
      
      if (response.data.success) {
        const analysis = response.data.data.analysis;
        const agents = response.data.data.selectedAgents;
        
        console.log('📊 Analysis Results:');
        console.log('   Complexity:', analysis.complexity);
        console.log('   Urgency:', analysis.urgency + '/10');
        console.log('   Estimated Effort:', analysis.estimatedEffort, 'hours');
        console.log('   Required Capabilities:', analysis.requiredCapabilities.join(', '));
        
        console.log('\n🎭 Recommended Agents:');
        agents.forEach(agent => {
          console.log(`   ${agent.role} (${agent.capability})`);
          console.log(`     Priority: ${agent.priority}`);
          console.log(`     Load: ${agent.estimatedLoad.toFixed(1)}`);
        });
        
        console.log('\n💡 Reasoning:', analysis.reasoning);
      }
      
    } catch (error) {
      console.error('❌ Analysis failed:', error.response?.data?.details || error.message);
    }
  });

// Monitor command
program
  .command('monitor')
  .description('Show performance monitoring and alerts')
  .action(async () => {
    try {
      console.log('📈 Performance Monitoring:\n');
      
      const perfResponse = await axios.get(`${BASE_URL}/api/orchestration/performance`);
      const alertsResponse = await axios.get(`${BASE_URL}/api/orchestration/performance/alerts`);
      
      if (perfResponse.data.success) {
        const data = perfResponse.data.data;
        
        console.log('🖥️  System Metrics:');
        console.log('   Uptime:', Math.round(data.system.uptime), 'seconds');
        console.log('   Memory:', data.system.memory.latest || 'N/A');
        console.log('   Event Loop Lag:', data.system.eventLoopLag.latest || 'N/A', 'ms');
        
        console.log('\n🤖 Agent Performance:');
        console.log('   Average Response:', data.agents.performance.avg || 'N/A', 'ms');
        console.log('   Error Count:', data.agents.errors.count || 0);
        
        console.log('\n🔄 Handoff Performance:');
        console.log('   Average Duration:', data.handoffs.performance.avg || 'N/A', 'ms');
        console.log('   Failure Count:', data.handoffs.failures.count || 0);
      }
      
      if (alertsResponse.data.success) {
        const alerts = alertsResponse.data.data;
        console.log('\n🚨 Active Alerts:', alerts.length);
        alerts.forEach(alert => {
          console.log(`   ${alert.level.toUpperCase()}: ${alert.metric} = ${alert.value}`);
        });
      }
      
    } catch (error) {
      console.error('❌ Failed to get monitoring data:', error.message);
    }
  });

program.parse();