import { Component, inject, OnInit, signal } from '@angular/core';
import { DxChartModule, DxPieChartModule } from 'devextreme-angular';
import { DxiPieChartSeriesModule } from 'devextreme-angular/ui/pie-chart/nested';
import { CommonModule } from '@angular/common';
import { DatabaseService } from '../services/database.service';
import { Expense } from '../models/database.models';

interface ExpenseSummary {
  totalExpenses: number;
  totalAmount: number;
  averageAmount: number;
  expensesByType: { type: string; amount: number; count: number }[];
  expensesByPaymentType: { paymentType: string; amount: number; count: number }[];
  expensesByUser: { user: string; amount: number; count: number }[];
  recentExpenses: Expense[];
}

@Component({
  selector: 'app-dashboard',
  imports: [DxChartModule, DxPieChartModule, DxiPieChartSeriesModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private databaseService = inject(DatabaseService);

  summary = signal<ExpenseSummary>({
    totalExpenses: 0,
    totalAmount: 0,
    averageAmount: 0,
    expensesByType: [],
    expensesByPaymentType: [],
    expensesByUser: [],
    recentExpenses: []
  });

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.databaseService.getExpenses().subscribe({
      next: (expenses) => {
        this.calculateSummary(expenses);
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
      }
    });
  }

  private calculateSummary(expenses: Expense[]) {
    const totalExpenses = expenses.length;
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const averageAmount = totalExpenses > 0 ? totalAmount / totalExpenses : 0;

    // Group by expense type
    const typeMap = new Map<string, { amount: number; count: number }>();
    expenses.forEach(exp => {
      const current = typeMap.get(exp.type) || { amount: 0, count: 0 };
      typeMap.set(exp.type, {
        amount: current.amount + exp.amount,
        count: current.count + 1
      });
    });

    const expensesByType = Array.from(typeMap.entries()).map(([type, data]) => ({
      type,
      amount: data.amount,
      count: data.count
    }));

    // Group by payment type
    const paymentMap = new Map<string, { amount: number; count: number }>();
    expenses.forEach(exp => {
      const current = paymentMap.get(exp.paymentType) || { amount: 0, count: 0 };
      paymentMap.set(exp.paymentType, {
        amount: current.amount + exp.amount,
        count: current.count + 1
      });
    });

    const expensesByPaymentType = Array.from(paymentMap.entries()).map(([paymentType, data]) => ({
      paymentType,
      amount: data.amount,
      count: data.count
    }));

    // Group by user
    const userMap = new Map<string, { amount: number; count: number }>();
    expenses.forEach(exp => {
      const current = userMap.get(exp.whoPaid) || { amount: 0, count: 0 };
      userMap.set(exp.whoPaid, {
        amount: current.amount + exp.amount,
        count: current.count + 1
      });
    });

    const expensesByUser = Array.from(userMap.entries()).map(([user, data]) => ({
      user,
      amount: data.amount,
      count: data.count
    }));

    // Get recent expenses (last 5)
    const recentExpenses = expenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    this.summary.set({
      totalExpenses,
      totalAmount,
      averageAmount,
      expensesByType,
      expensesByPaymentType,
      expensesByUser,
      recentExpenses
    });
  }
}
