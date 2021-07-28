import { app, ipcMain } from 'electron';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import path from 'path';

import { jsonPC } from '../../index';
import { ProgramController as PC, Programs } from '../../Programs';

const LOCAL = path.join(
  app.getPath("userData").replace(/\s/g, "\\ "),
  "Programs"
);
/**
 *
 * @returns
 * ```ts
 * type return = Promise<E.Either<Error, PC.Models.ProgramOptionsPropsOnly>>
 * ```
 */
export const getSettings = () =>
  ipcMain.handle("getSettings", (_event, ...args) =>
    pipe(
      PC.Models.ProgramDatabasesSharedProps.decode(args[0]),
      E.mapLeft((e) => new Error(JSON.stringify(e))),
      TE.fromEither,
      TE.chain((queries) =>
        pipe(
          jsonPC.getOptions(queries),
          TE.chain(
            O.match(
              (): TE.TaskEither<Error, PC.Models.ProgramOptionsPropsOnly> =>
                pipe(
                  Programs.find(({ name }) => name === queries.name),
                  (program) =>
                    program === undefined
                      ? TE.right({ extraOptions: null, launchOptions: {} })
                      : TE.right(
                          program.defaultOptions({
                            user: queries.user,
                            baseDirPath: LOCAL,
                          })
                        )
                ),
              ({
                extraOptions,
                launchOptions,
              }): TE.TaskEither<Error, PC.Models.ProgramOptionsPropsOnly> =>
                TE.right({
                  extraOptions,
                  launchOptions,
                })
            )
          )
        )
      )
    )()
  );
