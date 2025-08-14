// 🧠 LYRA Analyzers - Core analysis functions

class LyraAnalyzers {
  constructor() {
    this.patterns = {
      assumptions: [
        /assuming/i,
        /probably/i,
        /should/i,
        /might/i,
        /likely/i,
        /expect/i
      ],
      systems: [
        /database/i,
        /api/i,
        /frontend/i,
        /backend/i,
        /service/i,
        /component/i,
        /module/i
      ],
      actors: [
        /user/i,
        /admin/i,
        /system/i,
        /client/i,
        /server/i,
        /developer/i
      ]
    };
  }

  // Extract assumptions from text
  extractAssumptions(input) {
    const assumptions = [];
    const lines = input.split('\n');
    
    lines.forEach(line => {
      this.patterns.assumptions.forEach(pattern => {
        if (pattern.test(line)) {
          assumptions.push({
            text: line.trim(),
            type: 'implicit',
            confidence: this.calculateConfidence(line)
          });
        }
      });
    });

    // Look for unstated assumptions
    const unstated = this.findUnstatedAssumptions(input);
    
    return [...assumptions, ...unstated];
  }

  // Find logic gaps in reasoning
  findLogicGaps(input) {
    const gaps = [];
    
    // Check for missing steps
    const steps = this.extractSteps(input);
    steps.forEach((step, index) => {
      if (index > 0) {
        const connection = this.analyzeConnection(steps[index - 1], step);
        if (connection.strength < 0.5) {
          gaps.push({
            between: [steps[index - 1], step],
            type: 'missing_link',
            severity: 'high'
          });
        }
      }
    });

    // Check for circular logic
    const circular = this.detectCircularLogic(input);
    gaps.push(...circular);

    return gaps;
  }

  // Identify weak points in the concept
  identifyWeakPoints(input) {
    const weakPoints = [];
    
    // Single points of failure
    const spof = this.findSinglePointsOfFailure(input);
    weakPoints.push(...spof.map(p => ({
      type: 'single_point_of_failure',
      component: p,
      severity: 'critical'
    })));

    // Scalability issues
    const scalability = this.analyzeScalability(input);
    if (scalability.issues.length > 0) {
      weakPoints.push(...scalability.issues);
    }

    // Security vulnerabilities
    const security = this.analyzeSecurityWeakness(input);
    weakPoints.push(...security);

    return weakPoints;
  }

  // Extract core value proposition
  extractCoreValue(input) {
    // Identify what problem is being solved
    const problems = this.extractProblems(input);
    const solutions = this.extractSolutions(input);
    
    return {
      problem: problems[0] || 'Undefined problem',
      solution: solutions[0] || 'Undefined solution',
      uniqueValue: this.identifyUniqueValue(input),
      targetAudience: this.identifyTargetAudience(input)
    };
  }

  // Define minimal features for MVP
  defineMinimalFeatures(input) {
    const allFeatures = this.extractFeatures(input);
    const coreValue = this.extractCoreValue(input);
    
    // Rank features by how essential they are to core value
    const ranked = allFeatures.map(feature => ({
      ...feature,
      essentiality: this.calculateEssentiality(feature, coreValue)
    })).sort((a, b) => b.essentiality - a.essentiality);

    // Take top essential features
    return ranked.filter(f => f.essentiality > 0.7).slice(0, 3);
  }

  // Identify feedback loops
  identifyFeedbackLoops(input) {
    const loops = [];
    const components = this.extractComponents(input);
    
    // Find components that reference each other
    components.forEach((comp1, i) => {
      components.forEach((comp2, j) => {
        if (i !== j) {
          const connection1to2 = this.findConnection(comp1, comp2, input);
          const connection2to1 = this.findConnection(comp2, comp1, input);
          
          if (connection1to2 && connection2to1) {
            loops.push({
              components: [comp1, comp2],
              type: this.classifyLoop(connection1to2, connection2to1),
              strength: (connection1to2.strength + connection2to1.strength) / 2
            });
          }
        }
      });
    });

    return loops;
  }

  // Helper methods
  calculateConfidence(text) {
    // Simple confidence based on hedging words
    const hedgeWords = ['might', 'maybe', 'possibly', 'could', 'perhaps'];
    const wordCount = text.split(' ').length;
    const hedgeCount = hedgeWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    
    return 1 - (hedgeCount / wordCount);
  }

  findUnstatedAssumptions(input) {
    const unstated = [];
    
    // Common unstated assumptions
    if (input.includes('user') && !input.includes('internet')) {
      unstated.push({
        text: 'Assumes users have reliable internet connection',
        type: 'unstated',
        confidence: 0.8
      });
    }
    
    if (input.includes('scale') && !input.includes('infrastructure')) {
      unstated.push({
        text: 'Assumes infrastructure can handle scaling',
        type: 'unstated',
        confidence: 0.7
      });
    }

    return unstated;
  }

  extractSteps(input) {
    // Extract logical steps or process steps
    const stepPatterns = [
      /\d+\./g,
      /first/i,
      /then/i,
      /next/i,
      /finally/i,
      /after/i
    ];
    
    const steps = [];
    const lines = input.split('\n');
    
    lines.forEach(line => {
      stepPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          steps.push(line.trim());
        }
      });
    });

    return steps;
  }

  analyzeConnection(step1, step2) {
    // Analyze logical connection between steps
    const sharedWords = this.findSharedWords(step1, step2);
    const semanticSimilarity = sharedWords.length / 
      Math.max(step1.split(' ').length, step2.split(' ').length);
    
    return {
      strength: semanticSimilarity,
      type: semanticSimilarity > 0.3 ? 'strong' : 'weak'
    };
  }

  findSharedWords(text1, text2) {
    const words1 = text1.toLowerCase().split(' ');
    const words2 = text2.toLowerCase().split(' ');
    
    return words1.filter(word => words2.includes(word));
  }

  detectCircularLogic(input) {
    // Simple circular logic detection
    const statements = input.split('.').map(s => s.trim());
    const circular = [];
    
    statements.forEach((stmt1, i) => {
      statements.forEach((stmt2, j) => {
        if (i < j && this.isCircular(stmt1, stmt2)) {
          circular.push({
            statements: [stmt1, stmt2],
            type: 'circular_reasoning',
            severity: 'high'
          });
        }
      });
    });

    return circular;
  }

  isCircular(stmt1, stmt2) {
    // Check if statements reference each other circularly
    const words1 = stmt1.toLowerCase().split(' ');
    const words2 = stmt2.toLowerCase().split(' ');
    
    // Simple check: if they share significant words and seem to define each other
    const shared = this.findSharedWords(stmt1, stmt2);
    return shared.length > Math.min(words1.length, words2.length) * 0.5;
  }

  extractComponents(input) {
    const components = new Set();
    
    this.patterns.systems.forEach(pattern => {
      const matches = input.match(new RegExp(`\\w*${pattern.source}\\w*`, 'gi'));
      if (matches) {
        matches.forEach(match => components.add(match));
      }
    });

    return Array.from(components);
  }

  findConnection(comp1, comp2, input) {
    // Find if comp1 connects to comp2 in the text
    const sentences = input.split(/[.!?]/);
    
    for (const sentence of sentences) {
      if (sentence.includes(comp1) && sentence.includes(comp2)) {
        // Found connection
        const actionWords = ['sends', 'calls', 'uses', 'connects', 'triggers'];
        const hasAction = actionWords.some(word => sentence.includes(word));
        
        return {
          exists: true,
          strength: hasAction ? 0.8 : 0.5,
          type: hasAction ? 'active' : 'passive'
        };
      }
    }
    
    return null;
  }

  classifyLoop(connection1, connection2) {
    if (connection1.strength > 0.7 && connection2.strength > 0.7) {
      return 'reinforcing';
    } else if (connection1.strength < 0.3 || connection2.strength < 0.3) {
      return 'balancing';
    }
    return 'neutral';
  }
}

module.exports = LyraAnalyzers;