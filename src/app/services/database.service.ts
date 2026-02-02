import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Expense, ExpenseType, PaymentType, User } from '../models/database.models';

// Declare the electronAPI from preload script
declare global {
  interface Window {
    electronAPI: {
      db: {
        getExpenses: () => Promise<Expense[]>;
        addExpense: (expense: Omit<Expense, '_id'>) => Promise<Expense>;
        updateExpense: (id: string, expense: Partial<Expense>) => Promise<Expense>;
        deleteExpense: (id: string) => Promise<number>;
        getExpenseTypes: () => Promise<ExpenseType[]>;
        addExpenseType: (expenseType: Omit<ExpenseType, '_id'>) => Promise<ExpenseType>;
        updateExpenseType: (id: string, expenseType: Partial<ExpenseType>) => Promise<ExpenseType>;
        deleteExpenseType: (id: string) => Promise<number>;
        getPaymentTypes: () => Promise<PaymentType[]>;
        addPaymentType: (paymentType: Omit<PaymentType, '_id'>) => Promise<PaymentType>;
        updatePaymentType: (id: string, paymentType: Partial<PaymentType>) => Promise<PaymentType>;
        deletePaymentType: (id: string) => Promise<number>;
        getUsers: () => Promise<User[]>;
        addUser: (user: Omit<User, '_id'>) => Promise<User>;
        updateUser: (id: string, user: Partial<User>) => Promise<User>;
        deleteUser: (id: string) => Promise<number>;
      };
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor() { }

  // Expense operations
  getExpenses(): Observable<Expense[]> {
    return from(window.electronAPI.db.getExpenses());
  }

  addExpense(expense: Omit<Expense, '_id'>): Observable<Expense> {
    // Convert date to string for IPC transport
    const expenseForIPC = {
      ...expense,
      date: expense.date instanceof Date ? expense.date.toISOString() : expense.date
    } as any; // Cast to any to bypass TypeScript check for IPC
    return from(window.electronAPI.db.addExpense(expenseForIPC));
  }

  updateExpense(id: string, expense: Partial<Expense>): Observable<Expense> {
    // Convert date to string for IPC transport if present
    const expenseForIPC = {
      ...expense,
      ...(expense.date && { date: expense.date instanceof Date ? expense.date.toISOString() : expense.date })
    } as any; // Cast to any to bypass TypeScript check for IPC
    return from(window.electronAPI.db.updateExpense(id, expenseForIPC));
  }

  deleteExpense(id: string): Observable<void> {
    return from(window.electronAPI.db.deleteExpense(id).then(() => undefined));
  }

  // Enum operations
  getExpenseTypes(): Observable<ExpenseType[]> {
    return from(window.electronAPI.db.getExpenseTypes());
  }

  addExpenseType(expenseType: Omit<ExpenseType, '_id'>): Observable<ExpenseType> {
    return from(window.electronAPI.db.addExpenseType(expenseType));
  }

  updateExpenseType(id: string, expenseType: Partial<ExpenseType>): Observable<ExpenseType> {
    return from(window.electronAPI.db.updateExpenseType(id, expenseType));
  }

  deleteExpenseType(id: string): Observable<void> {
    return from(window.electronAPI.db.deleteExpenseType(id).then(() => undefined));
  }

  getPaymentTypes(): Observable<PaymentType[]> {
    return from(window.electronAPI.db.getPaymentTypes());
  }

  addPaymentType(paymentType: Omit<PaymentType, '_id'>): Observable<PaymentType> {
    return from(window.electronAPI.db.addPaymentType(paymentType));
  }

  updatePaymentType(id: string, paymentType: Partial<PaymentType>): Observable<PaymentType> {
    return from(window.electronAPI.db.updatePaymentType(id, paymentType));
  }

  deletePaymentType(id: string): Observable<void> {
    return from(window.electronAPI.db.deletePaymentType(id).then(() => undefined));
  }

  getUsers(): Observable<User[]> {
    return from(window.electronAPI.db.getUsers());
  }

  addUser(user: Omit<User, '_id'>): Observable<User> {
    return from(window.electronAPI.db.addUser(user));
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return from(window.electronAPI.db.updateUser(id, user));
  }

  deleteUser(id: string): Observable<void> {
    return from(window.electronAPI.db.deleteUser(id).then(() => undefined));
  }

  // Utility methods for dropdowns
  getExpenseTypesForDropdown(): Observable<{ value: string; text: string }[]> {
    return this.getExpenseTypes().pipe(
      map(types => types.map(type => ({ value: type.id, text: type.name })))
    );
  }

  getPaymentTypesForDropdown(): Observable<{ value: string; text: string }[]> {
    return this.getPaymentTypes().pipe(
      map(types => types.map(type => ({ value: type.id, text: type.name })))
    );
  }

  getUsersForDropdown(): Observable<{ value: string; text: string }[]> {
    return this.getUsers().pipe(
      map(users => users.map(user => ({ value: user.id, text: user.name })))
    );
  }
}