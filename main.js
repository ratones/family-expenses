const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const DatabaseService = require('./database-main');
const { autoUpdater } = require('electron-updater');

let mainWindow;
let databaseService;

// For unsigned macOS builds, auto-updates don't work due to signature validation
// Check for updates manually and provide download link instead
const isUnsignedMacBuild = process.platform === 'darwin';

// Auto-updater configuration
if (!isUnsignedMacBuild) {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
} else {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;
}

// Auto-updater event handlers
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info.version);
  if (mainWindow) {
    if (isUnsignedMacBuild) {
      // For unsigned builds, provide manual download link
      const result = dialog.showMessageBoxSync(mainWindow, {
        type: 'info',
        title: 'Update Available',
        message: `A new version ${info.version} is available!`,
        detail: 'This app is unsigned, so automatic updates are not supported. Would you like to download the new version manually?',
        buttons: ['Download', 'Later'],
        defaultId: 0,
        cancelId: 1
      });
      
      if (result === 0) {
        shell.openExternal('https://github.com/ratones/family-expenses/releases/latest');
      }
    } else {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Available',
        message: `A new version ${info.version} is available!`,
        detail: 'The update will be downloaded in the background. You will be notified when it is ready to install.',
        buttons: ['OK']
      });
    }
  }
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available:', info.version);
});

autoUpdater.on('error', (err) => {
  console.error('Error in auto-updater:', err);
  // Only show error dialog for non-signature validation errors
  if (!err.message.includes('code signature') && !err.message.includes('did not pass validation') && mainWindow) {
    dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: 'Update Error',
      message: 'Failed to check for updates',
      detail: err.message,
      buttons: ['OK']
    });
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  if (!isUnsignedMacBuild) {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    console.log(log_message);
    // Update window title with progress
    if (mainWindow) {
      mainWindow.setTitle(`Family Expenses - Downloading update ${Math.round(progressObj.percent)}%`);
    }
  }
});

autoUpdater.on('update-downloaded', (info) => {
  if (!isUnsignedMacBuild) {
    console.log('Update downloaded:', info.version);
    // Reset window title
    if (mainWindow) {
      mainWindow.setTitle('Family Expenses');
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Ready',
        message: `Version ${info.version} has been downloaded`,
        detail: 'The update will be installed when you close the application.',
        buttons: ['Restart Now', 'Later']
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    }
  }
});

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
    // In production, load the built files
    const indexPath = path.join(__dirname, 'dist/family-expenses/browser/index.html');
    mainWindow.loadFile(indexPath);
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
  if (app.isPackaged) {
    console.log('Checking for updates - app is packaged');
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 3000); // Wait 3 seconds after app starts
  } else {
    console.log('Skipping update check - running in development');
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