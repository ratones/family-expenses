import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { DxDataGridModule, DxButtonModule, DxPopupModule, DxFormModule, DxDataGridComponent, DxToolbarModule } from 'devextreme-angular';
import { DatabaseService } from '../services/database.service';
import { Expense } from '../models/database.models';

@Component({
  selector: 'app-home',
  imports: [DxDataGridModule, DxButtonModule, DxPopupModule, DxFormModule, DxToolbarModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  @ViewChild('dataGrid') dataGrid!: DxDataGridComponent;

  private databaseService = inject(DatabaseService);

  expenses = signal<Expense[]>([]);
  expenseTypes: { value: string; text: string }[] = [];
  paymentTypes: { value: string; text: string }[] = [];
  users: { value: string; text: string }[] = [];

  popupVisible = signal(false);
  isEditing = signal(false);
  currentExpense = signal<Expense>({
    date: new Date(),
    type: '',
    description: '',
    amount: 0,
    paymentType: '',
    whoPaid: '',
    vendor: '',
    recurring: false,
    notes: ''
  });

  ngOnInit() {
    console.log('HomeComponent ngOnInit called');
    this.loadExpenses();
    this.loadDropdownData();
  }

  public loadExpenses = () => {
    this.databaseService.getExpenses().subscribe({
      next: (expenses) => {
        console.log('Expenses loaded:', expenses);
        this.expenses.set(expenses);
      },
      error: (error) => {
        console.error('Error loading expenses:', error);
      }
    });
  }

  private loadDropdownData() {
    this.databaseService.getExpenseTypesForDropdown().subscribe({
      next: (types) => {
        this.expenseTypes = types;
      },
      error: (error) => {
        console.error('Error loading expense types:', error);
      }
    });

    this.databaseService.getPaymentTypesForDropdown().subscribe({
      next: (types) => {
        this.paymentTypes = types;
      },
      error: (error) => {
        console.error('Error loading payment types:', error);
      }
    });

    this.databaseService.getUsersForDropdown().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  showAddPopup() {
    this.isEditing.set(false);
    this.currentExpense.set({
      date: new Date(),
      type: '',
      description: '',
      amount: 0,
      paymentType: '',
      whoPaid: '',
      vendor: '',
      recurring: false,
      notes: ''
    });
    this.popupVisible.set(true);
  }

  editSelected = () => {
    const selectedRows = this.dataGrid?.instance?.getSelectedRowsData();
    if (selectedRows && selectedRows.length > 0) {
      const selectedItem = selectedRows[0];
      this.isEditing.set(true);
      this.currentExpense.set({ ...selectedItem });
      this.popupVisible.set(true);
    }
  }

  deleteSelected = () => {
    const selectedRows = this.dataGrid?.instance?.getSelectedRowsData();
    if (selectedRows && selectedRows.length > 0) {
      const selectedItem = selectedRows[0];
      if (confirm(`Are you sure you want to delete this expense: "${selectedItem.description}"?`)) {
        this.databaseService.deleteExpense(selectedItem._id).subscribe({
          next: () => {
            this.loadExpenses();
          },
          error: (error) => {
            console.error('Error deleting expense:', error);
            alert('Error deleting expense');
          }
        });
      }
    }
  }

  saveExpense = () => {
    const expense = this.currentExpense();
    if (this.isEditing()) {
      this.databaseService.updateExpense(expense._id!, expense).subscribe({
        next: () => {
          this.loadExpenses();
          this.hidePopup();
        },
        error: (error) => {
          console.error('Error updating expense:', error);
          alert('Error updating expense');
        }
      });
    } else {
      this.databaseService.addExpense(expense).subscribe({
        next: () => {
          this.loadExpenses();
          this.hidePopup();
        },
        error: (error) => {
          console.error('Error adding expense:', error);
          alert('Error adding expense');
        }
      });
    }
  };

  hidePopup() {
    this.popupVisible.set(false);
  }
}