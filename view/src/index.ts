import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

import { Deps, EnumNamesOfPrograms, getJson } from '../../logic/src/Executable';

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "./preload"),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  win.loadFile(path.join(__dirname, "../../index.html"));
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
// --------------------------------
// Channels
// --------------------------------
/**
 * needed types to avoid conflicts
 */
type Either<E, A> = { _tag: "Left"; left: E } | { _tag: "Right"; right: A };
type Json = string | number | boolean | JsonRecord | JsonArray | null;
interface JsonRecord {
  readonly [key: string]: Json;
}
interface JsonArray extends ReadonlyArray<Json> {}
/**
 * utils
 */
const array_unique = <A>(user: A, index: number, arr: A[]) =>
  arr.indexOf(user) === index;
//
const fromSafe = (safeItem: Either<Error, Deps<Json>[]>) =>
  safeItem._tag === "Right" ? safeItem.right : [];
//
const mapSafe = <A>(
  safeItem: Either<Error, Deps<Json>[]>,
  select: (db: Deps<Json>) => A
) => (safeItem._tag === "Right" ? safeItem.right.map(select) : []);
/**
 * Get Queries
 */
ipcMain.on("getQueries", (event, _args) => {
  //
  /**
   * Get DB of Settings
   */
  const safeDB = getJson();
  /**
   * Get Programs
   */
  let programs = Object.keys(EnumNamesOfPrograms);
  programs = programs.slice(
    programs.length % 2 === 0
      ? programs.length * 0.5
      : Math.round(programs.length * 0.5) - 1
  );
  /**
   * Get Users
   */
  let users = mapSafe<string>(safeDB, (deps) =>
    !!deps.user ? deps.user : "None"
  );

  users = users.filter(array_unique);
  /**
   * Return
   */
  const res: { users: string[]; programs: string[] } = {
    users,
    programs,
  };
  event.returnValue = res;
});
/**
 * Get Settings
 */
ipcMain.on("getSettings", (event, args) => {
  //
  /**
   * Get DB of Settings
   */
  const safeDB = getJson();
  /**
   * Get Queries
   */
  const { program, user } = args[0];
  /**
   * Query Settings
   */
  const settings = fromSafe(safeDB).find(
    ({ nameOfProgram, user: thisUser }) =>
      nameOfProgram === program && thisUser === user
  );
  /**
   * Return
   */
  const res =
    settings !== undefined
      ? {
          programOptions: settings.programOptions,
          launchOptions: settings.launchOptions,
        }
      : {};
  event.returnValue = res;
});
