export interface LyraMode {
  id: string;
  name: string;
  description: string;
  trigger: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface AnalysisResult {
  mode: string;
  timestamp: string;
  output: any;
  diagram?: string;
}

export interface AnalysisRecord {
  id: string;
  mode: string;
  input: string;
  results: AnalysisResult;
  timestamp: number;
}

export interface LyraState {
  selectedMode: string | null;
  isProcessing: boolean;
  results: AnalysisResult | null;
  analysisCount: number;
  history: AnalysisRecord[];
  setSelectedMode: (mode: string) => void;
  runAnalysis: (input: string) => Promise<void>;
  clearResults: () => void;
}

export type ModeIcons = Record<string, any>;
