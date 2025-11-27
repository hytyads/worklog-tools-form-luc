
import { WorkRecord, DayStats, UserSettings, SummaryRecord } from '../types';

const STORAGE_KEY = 'worklog_data';
const SETTINGS_KEY = 'worklog_settings';
const SUMMARY_HISTORY_KEY = 'worklog_summary_history';

// Helper to get all data
const getStore = (): Record<string, WorkRecord[]> => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

// Helper to save all data
const setStore = (data: Record<string, WorkRecord[]>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// --- Settings Operations ---

export const getUserSettings = (): UserSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  
  const defaults: UserSettings = {
    language: 'zh',
    provider: 'gemini',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    modelName: 'gpt-3.5-turbo',
    customPrompt: ''
  };

  if (data) {
    const parsed = JSON.parse(data);
    // Merge parsed data with defaults to ensure all fields exist (migration)
    return { ...defaults, ...parsed };
  }
  
  return defaults;
};

export const saveUserSettings = (settings: UserSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// --- Record Operations ---

export const getRecordsByDate = (date: string): WorkRecord[] => {
  const store = getStore();
  return store[date] || [];
};

export const addRecord = (date: string, content: string): WorkRecord => {
  const store = getStore();
  if (!store[date]) {
    store[date] = [];
  }

  // Limit to 100 records
  if (store[date].length >= 100) {
    throw new Error('Daily record limit (100) reached.');
  }

  const newRecord: WorkRecord = {
    id: crypto.randomUUID(),
    content,
    timestamp: Date.now(),
    date,
  };

  store[date].push(newRecord);
  setStore(store);
  return newRecord;
};

export const updateRecord = (date: string, id: string, newContent: string): void => {
  const store = getStore();
  if (store[date]) {
    store[date] = store[date].map(record => 
      record.id === id ? { ...record, content: newContent } : record
    );
    setStore(store);
  }
};

export const deleteRecord = (date: string, id: string): void => {
  const store = getStore();
  if (store[date]) {
    store[date] = store[date].filter(record => record.id !== id);
    if (store[date].length === 0) {
      delete store[date]; // Cleanup empty days
    }
    setStore(store);
  }
};

export const getDatesWithData = (): string[] => {
  const store = getStore();
  return Object.keys(store).filter(date => store[date].length > 0);
};

export const getRecordsInRange = (startDate: string, endDate: string): WorkRecord[] => {
  const store = getStore();
  const records: WorkRecord[] = [];
  
  // Simple string comparison works for YYYY-MM-DD
  Object.keys(store).forEach(date => {
    if (date >= startDate && date <= endDate) {
      records.push(...store[date]);
    }
  });

  return records.sort((a, b) => a.timestamp - b.timestamp);
};

// --- Summary History Operations ---

export const getSummaryHistory = (): SummaryRecord[] => {
  const data = localStorage.getItem(SUMMARY_HISTORY_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveSummaryRecord = (summary: Omit<SummaryRecord, 'id' | 'timestamp'>): SummaryRecord => {
  const history = getSummaryHistory();
  const newRecord: SummaryRecord = {
    ...summary,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  // Add to beginning
  history.unshift(newRecord);
  // Optional: Limit history size (e.g., keep last 50)
  if (history.length > 50) {
    history.pop();
  }
  localStorage.setItem(SUMMARY_HISTORY_KEY, JSON.stringify(history));
  return newRecord;
};

export const deleteSummaryRecord = (id: string): void => {
  let history = getSummaryHistory();
  history = history.filter(item => item.id !== id);
  localStorage.setItem(SUMMARY_HISTORY_KEY, JSON.stringify(history));
};
