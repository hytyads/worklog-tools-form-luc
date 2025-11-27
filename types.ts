
export interface WorkRecord {
  id: string;
  content: string;
  timestamp: number;
  date: string; // Format: YYYY-MM-DD
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  CALENDAR = 'CALENDAR',
  DAY_DETAIL = 'DAY_DETAIL',
  SUMMARY = 'SUMMARY',
  SETTINGS = 'SETTINGS',
}

export interface DayStats {
  date: string;
  count: number;
}

export type SummaryLanguage = 'zh' | 'en';

export type AIProvider = 'gemini' | 'openai';

export interface UserSettings {
  language: SummaryLanguage;
  provider: AIProvider;
  apiKey: string;
  // OpenAI Compatible Settings
  baseUrl?: string;
  modelName?: string;
  // Customization
  customPrompt?: string;
}

export interface SummaryRecord {
  id: string;
  startDate: string;
  endDate: string;
  content: string;
  timestamp: number;
}
