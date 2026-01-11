
import { AppState } from '../types';

const STORAGE_KEY = 'notebk_data';

export const loadData = (): AppState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing saved data", e);
    }
  }
  return {
    expenses: {},
    savings: {},
    notes: {},
    health: {},
    customTables: {},
  };
};

export const saveData = (data: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
