import { ipcMain } from 'electron';
import * as E from 'fp-ts/Either';

import { Programs } from '../../Programs';

/**
 *
 * @returns
 * ```ts
 * type return = E.Either<{
 *    names: string[]
 * }>
 * ```
 */
export const getPrograms = () =>
  ipcMain.handle("getPrograms", async () =>
    E.right({
      names: Programs.map(({ name }) => name),
    })
  );
