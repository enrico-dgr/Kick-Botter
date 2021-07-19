import { ipcMain } from 'electron';

import { Programs } from '../../../../logic/src';

export const getPrograms = () =>
  ipcMain.handle("getUsers", async () => Programs.map(({ name }) => name));
