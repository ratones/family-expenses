import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin.component').then(m => m.AdminComponent),
    children: [
      {
        path: 'expense-types',
        loadComponent: () => import('./expense-types/expense-types.component').then(m => m.ExpenseTypesComponent)
      },
      {
        path: 'payment-types',
        loadComponent: () => import('./payment-types/payment-types.component').then(m => m.PaymentTypesComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users.component').then(m => m.UsersComponent)
      },
      {
        path: '',
        redirectTo: 'expense-types',
        pathMatch: 'full'
      }
    ]
  }
];