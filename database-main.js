const Datastore = require('nedb');
const path = require('path');
const fs = require('fs');
const util = require('util');

// Fix for NeDB using util functions which don't exist in Node.js
util.isDate = (obj) => obj instanceof Date;
util.isRegExp = (obj) => obj instanceof RegExp;
util.isArray = (obj) => Array.isArray(obj);

class DatabaseService {
  constructor(userDataPath) {
    this.dataDir = path.join(userDataPath, 'data');
    this.initializeDatabases();
    this.initializeDefaultData();
  }

  initializeDatabases() {
    // Ensure data directory exists
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Initialize databases
    this.expensesDb = new Datastore({
      filename: path.join(this.dataDir, 'expenses.db'),
      autoload: true
    });

    this.expenseTypesDb = new Datastore({
      filename: path.join(this.dataDir, 'expense-types.db'),
      autoload: true
    });

    this.paymentTypesDb = new Datastore({
      filename: path.join(this.dataDir, 'payment-types.db'),
      autoload: true
    });

    this.usersDb = new Datastore({
      filename: path.join(this.dataDir, 'users.db'),
      autoload: true
    });
  }

  initializeDefaultData() {
    // Initialize default expense types
    this.expenseTypesDb.find({}, (err, docs) => {
      if (err) console.error('Error checking expense types:', err);
      else if (docs.length === 0) {
        const defaultExpenseTypes = [
          { id: 'food', name: 'Food', isActive: true },
          { id: 'utilities', name: 'Utilities', isActive: true },
          { id: 'transport', name: 'Transport', isActive: true },
          { id: 'health', name: 'Health', isActive: true },
          { id: 'education', name: 'Education', isActive: true },
          { id: 'entertainment', name: 'Entertainment', isActive: true },
          { id: 'shopping', name: 'Shopping', isActive: true },
          { id: 'other', name: 'Other', isActive: true }
        ];
        // Insert one by one to avoid the Date issue
        defaultExpenseTypes.forEach(type => {
          this.expenseTypesDb.insert(type, (err) => {
            if (err) console.error('Error inserting default expense type:', err);
          });
        });
      }
    });

    // Initialize default payment types
    this.paymentTypesDb.find({}, (err, docs) => {
      if (err) console.error('Error checking payment types:', err);
      else if (docs.length === 0) {
        const defaultPaymentTypes = [
          { id: 'card', name: 'Card', isActive: true },
          { id: 'cash', name: 'Cash', isActive: true },
          { id: 'bank-transfer', name: 'Bank Transfer', isActive: true },
          { id: 'other', name: 'Other', isActive: true }
        ];
        // Insert one by one
        defaultPaymentTypes.forEach(type => {
          this.paymentTypesDb.insert(type, (err) => {
            if (err) console.error('Error inserting default payment type:', err);
          });
        });
      }
    });

    // Initialize default users
    this.usersDb.find({}, (err, docs) => {
      if (err) console.error('Error checking users:', err);
      else if (docs.length === 0) {
        const defaultUsers = [
          { id: 'user1', name: 'Family Member 1', isActive: true },
          { id: 'user2', name: 'Family Member 2', isActive: true }
        ];
        // Insert one by one
        defaultUsers.forEach(user => {
          this.usersDb.insert(user, (err) => {
            if (err) console.error('Error inserting default user:', err);
          });
        });
      }
    });

    // Initialize sample expenses for demo purposes
    this.expensesDb.find({}, (err, docs) => {
      if (err) console.error('Error checking expenses:', err);
      else if (docs.length === 0) {
        const sampleExpenses = [
          { date: new Date('2024-01-15'), type: 'Food', description: 'Grocery shopping', amount: 150.50, paymentType: 'Card', whoPaid: 'Family Member 1', vendor: 'Supermarket', recurring: false, notes: 'Weekly groceries' },
          { date: new Date('2024-01-20'), type: 'Utilities', description: 'Electricity bill', amount: 89.30, paymentType: 'Bank Transfer', whoPaid: 'Family Member 1', vendor: 'Electric Company', recurring: true, notes: 'Monthly bill' },
          { date: new Date('2024-01-25'), type: 'Transport', description: 'Gas station', amount: 45.00, paymentType: 'Cash', whoPaid: 'Family Member 2', vendor: 'Gas Station', recurring: false, notes: '' },
          { date: new Date('2024-02-01'), type: 'Food', description: 'Restaurant dinner', amount: 75.20, paymentType: 'Card', whoPaid: 'Family Member 1', vendor: 'Italian Restaurant', recurring: false, notes: 'Family dinner out' },
          { date: new Date('2024-02-05'), type: 'Health', description: 'Doctor visit', amount: 120.00, paymentType: 'Card', whoPaid: 'Family Member 2', vendor: 'Medical Center', recurring: false, notes: 'Check-up appointment' },
          { date: new Date('2024-02-10'), type: 'Entertainment', description: 'Movie tickets', amount: 32.00, paymentType: 'Cash', whoPaid: 'Family Member 1', vendor: 'Cinema', recurring: false, notes: 'Weekend movie' },
          { date: new Date('2024-02-15'), type: 'Shopping', description: 'Clothes', amount: 89.99, paymentType: 'Card', whoPaid: 'Family Member 2', vendor: 'Department Store', recurring: false, notes: 'New winter jacket' },
          { date: new Date('2024-02-20'), type: 'Utilities', description: 'Internet bill', amount: 65.00, paymentType: 'Bank Transfer', whoPaid: 'Family Member 1', vendor: 'ISP Company', recurring: true, notes: 'Monthly internet' },
          { date: new Date('2024-02-25'), type: 'Food', description: 'Coffee and pastries', amount: 12.50, paymentType: 'Cash', whoPaid: 'Family Member 1', vendor: 'Coffee Shop', recurring: false, notes: '' },
          { date: new Date('2024-03-01'), type: 'Transport', description: 'Bus pass', amount: 25.00, paymentType: 'Card', whoPaid: 'Family Member 2', vendor: 'Public Transport', recurring: true, notes: 'Monthly pass' },
          { date: new Date('2024-03-05'), type: 'Education', description: 'Online course', amount: 49.99, paymentType: 'Card', whoPaid: 'Family Member 1', vendor: 'Learning Platform', recurring: false, notes: 'Programming course' },
          { date: new Date('2024-03-10'), type: 'Other', description: 'Home maintenance', amount: 78.50, paymentType: 'Cash', whoPaid: 'Family Member 1', vendor: 'Hardware Store', recurring: false, notes: 'Tools and supplies' }
        ];
        // Insert sample expenses one by one
        sampleExpenses.forEach(expense => {
          this.expensesDb.insert(expense, (err) => {
            if (err) console.error('Error inserting sample expense:', err);
          });
        });
      }
    });
  }

  getExpenses(callback) {
    this.expensesDb.find({}).sort({ date: -1 }).exec(callback);
  }

  addExpense(expense, callback) {
    // Convert date string back to Date object if needed
    const processedExpense = {
      ...expense,
      date: typeof expense.date === 'string' ? new Date(expense.date) : expense.date
    };
    this.expensesDb.insert(processedExpense, callback);
  }

  updateExpense(id, expense, callback) {
    // Convert date string back to Date object if needed
    const processedExpense = {
      ...expense,
      ...(expense.date && { date: typeof expense.date === 'string' ? new Date(expense.date) : expense.date })
    };
    this.expensesDb.update({ _id: id }, { $set: processedExpense }, {}, (err, numAffected) => {
      if (err) callback(err);
      else if (numAffected === 0) callback(new Error('Expense not found'));
      else {
        this.expensesDb.findOne({ _id: id }, callback);
      }
    });
  }

  deleteExpense(id, callback) {
    this.expensesDb.remove({ _id: id }, {}, callback);
  }

  // Enum operations
  getExpenseTypes(callback) {
    this.expenseTypesDb.find({}).sort({ name: 1 }).exec(callback);
  }

  addExpenseType(expenseType, callback) {
    this.expenseTypesDb.insert(expenseType, callback);
  }

  updateExpenseType(id, expenseType, callback) {
    this.expenseTypesDb.update({ _id: id }, { $set: expenseType }, {}, (err, numAffected) => {
      if (err) callback(err);
      else if (numAffected === 0) callback(new Error('Expense type not found'));
      else {
        this.expenseTypesDb.findOne({ _id: id }, callback);
      }
    });
  }

  deleteExpenseType(id, callback) {
    this.expenseTypesDb.remove({ _id: id }, {}, callback);
  }

  getPaymentTypes(callback) {
    this.paymentTypesDb.find({}).sort({ name: 1 }).exec(callback);
  }

  addPaymentType(paymentType, callback) {
    this.paymentTypesDb.insert(paymentType, callback);
  }

  updatePaymentType(id, paymentType, callback) {
    this.paymentTypesDb.update({ _id: id }, { $set: paymentType }, {}, (err, numAffected) => {
      if (err) callback(err);
      else if (numAffected === 0) callback(new Error('Payment type not found'));
      else {
        this.paymentTypesDb.findOne({ _id: id }, callback);
      }
    });
  }

  deletePaymentType(id, callback) {
    this.paymentTypesDb.remove({ _id: id }, {}, callback);
  }

  getUsers(callback) {
    this.usersDb.find({}).sort({ name: 1 }).exec(callback);
  }

  addUser(user, callback) {
    this.usersDb.insert(user, callback);
  }

  updateUser(id, user, callback) {
    this.usersDb.update({ _id: id }, { $set: user }, {}, (err, numAffected) => {
      if (err) callback(err);
      else if (numAffected === 0) callback(new Error('User not found'));
      else {
        this.usersDb.findOne({ _id: id }, callback);
      }
    });
  }

  deleteUser(id, callback) {
    this.usersDb.remove({ _id: id }, {}, callback);
  }
}

module.exports = DatabaseService;