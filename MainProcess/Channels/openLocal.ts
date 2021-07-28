import { execSync } from 'child_process';
import { app, ipcMain } from 'electron';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';

const LOCAL = app.getPath("userData");

export const openLocal = () =>
  ipcMain.handle("openLocal", (_event, ..._args) =>
    pipe(
      // possible outcomes -> 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
      /^win/.test(process.platform),
      (isWin) =>
        E.tryCatch<Error, any>(
          () => execSync((isWin ? "start " : "open ") + LOCAL),
          (_e) => new Error("Failed to open local files.")
        ),
      TE.fromEither
    )()
  );
