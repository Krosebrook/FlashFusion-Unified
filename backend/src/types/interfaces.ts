export interface GenerationRequest {
  platform: string;
  config: any;
}

export interface GeneratedFile {
  name: string;
  content: string;
}