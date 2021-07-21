import { app, BrowserWindow } from 'electron';
import path from 'path';

import { Channels } from './MainProcess';

require("update-electron-app")();
function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "./Preload/index"),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  win.loadFile(path.join(__dirname, "./index.html"));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
// --------------------------------
// Channels
// --------------------------------
Channels.default.forEach((channel) => channel());
