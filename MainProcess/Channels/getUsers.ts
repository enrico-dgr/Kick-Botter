import { ipcMain } from 'electron';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';

import { jsonPC } from '../../../../logic/src';

/**
 * utils
 */
const array_unique = <A>(user: A, index: number, arr: A[]) =>
  arr.indexOf(user) === index;

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
        users: OptionsDB.map((os) => os.user).filter(array_unique),
      }))
    )
  );
