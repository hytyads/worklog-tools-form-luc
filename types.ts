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
}

export interface DayStats {
  date: string;
  count: number;
}