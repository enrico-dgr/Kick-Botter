import { ipcMain } from 'electron';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';

import { jsonPC, ProgramController as PC } from '../../logic';

export const runProgram = () =>
  ipcMain.handle("runProgram", async (_event, ...args) =>
    pipe(
      PC.Models.ProgramDatabasesSharedProps.decode(args[0]),
      E.mapLeft((es) => new Error(JSON.stringify(es))),
      E.map(({ user, name }) => {
        jsonPC.launchProgram({
          name,
          user,
        })();
      })
    )
  );
