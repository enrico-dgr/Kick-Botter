import { app, BrowserWindow } from 'electron';
import path from 'path';
import update from 'update-electron-app';

import { Channels, Programs, WhenReady } from './MainProcess';

try {
  update();
} catch (error) {
  console.error(error);
}

// --------------------------------
// WhenReady
// --------------------------------
function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "./preload"),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  win.loadFile(path.join(__dirname, "./index.html"));
}

const genericCreateWindow = () => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
};

WhenReady([genericCreateWindow]);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
// --------------------------------
// Channels
// --------------------------------
Channels.default.forEach((channel) => channel());
// --------------------------------
// Programs
// --------------------------------

const jsonPC = Programs.JsonProgramController(
  path.join(app.getPath("userData"), "Programs")
);

// --------------------------------
// Exports
// --------------------------------
export { jsonPC };
