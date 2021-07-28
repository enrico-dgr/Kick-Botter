import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import * as t from 'io-ts';
import path from 'path';

import * as JsonAPI from './JsonAPI';
import * as Program from './Program';
import * as ProgramController from './ProgramController';

namespace PATHS {
  export const STATES_DB_PATH = (baseDirPath: string) =>
    path.resolve(baseDirPath, "./programsStates.json");
  export const OPTIONS_DB_PATH = (baseDirPath: string) =>
    path.resolve(baseDirPath, "./programsOptions.json");
}
export namespace Models {
  export const StatesDatabase = t.array(ProgramController.Models.ProgramState);

  export const OptionsDatabase = t.array(
    ProgramController.Models.ProgramOptions
  );
}
namespace Utils {
  export namespace Array {
    export const predicateOnUserAndProgramName = ({
      name,
      user,
    }: Pick<ProgramController.Models.ProgramState, "user" | "name">) => <
      T extends ProgramController.Models.ProgramDatabasesSharedProps
    >(
      program: T
    ) => program.name === name && program.user === user;
  }
}

namespace Dependencies {
  const getProgramDB = (baseDirPath: string) => () =>
    pipe(
      JsonAPI.getJson({ absolutePath: PATHS.STATES_DB_PATH(baseDirPath) }),
      // check array type
      E.chain((statesDatabase) =>
        pipe(
          Models.StatesDatabase.decode(statesDatabase),
          E.mapLeft((e) => new Error(JSON.stringify(e, null, 2)))
        )
      ),
      TE.fromEither
    );

  const getProgram = (
    baseDirPath: string
  ): ProgramController.Models.Methods.GetProgram => (programQueries) =>
    pipe(
      getProgramDB(baseDirPath)(),
      TE.map(
        A.findFirst(Utils.Array.predicateOnUserAndProgramName(programQueries))
      )
    );

  const setProgram = (
    baseDirPath: string
  ): ProgramController.Models.Methods.SetProgram => (program) =>
    pipe(
      getProgramDB(baseDirPath)(),
      TE.map((db) => {
        const index = db.findIndex(
          (dbProgam) =>
            dbProgam.name === program.name && dbProgam.user === program.user
        );

        return index > -1
          ? [...db.slice(0, index), program, ...db.slice(index + 1)]
          : [...db, program];
      }),
      TE.chain(
        flow(
          JsonAPI.setJson({ absolutePath: PATHS.STATES_DB_PATH(baseDirPath) }),
          TE.fromEither
        )
      )
    );

  const getOptionsDB = (
    baseDirPath: string
  ): ProgramController.Models.Methods.GetOptionsDB => () =>
    pipe(
      JsonAPI.getJson({ absolutePath: PATHS.OPTIONS_DB_PATH(baseDirPath) }),
      E.chain((optionsDatabase) =>
        pipe(
          Models.OptionsDatabase.decode(optionsDatabase),
          E.mapLeft((e) => new Error(JSON.stringify(e, null, 2)))
        )
      ),
      TE.fromEither
    );

  const getOptions = (
    baseDirPath: string
  ): ProgramController.Models.Methods.GetOptions => (programQueries) =>
    pipe(
      getOptionsDB(baseDirPath)(),
      TE.map(
        A.findFirst(Utils.Array.predicateOnUserAndProgramName(programQueries))
      )
    );

  const setOptions = (
    baseDirPath: string
  ): ProgramController.Models.Methods.SetOptions => (programOptions) =>
    pipe(
      // check type
      ProgramController.Models.ProgramOptions.decode(programOptions),
      E.mapLeft((e) => new Error(JSON.stringify(e, null, 2))),
      // update database
      E.chain(() =>
        pipe(
          JsonAPI.getJson({ absolutePath: PATHS.OPTIONS_DB_PATH(baseDirPath) }),
          E.chain(
            flow(
              Models.OptionsDatabase.decode,
              E.mapLeft((e) => new Error(JSON.stringify(e, null, 2)))
            )
          )
        )
      ),
      E.chain((validatedDB) =>
        pipe(
          ProgramController.Models.ProgramOptions.decode(programOptions),
          E.mapLeft((e) => new Error(JSON.stringify(e, null, 2))),
          E.map((validatedPO) =>
            pipe(
              // exists in db ?
              validatedDB.findIndex(
                ({ name, user }) =>
                  validatedPO.name === name && validatedPO.user === user
              ),
              //
              (index) =>
                index > -1
                  ? // update
                    [
                      ...validatedDB.slice(0, index),
                      validatedPO,
                      ...validatedDB.slice(index + 1),
                    ]
                  : // or add
                    [...validatedDB, validatedPO]
              //
            )
          )
        )
      ),
      E.chain(
        JsonAPI.setJson({ absolutePath: PATHS.OPTIONS_DB_PATH(baseDirPath) })
      ),
      TE.fromEither
    );

  const builderRunning = (
    baseDirPath: string
  ): ProgramController.Models.BuilderRunning => (
    queries: Pick<ProgramController.Models.ProgramOptions, "name" | "user">
  ) =>
    pipe(
      // because `getProgram` run one time if directly called.
      TE.of(getProgram(baseDirPath)),
      TE.chain((func) => func(queries)),
      // ---------------- ↑
      TE.map(
        O.match(
          () => false,
          (programState) => programState.running
        )
      )
    );

  export const deps = (baseDirPath: string) => ({
    baseDirPath,
    builderRunning: builderRunning(baseDirPath),
    getProgram: getProgram(baseDirPath),
    setProgram: setProgram(baseDirPath),
    getOptionsDB: getOptionsDB(baseDirPath),
    getOptions: getOptions(baseDirPath),
    setOptions: setOptions(baseDirPath),
  });
}
// ------------------------------------
// Implementation
// ------------------------------------
export const jsonProgramController = (
  programs: Program.Models.Program<any, any>[]
) => (baseDirPath: string) =>
  ProgramController.buildController({
    ...Dependencies.deps(baseDirPath),
    programs,
  });
