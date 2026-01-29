
export interface Expense {
  id: string;
  date: string;
  concept: string;
  income: number;
  expense: number;
}

export interface MonthlyExpenses {
  [monthYear: string]: Expense[];
}

export interface Savings {
  [year: string]: {
    [month: string]: number;
  };
}

export interface HealthItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface HealthData {
  [year: string]: HealthItem[];
}

export interface CustomTable {
  id: string;
  title: string;
  col1Title: string;
  col2Title: string;
  color: string;
  icon: string;
  rows: { id: string; val1: string; val2: string }[];
}

export interface AnnualCustomTables {
  [year: string]: CustomTable[];
}

export interface NoteData {
  [date: string]: string;
}

export type ViewState = 'calendar' | 'expenses' | 'diary' | 'savings' | 'health' | 'custom' | 'summary' | 'monthlyNotes' | 'customTableDetail' | 'settings';

export interface AppState {
  expenses: MonthlyExpenses;
  savings: Savings;
  notes: NoteData;
  monthlyNotes: NoteData;
  health: HealthData;
  customTables: AnnualCustomTables;
}
