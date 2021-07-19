import { ipcMain } from 'electron';

import { Executable, jPC } from '../../logic';

type Either<E, A> = { _tag: "Left"; left: E } | { _tag: "Right"; right: A };
/**
 * utils
 */
const array_unique = <A>(user: A, index: number, arr: A[]) =>
  arr.indexOf(user) === index;

//
const mapSafe = <D, A>(safeItem: Either<Error, D[]>, select: (db: D) => A) =>
  safeItem._tag === "Right" ? safeItem.right.map(select) : [];
/**
 * Get Queries
 */
export const getQueries = () =>
  ipcMain.handle("getQueries", async () => {
    /**
     * Get DB of Settings
     */
    const safeDB = await jPC.getOptionsDB()();
    /**
     * Get Programs
     */
    let programs = Object.keys(Executable.EnumNamesOfPrograms);
    programs = programs.slice(
      programs.length % 2 === 0
        ? programs.length * 0.5
        : Math.round(programs.length * 0.5) - 1
    );
    /**
     * Get Users
     */
    let users = mapSafe(safeDB, (deps) => (!!deps.user ? deps.user : "None"));

    users = users.filter(array_unique);
    /**
     * Return
     */
    const res: { users: string[]; programs: string[] } = {
      users,
      programs,
    };
    return res;
  });
