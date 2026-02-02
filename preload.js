const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Get user data path for database storage
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),

  // Database operations
  db: {
    getExpenses: () => ipcRenderer.invoke('db:get-expenses'),
    addExpense: (expense) => ipcRenderer.invoke('db:add-expense', expense),
    updateExpense: (id, expense) => ipcRenderer.invoke('db:update-expense', id, expense),
    deleteExpense: (id) => ipcRenderer.invoke('db:delete-expense', id),
    getExpenseTypes: () => ipcRenderer.invoke('db:get-expense-types'),
    addExpenseType: (expenseType) => ipcRenderer.invoke('db:add-expense-type', expenseType),
    updateExpenseType: (id, expenseType) => ipcRenderer.invoke('db:update-expense-type', id, expenseType),
    deleteExpenseType: (id) => ipcRenderer.invoke('db:delete-expense-type', id),
    getPaymentTypes: () => ipcRenderer.invoke('db:get-payment-types'),
    addPaymentType: (paymentType) => ipcRenderer.invoke('db:add-payment-type', paymentType),
    updatePaymentType: (id, paymentType) => ipcRenderer.invoke('db:update-payment-type', id, paymentType),
    deletePaymentType: (id) => ipcRenderer.invoke('db:delete-payment-type', id),
    getUsers: () => ipcRenderer.invoke('db:get-users'),
    addUser: (user) => ipcRenderer.invoke('db:add-user', user),
    updateUser: (id, user) => ipcRenderer.invoke('db:update-user', id, user),
    deleteUser: (id) => ipcRenderer.invoke('db:delete-user', id),
  },

  // Platform info
  platform: process.platform,

  // Version info
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
});