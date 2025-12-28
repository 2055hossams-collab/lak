
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  EXPENSES = 'EXPENSES',
  CUSTOMERS = 'CUSTOMERS',
  SUPPLIERS = 'SUPPLIERS',
  DEBTS = 'DEBTS',
  EMPLOYEES = 'EMPLOYEES',
  REPORTS = 'REPORTS',
  INVENTORY = 'INVENTORY',
  SETTINGS = 'SETTINGS',
  DAILY_MOVEMENT = 'DAILY_MOVEMENT',
  STATEMENT = 'STATEMENT',
  EXCHANGE = 'EXCHANGE',
  BACKUP = 'BACKUP',
  DRIVE = 'DRIVE',
  OTHERS = 'OTHERS',
  MESSAGES = 'MESSAGES',
  WAREHOUSE_TRANSFERS = 'WAREHOUSE_TRANSFERS',
  ORDERS = 'ORDERS',
  QUOTES = 'QUOTES',
  CATEGORIES = 'CATEGORIES',
  BUDGET_REPORT = 'BUDGET_REPORT',
}

export type AccountType = 'customer' | 'supplier' | 'employee' | 'expense' | 'debt' | 'other' | 'cash';

export interface Account {
  id: string;
  name: string;
  balance: number; 
  phone?: string;
  type: AccountType;
  debtLimit?: number;
  lastTransaction?: string;
  isLocked?: boolean;
  notes?: string;
  msgMethod?: 'SMS' | 'WhatsApp';
  msgTiming?: 'Auto' | 'Confirm' | 'None';
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  note: string;
  category?: string;
  method: 'cash' | 'credit';
}

export interface Product {
  id: string;
  name: string;
  price: number;
  buyPrice?: number;
  quantity: number;
  category: string;
}

export interface Order {
  id: string;
  accountId: string;
  items: { productId: string; quantity: number; price: number }[];
  total: number;
  date: string;
  type: 'order' | 'quote';
  status: 'pending' | 'completed' | 'cancelled';
}

export interface Category {
  id: string;
  name: string;
}

export interface AppMessage {
  id: string;
  to: string;
  content: string;
  date: string;
  method: 'SMS' | 'WhatsApp';
}
