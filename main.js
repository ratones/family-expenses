const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const DatabaseService = require('./database-main');
const { autoUpdater } = require('electron-updater');

let mainWindow;
let databaseService;

// Auto-updater configuration
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// Auto-updater event handlers
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info.version);
  // You could show a notification to the user here
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available:', info.version);
});

autoUpdater.on('error', (err) => {
  console.error('Error in auto-updater:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded:', info.version);
  // Auto-install on quit is enabled, but you could show a dialog here
  autoUpdater.quitAndInstall();
});

// Register custom protocol for packaged app
if (!app.isPackaged) {
  // In development, use the default file protocol
} else {
  // In production, register a custom protocol to serve files from ASAR
  app.whenReady().then(() => {
    protocol.registerFileProtocol('app', (request, callback) => {
      const url = request.url.substr(6); // Remove 'app://' prefix
      const filePath = path.join(process.resourcesPath, 'dist/family-expenses/browser', url);
      callback({ path: filePath });
    });
  });
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js') // We'll create this
    },
    icon: path.join(__dirname, 'src/assets/icon.png'), // Optional: add an icon later
    titleBarStyle: 'default',
    show: false, // Don't show until ready
  });

  // Create data directory in userData
  const userDataPath = app.getPath('userData');
  const dataDir = path.join(userDataPath, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Initialize database service
  databaseService = new DatabaseService(userDataPath);

  // Load the Angular app
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    // In development, load from the Angular dev server
    mainWindow.loadURL('http://localhost:4200');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // In production, use custom protocol to load files from ASAR
    mainWindow.loadURL('app://index.html');
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();
  
  // Check for updates (only in production)
  if (process.env.NODE_ENV !== 'development') {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    // Prevent new window creation
    event.preventDefault();
  });
});

// IPC handlers
ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData');
});

// Database IPC handlers
ipcMain.handle('db:get-expenses', async () => {
  return new Promise((resolve, reject) => {
    databaseService.getExpenses((err, docs) => {
      if (err) reject(err);
      else resolve(docs);
    });
  });
});

ipcMain.handle('db:add-expense', async (event, expense) => {
  return new Promise((resolve, reject) => {
    databaseService.addExpense(expense, (err, doc) => {
      if (err) reject(err);
      else resolve(doc);
    });
  });
});

ipcMain.handle('db:update-expense', async (event, id, expense) => {
  return new Promise((resolve, reject) => {
    databaseService.updateExpense(id, expense, (err, doc) => {
      if (err) reject(err);
      else resolve(doc);
    });
  });
});

ipcMain.handle('db:delete-expense', async (event, id) => {
  return new Promise((resolve, reject) => {
    databaseService.deleteExpense(id, (err, numRemoved) => {
      if (err) reject(err);
      else resolve(numRemoved);
    });
  });
});

ipcMain.handle('db:get-expense-types', async () => {
  return new Promise((resolve, reject) => {
    databaseService.getExpenseTypes((err, docs) => {
      if (err) reject(err);
      else resolve(docs);
    });
  });
});

ipcMain.handle('db:add-expense-type', async (event, expenseType) => {
  return new Promise((resolve, reject) => {
    databaseService.addExpenseType(expenseType, (err, doc) => {
      if (err) reject(err);
      else resolve(doc);
    });
  });
});

ipcMain.handle('db:update-expense-type', async (event, id, expenseType) => {
  return new Promise((resolve, reject) => {
    databaseService.updateExpenseType(id, expenseType, (err, doc) => {
      if (err) reject(err);
      else resolve(doc);
    });
  });
});

ipcMain.handle('db:delete-expense-type', async (event, id) => {
  return new Promise((resolve, reject) => {
    databaseService.deleteExpenseType(id, (err, numRemoved) => {
      if (err) reject(err);
      else resolve(numRemoved);
    });
  });
});

ipcMain.handle('db:get-payment-types', async () => {
  return new Promise((resolve, reject) => {
    databaseService.getPaymentTypes((err, docs) => {
      if (err) reject(err);
      else resolve(docs);
    });
  });
});

ipcMain.handle('db:add-payment-type', async (event, paymentType) => {
  return new Promise((resolve, reject) => {
    databaseService.addPaymentType(paymentType, (err, doc) => {
      if (err) reject(err);
      else resolve(doc);
    });
  });
});

ipcMain.handle('db:update-payment-type', async (event, id, paymentType) => {
  return new Promise((resolve, reject) => {
    databaseService.updatePaymentType(id, paymentType, (err, doc) => {
      if (err) reject(err);
      else resolve(doc);
    });
  });
});

ipcMain.handle('db:delete-payment-type', async (event, id) => {
  return new Promise((resolve, reject) => {
    databaseService.deletePaymentType(id, (err, numRemoved) => {
      if (err) reject(err);
      else resolve(numRemoved);
    });
  });
});

ipcMain.handle('db:get-users', async () => {
  return new Promise((resolve, reject) => {
    databaseService.getUsers((err, docs) => {
      if (err) reject(err);
      else resolve(docs);
    });
  });
});

ipcMain.handle('db:add-user', async (event, user) => {
  return new Promise((resolve, reject) => {
    databaseService.addUser(user, (err, doc) => {
      if (err) reject(err);
      else resolve(doc);
    });
  });
});

ipcMain.handle('db:update-user', async (event, id, user) => {
  return new Promise((resolve, reject) => {
    databaseService.updateUser(id, user, (err, doc) => {
      if (err) reject(err);
      else resolve(doc);
    });
  });
});

ipcMain.handle('db:delete-user', async (event, id) => {
  return new Promise((resolve, reject) => {
    databaseService.deleteUser(id, (err, numRemoved) => {
      if (err) reject(err);
      else resolve(numRemoved);
    });
  });
});