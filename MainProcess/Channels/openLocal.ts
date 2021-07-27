import { execSync } from 'child_process';
import { ipcMain } from 'electron';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import path from 'path';

const LOCAL = path.resolve(__dirname, "../../Programs/local");

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
