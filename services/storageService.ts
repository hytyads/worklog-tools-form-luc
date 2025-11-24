import { WorkRecord, DayStats } from '../types';

const STORAGE_KEY = 'worklog_data';

// Helper to get all data
const getStore = (): Record<string, WorkRecord[]> => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

// Helper to save all data
const setStore = (data: Record<string, WorkRecord[]>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

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