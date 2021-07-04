import { app, BrowserWindow } from 'electron';
import path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "./preload"),
    },
  });

  win.loadFile(path.join(__dirname, "./index.html"));
}

/**
 *
 */
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
/**
 *
 */
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
