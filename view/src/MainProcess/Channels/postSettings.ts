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
export const postSettings = () =>
  ipcMain.handle("postSettings", async (_event, ...args) => {
    /**
     * Get DB of Settings
     */
    const safeDB = Executable.getJson();
    /**
     * Get Queries
     */
    const queries = args[0];

    const { nameOfProgram, user }: Executable.Queries = queries;

    /**
     * Get New Settings
     */
    const newSettings = args[1] as Executable.Settings;
    /**
     * Query Settings
     */
    const indexOfSettings = fromSafeDB(safeDB).findIndex(
      ({ nameOfProgram, user: thisUser }) =>
        nameOfProgram === nameOfProgram && thisUser === user
    );
    /**
     * Post
     */
    // default res
    type Response = {
      status: number;
      statusText?: string;
    };
    let res: Response = {
      status: 500,
      statusText: "No action by the server.",
    };

    /**
     * Return
     */
    if (indexOfSettings < 0) {
      res = {
        status: 400,
        statusText: "User has not settings for this program.",
      };
    } else if (nameOfProgram === null || user === null) {
      res = {
        status: 400,
        statusText: "Queries must have values.",
      };
    } else if (
      newSettings === undefined ||
      typeof newSettings !== typeof fromSafeDB(safeDB)[indexOfSettings]
    ) {
      res = {
        status: 400,
        statusText: "New settings don't match type of previous ones.",
      };
    } else {
      const post = await Executable.modifyDepsOnJsonFile(
        nameOfProgram,
        user
      )({
        nameOfProgram,
        user,
        ...newSettings,
      } as Executable.Deps)();
      res = match<
        void,
        {
          status: number;
          statusText: string | undefined;
        }
      >(
        () => ({
          status: 200,
          statusText: undefined,
        }),
        (e) => ({
          status: 500,
          statusText: e.message,
        })
      )(post);
    }

    return res;
  });
