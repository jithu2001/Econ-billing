const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Detect if we're in development mode
const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';

let mainWindow;
let backendProcess;

// Function to start the Golang backend server
function startBackendServer() {
  let backendPath;
  let cwd;
  
  if (app.isPackaged) {
    // In packaged mode
    backendPath = path.join(process.resourcesPath, 'backend', 'main');
    cwd = process.resourcesPath;
  } else {
    // In development mode (both with dev server and production build)
    backendPath = path.join(__dirname, '..', '..', 'backend', 'main');
    cwd = path.join(__dirname, '..', '..', 'backend');
  }

  console.log('Starting backend server...');
  console.log('Backend path:', backendPath);
  console.log('Working directory:', cwd);
  
  // Always run the compiled binary (we built it already)
  backendProcess = spawn(backendPath, [], {
    stdio: 'inherit',
    cwd: cwd
  });

  backendProcess.on('error', (err) => {
    console.error('Failed to start backend server:', err);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend server exited with code ${code}`);
  });

  return new Promise((resolve) => {
    // Wait for backend to start (simple delay)
    setTimeout(() => {
      console.log('Backend server should be running on http://localhost:8080');
      resolve();
    }, 3000);
  });
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false // Allow requests to localhost
    },
    icon: path.join(__dirname, 'public', 'favicon.ico'),
    titleBarStyle: 'default',
    show: false // Don't show until ready
  });

  // Remove default menu bar
  Menu.setApplicationMenu(null);

  // Load the app
  let startUrl;
  
  if (isDev) {
    startUrl = 'http://localhost:3000';
  } else {
    // When running from public folder, look for build files in ../build
    // When packaged, the build files are in the same directory as electron.js
    const indexPath = app.isPackaged 
      ? path.join(__dirname, 'index.html')
      : path.join(__dirname, '..', 'build', 'index.html');
    startUrl = `file://${indexPath}`;
  }
    
  console.log('Loading app from:', startUrl);
  console.log('isDev:', isDev);
  console.log('app.isPackaged:', app.isPackaged);
  console.log('__dirname:', __dirname);
  
  mainWindow.loadURL(startUrl).catch((error) => {
    console.error('Failed to load URL:', startUrl, 'Error:', error);
  });

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

// App event handlers
app.whenReady().then(async () => {
  console.log('PropertyCare Desktop App starting...');
  
  try {
    // Start backend server first
    await startBackendServer();
    
    // Then create the main window
    createWindow();
  } catch (error) {
    console.error('Failed to start application:', error);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Kill backend process when app closes
  if (backendProcess) {
    console.log('Stopping backend server...');
    backendProcess.kill();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Kill backend process when app quits
  if (backendProcess) {
    console.log('Stopping backend server...');
    backendProcess.kill();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    require('electron').shell.openExternal(navigationUrl);
  });
}); 