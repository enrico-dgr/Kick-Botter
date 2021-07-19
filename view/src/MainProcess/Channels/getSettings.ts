import { ipcMain } from 'electron';

import { Executable } from '../../logic';

type Either<E, A> = { _tag: "Left"; left: E } | { _tag: "Right"; right: A };
/**
 * utils
 */

const match = <A, B>(onRight: (a: A) => B, onLeft: (e: Error) => B) => (
  safeItem: Either<Error, A>
) =>
  safeItem._tag === "Right" ? onRight(safeItem.right) : onLeft(safeItem.left);
//
const fromSafeDB = (safeItem: Either<Error, Executable.Deps[]>) =>
  match<Executable.Deps[], Executable.Deps[]>(
    (a) => a,
    (_e) => []
  )(safeItem);
export const getSettings = () =>
  ipcMain.on("getSettings", (event, ...args) => {
    /**
     * Get DB of Settings
     */
    const safeDB = Executable.getJson();
    /**
     * Get Queries
     */

    const queries = args[0];
    const { program, user } = queries ?? {
      user: "unknown",
      program: "unknown",
    };
    /**
     * Query Settings
     */
    const settings = fromSafeDB(safeDB).find(
      ({ nameOfProgram, user: thisUser }) =>
        nameOfProgram === program && thisUser === user
    );
    /**
     * Return
     */
    const res =
      settings !== undefined
        ? {
            programOptions: settings.programOptions,
            launchOptions: settings.launchOptions,
          }
        : {};
    event.returnValue = res;
  });
