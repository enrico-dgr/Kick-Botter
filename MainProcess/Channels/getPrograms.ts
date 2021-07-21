import { ipcMain } from 'electron';

import { Programs } from '../../../../logic/src';

/**
 *
 * @returns
 * ```ts
 * type return {
 *    names: string[]
 * }
 * ```
 */
export const getPrograms = () =>
  ipcMain.handle("getPrograms", async () => ({
    names: Programs.map(({ name }) => name),
  }));
