// types/index.ts
export interface CodeStyle {
  naming: string;
  comments: string;
  formatting: string;
}

export interface ProjectMetadata {
  language: string;
  architecture: string;
  dependencies: string[];
  version?: string;
  targetPlatforms: string[];
  codeStyle: CodeStyle;
}

export interface Question {
  id: string;
  question: string;
}

export interface ChatMessage {
  user: string;
  ai: string;
}

export type AIModel = "ChatGPT" | "Claude";
