import { Component, signal, inject, OnInit, ViewChild } from '@angular/core';
import { DxDataGridModule, DxButtonModule, DxPopupModule, DxFormModule, DxDataGridComponent } from 'devextreme-angular';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { DatabaseService } from '../../services/database.service';
import { ExpenseType } from '../../models/database.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expense-types',
  standalone:true,
  imports: [DxDataGridModule, DxButtonModule, DxPopupModule, DxFormModule, CommonModule],
  templateUrl: './expense-types.component.html',
  styleUrl: './expense-types.component.scss'
})
export class ExpenseTypesComponent implements OnInit {
  @ViewChild('dataGrid') dataGrid!: DxDataGridComponent;

  private databaseService = inject(DatabaseService);

  expenseTypes = signal<ExpenseType[]>([]);
  popupVisible = signal(false);
  isEditing = signal(false);
  currentExpenseType = signal<ExpenseType>({
    id: '',
    name: '',
    isActive: true
  });

  columns: DxDataGridTypes.Column[] = [
    {
      dataField: 'id',
      caption: 'ID',
      width: 100
    },
    {
      dataField: 'name',
      caption: 'Name'
    },
    {
      dataField: 'icon',
      caption: 'Icon',
      width: 100
    },
    {
      dataField: 'color',
      caption: 'Color',
      width: 100
    },
    {
      dataField: 'isActive',
      caption: 'Active',
      dataType: 'boolean',
      width: 80
    }
  ];

  ngOnInit() {
    this.loadExpenseTypes();
  }

  private loadExpenseTypes() {
    this.databaseService.getExpenseTypes().subscribe({
      next: (types) => {
        this.expenseTypes.set(types);
      },
      error: (error) => {
        console.error('Error loading expense types:', error);
      }
    });
  }

  showAddPopup() {
    this.isEditing.set(false);
    this.currentExpenseType.set({
      id: '',
      name: '',
      isActive: true
    });
    this.popupVisible.set(true);
  }

  onRowClick(event: DxDataGridTypes.RowClickEvent) {
    // Could implement edit on double-click or something
  }

  onToolbarPreparing(event: DxDataGridTypes.ToolbarPreparingEvent) {
    event.toolbarOptions.items?.unshift({
      location: 'after',
      widget: 'dxButton',
      options: {
        text: 'Edit',
        icon: 'edit',
        onClick: () => this.editSelected()
      }
    }, {
      location: 'after',
      widget: 'dxButton',
      options: {
        text: 'Delete',
        icon: 'trash',
        type: 'danger',
        onClick: () => this.deleteSelected()
      }
    });
  }

  private editSelected() {
    const selectedRows = this.dataGrid?.instance?.getSelectedRowsData();
    if (selectedRows && selectedRows.length > 0) {
      const selectedItem = selectedRows[0];
      this.isEditing.set(true);
      this.currentExpenseType.set({ ...selectedItem });
      this.popupVisible.set(true);
    }
  }

  private deleteSelected() {
    const selectedRows = this.dataGrid?.instance?.getSelectedRowsData();
    if (selectedRows && selectedRows.length > 0) {
      const selectedItem = selectedRows[0];
      if (confirm(`Are you sure you want to delete "${selectedItem.name}"?`)) {
        this.databaseService.deleteExpenseType(selectedItem._id).subscribe({
          next: () => {
            this.loadExpenseTypes();
          },
          error: (error) => {
            console.error('Error deleting expense type:', error);
            alert('Error deleting expense type');
          }
        });
      }
    }
  }

  saveExpenseType = () => {
    const expenseType = this.currentExpenseType();
    if (this.isEditing()) {
      this.databaseService.updateExpenseType(expenseType._id!, expenseType).subscribe({
        next: () => {
          this.loadExpenseTypes();
          this.hidePopup();
        },
        error: (error) => {
          console.error('Error updating expense type:', error);
        }
      });
    } else {
      this.databaseService.addExpenseType(expenseType).subscribe({
        next: () => {
          this.loadExpenseTypes();
          this.hidePopup();
        },
        error: (error) => {
          console.error('Error adding expense type:', error);
        }
      });
    }
  };

  hidePopup() {
    this.popupVisible.set(false);
  }
}