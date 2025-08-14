import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LyraState, AnalysisResult, AnalysisRecord } from './types';

export const useLyraStore = create<LyraState>()(
  persist(
    (set, get) => ({
      selectedMode: null,
      isProcessing: false,
      results: null,
      analysisCount: 0,
      history: [],

      setSelectedMode: (mode) => set({ selectedMode: mode }),

      runAnalysis: async (input) => {
        const { selectedMode } = get()
        if (!selectedMode) return

        set({ isProcessing: true })

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Mock results based on mode
          const mockResults = generateMockResults(selectedMode, input);
          
          const analysisRecord: AnalysisRecord = {
            id: Date.now().toString(),
            mode: selectedMode,
            input,
            results: mockResults,
            timestamp: Date.now()
          };

          set(state => ({
            results: mockResults,
            analysisCount: state.analysisCount + 1,
            history: [analysisRecord, ...state.history.slice(0, 9)], // Keep last 10
            isProcessing: false
          }));
        } catch (error) {
          console.error('Analysis failed:', error);
          set({ isProcessing: false });
        }
      },

      clearResults: () => set({ results: null })
    }),
    {
      name: 'lyra-store',
      partialize: (state) => ({
        analysisCount: state.analysisCount,
        history: state.history
      })
    }
  )
)

function generateMockResults(mode: string, input: string): AnalysisResult {
  const mockResults = {
    SYSTEMS_MAP: {
      mode: 'SYSTEMS_MAP',
      timestamp: new Date().toISOString(),
      output: {
        overview: `System analysis of: "${input.substring(0, 50)}..."`,
        criticalPaths: ['Input → Processing → Output', 'Auth → Validation → Response'],
        bottlenecks: ['Database queries', 'External API calls', 'Image processing'],
        recommendations: [
          'Implement caching layer',
          'Add database indexing',
          'Use CDN for static assets',
          'Consider microservices architecture'
        ]
      },
      diagram: `graph TD
    A[User Input] --> B[API Gateway]
    B --> C[Authentication]
    C --> D[Business Logic]
    D --> E[Database]
    D --> F[External APIs]
    E --> G[Response]
    F --> G
    G --> H[User Interface]
    
    style A fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#fff
    style B fill:#14B8A6,stroke:#0D9488,stroke-width:2px,color:#fff
    style C fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff
    style D fill:#3B82F6,stroke:#2563EB,stroke-width:2px,color:#fff
    style E fill:#EF4444,stroke:#DC2626,stroke-width:2px,color:#fff
    style F fill:#EC4899,stroke:#DB2777,stroke-width:2px,color:#fff
    style G fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff
    style H fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#fff`
    },

    IDEA_BURNER: {
      mode: 'IDEA_BURNER',
      timestamp: new Date().toISOString(),
      output: {
        teardown: [
          'Assumption: Users want more features (but they want simplicity)',
          'Logic gap: No clear monetization strategy defined',
          'Missing: Competitive analysis and differentiation',
          'Flaw: Underestimating implementation complexity'
        ],
        reconstruction: 'Start with single core feature, validate, then expand',
        questions: [
          'What happens if main assumption is wrong?',
          'How does this scale beyond 1000 users?',
          'What are dependencies we haven\'t considered?',
          'Who else is solving this problem?'
        ],
        blindspots: [
          'Technical debt accumulation',
          'User acquisition cost',
          'Regulatory compliance',
          'Team scaling challenges'
        ],
        strengthened: 'Refocus on core value prop with clear validation metrics'
      },
      diagram: `graph TD
    A[Original Idea] --> B{Critical Questions}
    B --> C[Assumption Testing]
    B --> D[Logic Validation]
    B --> E[Gap Analysis]
    C --> F[Strengthened Concept]
    D --> F
    E --> F
    F --> G[Implementation Plan]
    
    style A fill:#EF4444,stroke:#DC2626,stroke-width:2px,color:#fff
    style B fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff
    style C fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#fff
    style D fill:#3B82F6,stroke:#2563EB,stroke-width:2px,color:#fff
    style E fill:#EC4899,stroke:#DB2777,stroke-width:2px,color:#fff
    style F fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff
    style G fill:#14B8A6,stroke:#0D9488,stroke-width:2px,color:#fff`
    },

    STRUCTURE: {
      mode: 'STRUCTURE',
      timestamp: new Date().toISOString(),
      output: {
        framework: {
          layers: ['Presentation Layer', 'Business Logic Layer', 'Data Access Layer'],
          components: ['UI Components', 'Services', 'Repositories', 'Models']
        },
        sequence: '1. Data Models → 2. Repository Layer → 3. Business Services → 4. API Layer → 5. UI Components',
        architecture: 'Recommended: Clean Architecture with dependency inversion',
        modules: [
          'Authentication Module',
          'Core Business Module', 
          'Analytics Module',
          'Notification Module'
        ],
        integration: 'Use event-driven architecture for module communication'
      },
      diagram: `graph TD
    A[Presentation Layer] --> B[Application Layer]
    B --> C[Domain Layer]
    C --> D[Infrastructure Layer]
    
    A1[UI Components] --> A
    A2[Controllers] --> A
    B1[Use Cases] --> B
    B2[Services] --> B
    C1[Entities] --> C
    C2[Business Rules] --> C
    D1[Database] --> D
    D2[External APIs] --> D
    
    style A fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#fff
    style B fill:#14B8A6,stroke:#0D9488,stroke-width:2px,color:#fff
    style C fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff
    style D fill:#EF4444,stroke:#DC2626,stroke-width:2px,color:#fff`
    },

    MVP_RUN: {
      mode: 'MVP_RUN',
      timestamp: new Date().toISOString(),
      output: {
        fakeDoorTest: 'Landing page with "Coming Soon" signup to measure demand',
        prototype: {
          week1: 'Static mockup with core user journey',
          week2: 'Interactive prototype with basic functionality',
          week3: 'User testing with 20 target users'
        },
        validationPlan: '48-hour test: 100 visitors, target 15% signup rate',
        pivotPoints: [
          'Less than 10% signup rate',
          'Users confused about value prop',
          'Technical feasibility concerns'
        ],
        successCriteria: '15% signup rate, 80% understand value prop, feasible tech stack'
      },
      diagram: `graph TD
    A[Landing Page] --> B{User Interest?}
    B -->|Yes| C[Sign Up]
    B -->|No| D[Feedback Survey]
    C --> E[Success Metrics]
    D --> F[Pivot Decision]
    E --> G[Build MVP]
    F --> H[Iterate Design]
    H --> A
    
    style A fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#fff
    style B fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff
    style C fill:#10B981,stroke:#059669,stroke-width:2px,color:#fff
    style D fill:#EF4444,stroke:#DC2626,stroke-width:2px,color:#fff
    style E fill:#14B8A6,stroke:#0D9488,stroke-width:2px,color:#fff
    style F fill:#EC4899,stroke:#DB2777,stroke-width:2px,color:#fff
    style G fill:#3B82F6,stroke:#2563EB,stroke-width:2px,color:#fff
    style H fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#fff`
    }
  }

  return mockResults[mode as keyof typeof mockResults] || mockResults.IDEA_BURNER
}