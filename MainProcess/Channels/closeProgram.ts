import { ipcMain } from 'electron';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';

import { jsonPC, ProgramController as PC } from '../../Programs';

export const runProgram = () =>
  ipcMain.handle("closeProgram", (_event, ...args) =>
    pipe(
      PC.Models.ProgramDatabasesSharedProps.decode(args[0]),
      E.mapLeft((es) => new Error(JSON.stringify(es))),
      E.match(TE.left, ({ user, name }) =>
        jsonPC.endProgram({
          name,
          user,
        })
      )
    )()
  );
