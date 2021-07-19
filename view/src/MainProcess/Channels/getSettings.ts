import { ipcMain } from 'electron';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';

import { jsonPC, ProgramController as PC } from '../../logic';

export const getSettings = () =>
  ipcMain.handle("getSettings", (_event, ...args) =>
    pipe(
      PC.Models.ProgramDatabasesSharedProps.decode(args[0]),
      E.mapLeft((e) => new Error(JSON.stringify(e))),
      TE.fromEither,
      TE.chain((queries) => jsonPC.getOptions(queries)),
      TE.map(
        O.match(
          () => ({}),
          ({
            extraOptions,
            launchOptions,
          }): PC.Models.ProgramOptionsPropsOnly => ({
            extraOptions,
            launchOptions,
          })
        )
      )
    )()
  );
