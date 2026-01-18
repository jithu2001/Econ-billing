const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const net = require('net');

let mainWindow;
let backendProcess;
let serverPort = 8080;

// Find an available port
function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1));
    });
  });
}

// Wait for server to be ready
function waitForServer(port, maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      const client = net.createConnection({ port }, () => {
        client.end();
        resolve();
      });
      client.on('error', () => {
        if (attempts < maxAttempts) {
          setTimeout(check, 500);
        } else {
          reject(new Error('Server did not start in time'));
        }
      });
    };
    check();
  });
}

// Start the Go backend server
async function startBackend() {
  serverPort = await findAvailablePort(8080);

  // Determine the path to the backend executable
  let backendPath;
  if (app.isPackaged) {
    // Production: executable is in resources folder
    backendPath = path.join(process.resourcesPath, 'backend', 'econ.exe');
  } else {
    // Development: use the backend from parent directory
    backendPath = path.join(__dirname, 'backend', 'econ.exe');
  }

  // Set database path to user data folder for persistence
  const userDataPath = app.getPath('userData');
  const databasePath = path.join(userDataPath, 'trinity.db');

  console.log('Starting backend from:', backendPath);
  console.log('Using port:', serverPort);
  console.log('Database path:', databasePath);

  // Set environment variables for port and database path
  const env = {
    ...process.env,
    SERVER_PORT: serverPort.toString(),
    DATABASE_PATH: databasePath
  };

  backendProcess = spawn(backendPath, ['--no-browser'], {
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });

  backendProcess.on('error', (err) => {
    console.error('Failed to start backend:', err);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });

  // Wait for server to be ready
  await waitForServer(serverPort);
  console.log('Backend server is ready');
}

// Create the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'icon.ico'),
    show: false,
    backgroundColor: '#0f172a',
    autoHideMenuBar: true
  });

  // Load the app
  mainWindow.loadURL(`http://localhost:${serverPort}`);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(async () => {
  try {
    await startBackend();
    createWindow();
  } catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  // Kill the backend process
  if (backendProcess) {
    backendProcess.kill();
  }
  app.quit();
});

app.on('before-quit', () => {
  // Ensure backend is killed
  if (backendProcess) {
    backendProcess.kill();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
