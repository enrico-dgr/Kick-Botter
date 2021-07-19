import { ipcMain } from 'electron';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';

import { jsonPC } from '../../../../logic/src';

/**
 * utils
 */
const array_unique = <A>(user: A, index: number, arr: A[]) =>
  arr.indexOf(user) === index;

export const getUsers = () =>
  ipcMain.handle("getUsers", async () =>
    pipe(
      await jsonPC.getOptionsDB()(),
      E.map((OptionsDB) => OptionsDB.map((os) => os.user).filter(array_unique)),
      E.chain((users) =>
        pipe(
          t.array(t.string).decode(users),
          E.mapLeft((e) => new Error(JSON.stringify(e)))
        )
      )
    )
  );
