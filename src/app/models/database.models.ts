// Database models and interfaces for Family Expenses app

export interface Expense {
  _id?: string; // NeDB auto-generated ID
  date: Date;
  type: string; // References ExpenseType.id
  description: string;
  amount: number;
  paymentType: string; // References PaymentType.id
  whoPaid: string;
  vendor?: string;
  recurring: boolean;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ExpenseType {
  _id?: string;
  id: string; // Unique identifier (e.g., 'food', 'utilities')
  name: string; // Display name (e.g., 'Food', 'Utilities')
  icon?: string; // Optional icon class
  color?: string; // Optional color for UI
  isActive: boolean;
  createdAt?: string;
}

export interface PaymentType {
  _id?: string;
  id: string; // Unique identifier (e.g., 'card', 'cash')
  name: string; // Display name (e.g., 'Credit Card', 'Cash')
  icon?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface User {
  _id?: string;
  id: string; // Unique identifier
  name: string; // Display name
  isActive: boolean;
  createdAt?: string;
}

export interface DatabaseCollections {
  expenses: Expense[];
  expenseTypes: ExpenseType[];
  paymentTypes: PaymentType[];
  users: User[];
}