import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import * as t from 'io-ts';

import * as JsonAPI from './JsonAPI';
import * as Program from './Program';
import * as ProgramController from './ProgramController';

namespace CONSTANTS {
  export const STATES_DB_PATH = "./programsStates.json";
  export const OPTIONS_DB_PATH = "./programsOptions.json";
}
namespace Models {
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
  const getProgram: ProgramController.Models.Methods.GetProgram = (
    programQueries
  ) =>
    pipe(
      JsonAPI.getJson({ absolutePath: CONSTANTS.STATES_DB_PATH }),
      // check array type
      E.chain((statesDatabase) =>
        pipe(
          Models.StatesDatabase.decode(statesDatabase),
          E.mapLeft((e) => new Error(JSON.stringify(e, null, 2)))
        )
      ),
      //
      E.map(
        A.findFirst(Utils.Array.predicateOnUserAndProgramName(programQueries))
      ),
      TE.fromEither
    );

  const setProgram: ProgramController.Models.Methods.SetProgram = (program) =>
    pipe(
      // check type
      ProgramController.Models.ProgramState.decode(program),
      E.mapLeft((e) => new Error(JSON.stringify(e, null, 2))),
      // update database
      E.chain(() =>
        JsonAPI.getJson({ absolutePath: CONSTANTS.STATES_DB_PATH })
      ),
      E.map((db) => [...db, program]),
      E.chain(JsonAPI.setJson({ absolutePath: CONSTANTS.STATES_DB_PATH })),
      TE.fromEither
    );

  const getOptions: ProgramController.Models.Methods.GetOptions = (
    programQueries
  ) =>
    pipe(
      JsonAPI.getJson({ absolutePath: CONSTANTS.OPTIONS_DB_PATH }),
      E.chain((optionsDatabase) =>
        pipe(
          Models.OptionsDatabase.decode(optionsDatabase),
          E.mapLeft((e) => new Error(JSON.stringify(e, null, 2)))
        )
      ),
      //
      E.map(
        A.findFirst(Utils.Array.predicateOnUserAndProgramName(programQueries))
      ),
      TE.fromEither
    );

  const setOptions: ProgramController.Models.Methods.SetOptions = (
    programOptions
  ) =>
    pipe(
      // check type
      ProgramController.Models.ProgramOptions.decode(programOptions),
      E.mapLeft((e) => new Error(JSON.stringify(e, null, 2))),
      // update database
      E.chain(() =>
        JsonAPI.getJson({ absolutePath: CONSTANTS.OPTIONS_DB_PATH })
      ),
      E.chain((db) =>
        pipe(
          JsonAPI.Models.Json.decode(programOptions),
          E.mapLeft((e) => new Error(JSON.stringify(e, null, 2))),
          E.map((pO) => [...db, pO])
        )
      ),
      E.chain(JsonAPI.setJson({ absolutePath: CONSTANTS.OPTIONS_DB_PATH })),
      TE.fromEither
    );

  const builderRunning: ProgramController.Models.BuilderRunning = flow(
    getProgram,
    TE.map(
      O.match(
        () => false,
        (programState) => programState.running
      )
    )
  );
  export const deps = {
    builderRunning,
    getProgram,
    setProgram,
    getOptions,
    setOptions,
  };
}
// ------------------------------------
// Implementation
// ------------------------------------
export const jsonProgramController = (
  programs: Program.Models.Program<any, any>[]
) =>
  ProgramController.buildController({
    ...Dependencies.deps,
    programs,
  });
