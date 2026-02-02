import { Component, signal, inject, OnInit, ViewChild } from '@angular/core';
import { DxDataGridModule, DxButtonModule, DxPopupModule, DxFormModule, DxDataGridComponent } from 'devextreme-angular';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { DatabaseService } from '../../services/database.service';
import { PaymentType } from '../../models/database.models';

@Component({
  selector: 'app-payment-types',
  standalone:true,
  imports: [DxDataGridModule, DxButtonModule, DxPopupModule, DxFormModule],
  templateUrl: './payment-types.component.html',
  styleUrl: './payment-types.component.scss'
})
export class PaymentTypesComponent implements OnInit {
  @ViewChild('dataGrid') dataGrid!: DxDataGridComponent;

  private databaseService = inject(DatabaseService);

  paymentTypes = signal<PaymentType[]>([]);
  popupVisible = signal(false);
  isEditing = signal(false);
  currentPaymentType = signal<PaymentType>({
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
      width: 120
    },
    {
      dataField: 'isActive',
      caption: 'Active',
      dataType: 'boolean',
      width: 80
    }
  ];

  ngOnInit() {
    this.loadPaymentTypes();
  }

  private loadPaymentTypes() {
    this.databaseService.getPaymentTypes().subscribe({
      next: (types) => {
        this.paymentTypes.set(types);
      },
      error: (error) => {
        console.error('Error loading payment types:', error);
      }
    });
  }

  showAddPopup() {
    this.isEditing.set(false);
    this.currentPaymentType.set({
      id: '',
      name: '',
      isActive: true
    });
    this.popupVisible.set(true);
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
      this.currentPaymentType.set({ ...selectedItem });
      this.popupVisible.set(true);
    }
  }

  private deleteSelected() {
    const selectedRows = this.dataGrid?.instance?.getSelectedRowsData();
    if (selectedRows && selectedRows.length > 0) {
      const selectedItem = selectedRows[0];
      if (confirm(`Are you sure you want to delete "${selectedItem.name}"?`)) {
        this.databaseService.deletePaymentType(selectedItem._id).subscribe({
          next: () => {
            this.loadPaymentTypes();
          },
          error: (error) => {
            console.error('Error deleting payment type:', error);
            alert('Error deleting payment type');
          }
        });
      }
    }
  }

  savePaymentType = () => {
    const paymentType = this.currentPaymentType();
    if (this.isEditing()) {
      this.databaseService.updatePaymentType(paymentType._id!, paymentType).subscribe({
        next: () => {
          this.loadPaymentTypes();
          this.hidePopup();
        },
        error: (error) => {
          console.error('Error updating payment type:', error);
        }
      });
    } else {
      this.databaseService.addPaymentType(paymentType).subscribe({
        next: () => {
          this.loadPaymentTypes();
          this.hidePopup();
        },
        error: (error) => {
          console.error('Error adding payment type:', error);
        }
      });
    }
  };

  hidePopup() {
    this.popupVisible.set(false);
  }
}