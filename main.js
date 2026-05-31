/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const remote = require('@electron/remote/main');
const fs = require('fs');

let mainWindow;
let openFromProtocolUrl = '';

const BOUNDS_PATH = path.join(app.getPath('userData'), 'window-bounds.json');

const saveBounds = () => {
  if (!mainWindow) return;
  const bounds = mainWindow.getBounds();
  try {
    fs.writeFileSync(BOUNDS_PATH, JSON.stringify(bounds));
  } catch {}
};

const loadBounds = () => {
  try {
    const data = fs.readFileSync(BOUNDS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
};

const openUrl = (url) => {
  mainWindow.isMinimized() && mainWindow.restore();
  mainWindow.webContents.send('open-url', decodeURIComponent(url));
};
remote.initialize();
module.exports = { mainWindow: mainWindow };
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('file', process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient('file');
}
function createWindow() {
  const saved = loadBounds();
  mainWindow = new BrowserWindow({
    width: saved?.width || 1440,
    height: saved?.height || 1000,
    x: saved?.x,
    y: saved?.y,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false,
    },
  });

  // Restore maximized state
  if (saved?.isMaximized) {
    mainWindow.maximize();
  }

  remote.enable(mainWindow.webContents);
  setTimeout(() => {
    openFromProtocolUrl = process.argv.slice(2).join(' ');
    if (openFromProtocolUrl) {
      openUrl(openFromProtocolUrl);
      openFromProtocolUrl = '';
    }
  }, 1500);

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    mainWindow.loadURL(`http://localhost:3000/#/Normal`);
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, 'dist', 'index.html'),
        protocol: 'file:',
        slashes: true,
      }),
    );
  }

  mainWindow.on('close', saveBounds);
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}
app.on('ready', () => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      mainWindow.show();
      openUrl(commandLine.slice(2).join(' '));
    }
  });

  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
  });

  const openUrlListener = function (_event, url) {
    if (mainWindow) {
      openUrl(url);
    } else {
      openFromProtocolUrl = url;
    }
  };
  app.on('open-url', openUrlListener);
  ipcMain.on('min', () => mainWindow.minimize());
  ipcMain.on('hide', () => {
    mainWindow.hide();
    mainWindow.setSkipTaskbar(false);
  });
  ipcMain.on('close', () => mainWindow.close());
  ipcMain.on('console', () =>
    mainWindow.webContents.openDevTools({ mode: 'detach' }),
  );
  ipcMain.on('relaunch', () => {
    app.relaunch();
    app.exit();
  });
  ipcMain.on('max', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
      return;
    }
    mainWindow.maximize();
  });
}
