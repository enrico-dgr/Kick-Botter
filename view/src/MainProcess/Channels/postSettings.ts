import { ipcMain } from 'electron';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';

import { jsonPC, ProgramController as PC } from '../../logic';

export const postSettings = () =>
  ipcMain.handle("postSettings", (_event, ...args) =>
    pipe(
      PC.Models.ProgramDatabasesSharedProps.decode(args[0]),
      E.mapLeft((e) => new Error(JSON.stringify(e))),
      E.chain((validatedQueries) =>
        pipe(
          PC.Models.ProgramOptions.decode(args[1]),
          E.mapLeft((e) => new Error(JSON.stringify(e))),
          E.map(
            (validatedOptions): PC.Models.ProgramOptions => ({
              ...validatedQueries,
              ...validatedOptions,
            })
          )
        )
      ),
      E.match(TE.left, jsonPC.setOptions)
    )()
  );
