// TypeScript interfaces for Universal App Generator

export interface AppConfig {
  platform: string;
  name: string;
  description: string;
  template: string;
  features: string[];
  deployment: {
    target: string;
    domain: string;
  };
}

export interface Platform {
  id: string;
  name: string;
  description: string;
  icon: string;
  templates: Template[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  features: string[];
  complexity: 'simple' | 'intermediate' | 'advanced';
}

export interface GenerationProgress {
  step: string;
  progress: number;
  message: string;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export interface GenerationResult {
  success: boolean;
  projectId: string;
  downloadUrl?: string;
  previewUrl?: string;
  repositoryUrl?: string;
  error?: string;
}

export interface WebSocketMessage {
  type: 'progress' | 'complete' | 'error';
  data: GenerationProgress | GenerationResult;
}

// Legacy interfaces for compatibility
export interface PlatformConfig {
  platform: string;
  features: string[];
  name: string;
}

export interface GenerationResponse {
  success: boolean;
  code: string;
  metadata?: any;
}