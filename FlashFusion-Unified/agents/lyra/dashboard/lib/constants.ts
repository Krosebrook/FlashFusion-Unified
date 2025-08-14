import { Brain, GitBranch, Package, RefreshCw, Settings, Terminal, Zap } from 'lucide-react';
import { LyraMode, ModeIcons } from './types';

export const modes: LyraMode[] = [
  {
    id: 'SYSTEMS_MAP',
    name: 'Systems Map',
    description: 'Break down complex systems',
    trigger: 'Break this down',
    color: 'text-lyra-blue',
    bgColor: 'bg-lyra-blue/10',
    borderColor: 'border-lyra-blue/20',
  },
  {
    id: 'IDEA_BURNER',
    name: 'Idea Burner',
    description: 'Interrogate and challenge ideas',
    trigger: 'Interrogate this idea',
    color: 'text-lyra-red',
    bgColor: 'bg-lyra-red/10',
    borderColor: 'border-lyra-red/20',
  },
  {
    id: 'STRUCTURE',
    name: 'Structure',
    description: 'Convert chaos to blueprint',
    trigger: 'Turn this into a blueprint',
    color: 'text-lyra-purple',
    bgColor: 'bg-lyra-purple/10',
    borderColor: 'border-lyra-purple/20',
  },
  {
    id: 'MVP_RUN',
    name: 'MVP Run',
    description: 'Define minimum viable test',
    trigger: "What's the smallest test?",
    color: 'text-lyra-yellow',
    bgColor: 'bg-lyra-yellow/10',
    borderColor: 'border-lyra-yellow/20',
  },
  {
    id: 'PSYCH_DEPTH',
    name: 'Psych Depth',
    description: 'Analyze psychological drivers',
    trigger: 'Why do I care?',
    color: 'text-lyra-pink',
    bgColor: 'bg-lyra-pink/10',
    borderColor: 'border-lyra-pink/20',
  },
  {
    id: 'LOOP_TEST',
    name: 'Loop Test',
    description: 'Find recursion and feedback issues',
    trigger: 'What breaks the loop?',
    color: 'text-lyra-green',
    bgColor: 'bg-lyra-green/10',
    borderColor: 'border-lyra-green/20',
  },
  {
    id: 'STACK_SYNC',
    name: 'Stack Sync',
    description: 'Integrate with tech stack',
    trigger: 'Make this work with X',
    color: 'text-lyra-teal',
    bgColor: 'bg-lyra-teal/10',
    borderColor: 'border-lyra-teal/20',
  },
];

export const modeIcons: ModeIcons = {
  SYSTEMS_MAP: GitBranch,
  IDEA_BURNER: Brain,
  STRUCTURE: Package,
  MVP_RUN: Zap,
  PSYCH_DEPTH: Settings,
  LOOP_TEST: RefreshCw,
  STACK_SYNC: Terminal,
};

export const inputTemplates = {
  system: `System: E-commerce Platform
Components:
- Next.js frontend
- Node.js API
- PostgreSQL database
- Redis cache
Pain Points:
- Checkout abandonment 45%
- Search latency >2s`,
  idea: `I want to build an AI-powered code review tool that:
- Integrates with GitHub/GitLab
- Provides contextual suggestions
- Learns from team patterns
- Budget: $50k, Timeline: 3 months`,
  brainstorm: `uber for dogs but also airbnb? 
subscription model vs marketplace
need recurring revenue
pet owners trust issues
insurance? liability?`,
};
