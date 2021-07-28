import { app, ipcMain } from 'electron';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';

import { electron as eTG } from '../../TypeGuards';

export const openLocal = () =>
  ipcMain.handle("getPath", (_event, ...args) =>
    pipe(
      eTG.GetPath.paramsType.decode(args[0]),
      E.mapLeft((e) => new Error(JSON.stringify(e))),
      E.chain((params) =>
        E.tryCatch(
          () => app.getPath(params.name),
          (e) => new Error(JSON.stringify(e))
        )
      ),
      E.map(
        (path): eTG.GetPath.ResultType => ({
          path,
        })
      ),
      TE.fromEither
    )()
  );
