'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
// Icons replaced with emojis for compatibility
import { Badge } from '@/components/ui/badge'

const contextData = {
  SYSTEMS_MAP: {
    description: 'Maps out the entire system architecture, identifying components, data flows, and dependencies.',
    criticalInfo: [
      'Identifies bottlenecks and single points of failure',
      'Best for debugging complex systems',
      'Output includes Mermaid diagrams'
    ],
    tips: 'Start with high-level overview, then drill down into specific subsystems'
  },
  IDEA_BURNER: {
    description: 'Challenges assumptions and finds logical flaws in concepts before implementation.',
    criticalInfo: [
      'Prevents costly pivots by exposing fatal flaws early',
      'Surfaces hidden dependencies and costs',
      'Validates concepts pre-implementation'
    ],
    tips: 'Be brutally honest about constraints and assumptions'
  },
  STRUCTURE: {
    description: 'Transforms abstract ideas into concrete implementation blueprints.',
    criticalInfo: [
      'Creates reusable patterns and frameworks',
      'Enforces best practices',
      'Outputs include sequence diagrams'
    ],
    tips: 'Include both happy path and error scenarios'
  },
  MVP_RUN: {
    description: 'Defines the smallest possible test to validate core assumptions.',
    criticalInfo: [
      'Focuses on fake door tests and prototypes',
      'Defines clear success/failure metrics',
      'Time-boxed to 48-72 hours'
    ],
    tips: 'Strip away everything except core value proposition'
  },
  PSYCH_DEPTH: {
    description: 'Analyzes psychological drivers and emotional factors behind decisions.',
    criticalInfo: [
      'Reveals misalignment between stated and actual needs',
      'Uncovers hidden motivations',
      'Maps emotional journey'
    ],
    tips: 'Look for what users do, not what they say'
  },
  LOOP_TEST: {
    description: 'Identifies feedback loops, recursion issues, and circular dependencies.',
    criticalInfo: [
      'Prevents runaway processes',
      'Finds amplifying/dampening factors',
      'Critical for self-improving systems'
    ],
    tips: 'Test edge cases and failure modes'
  },
  STACK_SYNC: {
    description: 'Integrates concepts with specific technology stacks and constraints.',
    criticalInfo: [
      'Identifies adapter patterns',
      'Plans migration paths',
      'Handles legacy system integration'
    ],
    tips: 'Document all dependencies and version requirements'
  }
}

interface ContextPanelProps {
  mode: string | null
}

export function ContextPanel({ mode }: ContextPanelProps) {
  if (!mode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Context</CardTitle>
          <CardDescription>Select a mode to view context</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const context = contextData[mode as keyof typeof contextData]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Context & Critical Info</CardTitle>
        <CardDescription>{mode.replace('_', ' ')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-4 h-4 text-muted-foreground flex items-center justify-center text-sm">ℹ️</div>
                <h4 className="text-sm font-medium">Description</h4>
              </div>
              <p className="text-sm text-muted-foreground">{context.description}</p>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-4 h-4 text-lyra-red flex items-center justify-center text-sm">⚠️</div>
                <h4 className="text-sm font-medium">Critical Information</h4>
              </div>
              <ul className="space-y-2">
                {context.criticalInfo.map((info, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-lyra-red mt-1">•</span>
                    <span className="text-sm text-muted-foreground">{info}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-4 h-4 text-lyra-yellow flex items-center justify-center text-sm">💡</div>
                <h4 className="text-sm font-medium">Pro Tip</h4>
              </div>
              <p className="text-sm text-muted-foreground italic">{context.tips}</p>
            </div>

            <div className="pt-2">
              <Badge variant="outline" className="text-xs">
                Token usage: ~2-4k
              </Badge>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}