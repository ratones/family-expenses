import { Component, signal, inject, OnInit, ViewChild } from '@angular/core';
import { DxDataGridModule, DxButtonModule, DxPopupModule, DxFormModule, DxDataGridComponent } from 'devextreme-angular';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { DatabaseService } from '../../services/database.service';
import { User } from '../../models/database.models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [DxDataGridModule, DxButtonModule, DxPopupModule, DxFormModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  @ViewChild('dataGrid') dataGrid!: DxDataGridComponent;

  private databaseService = inject(DatabaseService);

  users = signal<User[]>([]);
  popupVisible = signal(false);
  isEditing = signal(false);
  currentUser = signal<User>({
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
      dataField: 'isActive',
      caption: 'Active',
      dataType: 'boolean',
      width: 80
    }
  ];

  ngOnInit() {
    this.loadUsers();
  }

  private loadUsers() {
    this.databaseService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  showAddPopup() {
    this.isEditing.set(false);
    this.currentUser.set({
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
      this.currentUser.set({ ...selectedItem });
      this.popupVisible.set(true);
    }
  }

  private deleteSelected() {
    const selectedRows = this.dataGrid?.instance?.getSelectedRowsData();
    if (selectedRows && selectedRows.length > 0) {
      const selectedItem = selectedRows[0];
      if (confirm(`Are you sure you want to delete "${selectedItem.name}"?`)) {
        this.databaseService.deleteUser(selectedItem._id).subscribe({
          next: () => {
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            alert('Error deleting user');
          }
        });
      }
    }
  }

  saveUser = () => {
    const user = this.currentUser();
    if (this.isEditing()) {
      this.databaseService.updateUser(user._id!, user).subscribe({
        next: () => {
          this.loadUsers();
          this.hidePopup();
        },
        error: (error) => {
          console.error('Error updating user:', error);
        }
      });
    } else {
      this.databaseService.addUser(user).subscribe({
        next: () => {
          this.loadUsers();
          this.hidePopup();
        },
        error: (error) => {
          console.error('Error adding user:', error);
        }
      });
    }
  };

  hidePopup() {
    this.popupVisible.set(false);
  }
}