import { ipcMain } from 'electron';

import { Executable, jPC } from '../../logic';

export const runProgram = () =>
  ipcMain.handle("runProgram", async (_event, ...args) => {
    /**
     * Get Queries
     */
    const queries = args[0];

    const { nameOfProgram, user }: Executable.Queries = queries;

    /**
     * Run Program && Return
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

    if (nameOfProgram === null || user === null) {
      res = {
        status: 400,
        statusText: "Queries must have values.",
      };
    } else {
      try {
        jPC
          .launchProgram({
            name: nameOfProgram,
            user,
          })()
          .then((either) =>
            either._tag === "Left"
              ? console.log(either.left.message)
              : undefined
          );
        res = {
          status: 200,
          statusText: undefined,
        };
      } catch (error) {
        res = {
          status: 400,
          statusText: JSON.stringify(error),
        };
      }
    }
    return res;
  });
