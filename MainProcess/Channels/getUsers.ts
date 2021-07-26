import { ipcMain } from 'electron';
import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as S from 'fp-ts/string';

import { jsonPC } from '../../Programs';

/**
 *
 * @returns
 * ```ts
 * type return = E.Either<{
 *    users: string[]
 * }>
 * ```
 */
export const getUsers = () =>
  ipcMain.handle("getUsers", async () =>
    pipe(
      await jsonPC.getOptionsDB()(),
      E.map((OptionsDB) => ({
        users: pipe(
          OptionsDB.map((os) => os.user),
          A.uniq(S.Eq)
        ),
      }))
    )
  );
