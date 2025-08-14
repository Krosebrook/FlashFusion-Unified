#!/usr/bin/env node

// 🧠 LYRA CLI - Command line interface for LYRA agent

const readline = require('readline');
const LyraAgent = require('./lyra-agent');
const LyraAnalyzers = require('./analyzers');

class LyraCLI {
  constructor() {
    this.lyra = new LyraAgent();
    this.analyzers = new LyraAnalyzers();
    
    // Inject analyzers into agent
    this.lyra.analyzers = this.analyzers;
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '🧠 LYRA > '
    });

    this.setupCommands();
  }

  setupCommands() {
    this.commands = {
      '/help': () => this.showHelp(),
      '/modes': () => this.showModes(),
      '/exit': () => this.exit(),
      '/clear': () => this.clear()
    };
  }

  start() {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🧠 LYRA AGENT v1.0.0                      ║
║         Strategic Multimodal Agent & Problem Mapper          ║
╚══════════════════════════════════════════════════════════════╝

Welcome! I'm LYRA - I think across disciplines, connect hidden dots, 
and generate actionable strategies.

Type /help for commands or just start talking to me.
    `);

    this.rl.prompt();

    this.rl.on('line', async (line) => {
      const input = line.trim();

      if (input.startsWith('/')) {
        // Handle commands
        if (this.commands[input]) {
          this.commands[input]();
        } else {
          console.log(`Unknown command: ${input}. Type /help for available commands.`);
        }
      } else if (input) {
        // Process natural language input
        await this.processInput(input);
      }

      this.rl.prompt();
    });

    this.rl.on('close', () => {
      this.exit();
    });
  }

  async processInput(input) {
    // Detect mode from input
    const mode = this.detectMode(input);
    
    if (mode) {
      console.log(`\n🔄 Running ${mode} analysis...\n`);
      
      try {
        // Execute the analysis
        const result = await this.executeMode(mode, input);
        this.displayResult(result);
      } catch (error) {
        console.error(`❌ Error: ${error.message}`);
      }
    } else {
      // Default to IDEA_BURNER if no specific mode detected
      console.log("\n🔄 Running IDEA_BURNER analysis...\n");
      
      try {
        const result = await this.executeMode('IDEA_BURNER', input);
        this.displayResult(result);
      } catch (error) {
        console.error(`❌ Error: ${error.message}`);
      }
    }
  }

  detectMode(input) {
    const lowerInput = input.toLowerCase();
    
    // Check for mode triggers
    for (const [mode, config] of Object.entries(this.lyra.modes)) {
      if (lowerInput.includes(config.trigger.toLowerCase())) {
        return mode;
      }
    }

    // Check for specific keywords
    if (lowerInput.includes('break') && lowerInput.includes('down')) {
      return 'SYSTEMS_MAP';
    }
    if (lowerInput.includes('mvp') || lowerInput.includes('minimum') || lowerInput.includes('smallest')) {
      return 'MVP_RUN';
    }
    if (lowerInput.includes('blueprint') || lowerInput.includes('structure')) {
      return 'STRUCTURE';
    }
    if (lowerInput.includes('why') && lowerInput.includes('care')) {
      return 'PSYCH_DEPTH';
    }
    if (lowerInput.includes('loop') || lowerInput.includes('feedback')) {
      return 'LOOP_TEST';
    }
    if (lowerInput.includes('integrate') || lowerInput.includes('work with')) {
      return 'STACK_SYNC';
    }

    return null;
  }

  async executeMode(mode, input) {
    // For now, return mock results
    // In real implementation, this would call the actual analysis methods
    
    const mockResults = {
      SYSTEMS_MAP: {
        mode: 'SYSTEMS_MAP',
        output: {
          overview: `System Analysis of: "${input.substring(0, 50)}..."`,
          diagram: `graph TD
    A[User Input] --> B[Processing]
    B --> C[Analysis]
    C --> D[Output]
    B --> E[Validation]
    E --> C`,
          criticalPaths: ['Input → Processing → Output'],
          bottlenecks: ['Processing stage needs optimization'],
          recommendations: ['Consider parallel processing', 'Add caching layer']
        }
      },
      IDEA_BURNER: {
        mode: 'IDEA_BURNER',
        output: {
          teardown: [
            `Assumption detected: "${this.extractFirstAssumption(input)}"`,
            'Missing validation step between concept and implementation',
            'No clear success metrics defined'
          ],
          reconstruction: 'Start with defining clear success metrics, then work backwards',
          questions: [
            'What happens if the main assumption is wrong?',
            'How does this scale beyond 100 users?',
            'What are the dependencies we haven\'t considered?'
          ],
          blindspots: ['Technical debt accumulation', 'User adoption curve'],
          strengthened: 'Enhanced version with validation gates and clear metrics'
        }
      },
      STRUCTURE: {
        mode: 'STRUCTURE',
        output: {
          framework: {
            layers: ['Presentation', 'Business Logic', 'Data Access'],
            components: ['UI Components', 'Services', 'Repositories']
          },
          sequence: '1. Data Layer → 2. Business Logic → 3. API → 4. Frontend',
          architecture: 'Suggested: Microservices with event-driven communication',
          modules: ['Auth Module', 'Core Module', 'Analytics Module'],
          integration: 'Use message queue for loose coupling between services'
        }
      },
      MVP_RUN: {
        mode: 'MVP_RUN',
        output: {
          fakeDoorTest: 'Landing page with signup form to gauge interest',
          prototype: {
            week1: 'Basic UI mockup',
            week2: 'Core functionality demo',
            week3: 'User testing'
          },
          validationPlan: 'A/B test with 100 users, measure engagement',
          pivotPoints: ['Low signup rate', 'Feature not used as expected'],
          successCriteria: '10% conversion rate, 50% daily active users'
        }
      },
      PSYCH_DEPTH: {
        mode: 'PSYCH_DEPTH',
        output: {
          drivers: ['Need for efficiency', 'Fear of missing out', 'Desire for control'],
          misalignments: 'Solution complexity vs user desire for simplicity',
          emotionalMap: 'Frustration → Solution → Relief → Satisfaction',
          recommendations: 'Simplify onboarding, focus on immediate value',
          reframe: 'Position as "peace of mind" rather than "powerful tool"'
        }
      },
      LOOP_TEST: {
        mode: 'LOOP_TEST',
        output: {
          loopMap: 'User Action → System Response → User Feedback → System Adaptation',
          vulnerabilities: ['Infinite loop if validation fails repeatedly'],
          stabilizers: ['Add circuit breaker pattern', 'Implement backoff strategy'],
          scenarios: ['Happy path', 'Error recovery', 'Edge cases'],
          fixes: 'Add timeout and retry limits to all loops'
        }
      },
      STACK_SYNC: {
        mode: 'STACK_SYNC',
        output: {
          integrationPlan: 'Phase 1: API integration, Phase 2: Data sync, Phase 3: Full migration',
          adapters: ['REST to GraphQL adapter', 'Legacy DB connector'],
          migrations: ['User data migration script', 'Settings transfer tool'],
          testing: 'Integration tests for each adapter, end-to-end validation',
          rollback: 'Snapshot before migration, dual-write during transition'
        }
      }
    };

    return mockResults[mode] || mockResults.IDEA_BURNER;
  }

  extractFirstAssumption(input) {
    const assumptions = ['users will', 'it should', 'probably', 'assuming'];
    for (const assumption of assumptions) {
      if (input.toLowerCase().includes(assumption)) {
        const index = input.toLowerCase().indexOf(assumption);
        return input.substring(index, Math.min(index + 50, input.length));
      }
    }
    return 'implicit assumption about user behavior';
  }

  displayResult(result) {
    console.log('═'.repeat(60));
    console.log(`📊 ${result.mode} Analysis Complete`);
    console.log('═'.repeat(60));

    // Display based on mode
    this.formatOutput(result.output);
    
    console.log('═'.repeat(60));
  }

  formatOutput(output) {
    for (const [key, value] of Object.entries(output)) {
      console.log(`\n🔹 ${this.formatKey(key)}:`);
      
      if (typeof value === 'string') {
        console.log(`   ${value}`);
      } else if (Array.isArray(value)) {
        value.forEach(item => console.log(`   • ${item}`));
      } else if (typeof value === 'object') {
        console.log(this.formatObject(value, '   '));
      }
    }
  }

  formatKey(key) {
    // Convert camelCase to Title Case
    return key.replace(/([A-Z])/g, ' $1').trim()
      .replace(/^./, str => str.toUpperCase());
  }

  formatObject(obj, indent = '') {
    let result = '';
    for (const [key, value] of Object.entries(obj)) {
      result += `${indent}${key}: ${value}\n`;
    }
    return result;
  }

  showHelp() {
    console.log(`
🧠 LYRA Commands:
═══════════════════════════════════════════════════════════════
/help     - Show this help message
/modes    - List all available analysis modes
/clear    - Clear the screen
/exit     - Exit LYRA

Natural Language Triggers:
• "Break this down" → SYSTEMS_MAP
• "Interrogate this idea" → IDEA_BURNER  
• "Turn this into a blueprint" → STRUCTURE
• "What's the smallest test?" → MVP_RUN
• "Why do I care?" → PSYCH_DEPTH
• "What breaks the loop?" → LOOP_TEST
• "Make this work with X" → STACK_SYNC

Just type your idea or paste your concept, and I'll analyze it!
═══════════════════════════════════════════════════════════════
    `);
  }

  showModes() {
    console.log('\n🧠 LYRA Analysis Modes:');
    console.log('═══════════════════════════════════════════════════════════════');
    
    for (const [mode, config] of Object.entries(this.lyra.modes)) {
      console.log(`\n${mode}:`);
      console.log(`  Trigger: "${config.trigger}"`);
      console.log(`  Purpose: ${config.description}`);
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════');
  }

  clear() {
    console.clear();
    console.log('🧠 LYRA > Screen cleared');
  }

  exit() {
    console.log('\n👋 Thanks for using LYRA! Stay strategic.\n');
    process.exit(0);
  }
}

// Start CLI if run directly
if (require.main === module) {
  const cli = new LyraCLI();
  cli.start();
}

module.exports = LyraCLI;