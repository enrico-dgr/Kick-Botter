import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import * as t from 'io-ts';
import { Puppeteer as P, utils as LP_utils } from 'launch-page';

import * as Program from './Program';

export namespace Models {
  export const ProgramDatabasesSharedProps = t.type({
    user: t.string,
    name: t.string,
  });

  export type ProgramDatabasesSharedProps = t.TypeOf<
    typeof ProgramDatabasesSharedProps
  >;

  export const ProgramStatePropsOnly = t.type({
    running: t.boolean,
  });

  export const ProgramState = t.intersection([
    ProgramDatabasesSharedProps,
    ProgramStatePropsOnly,
  ]);

  export type ProgramState = t.TypeOf<typeof ProgramState>;

  export const ProgramOptionsPropsOnly = Program.Models.ProgramOptions;

  export type ProgramOptionsPropsOnly = Program.Models.ProgramOptions;

  export const ProgramOptions = t.intersection([
    ProgramDatabasesSharedProps,
    ProgramOptionsPropsOnly,
  ]);

  export type ProgramOptions = t.TypeOf<typeof ProgramOptions>;
  export namespace Methods {
    export type GetProgram = (
      programQueries: Pick<ProgramState, "name" | "user">
    ) => TE.TaskEither<Error, O.Option<ProgramState>>;

    export type SetProgram = (
      programState: ProgramState
    ) => TE.TaskEither<Error, void>;

    export type GetOptionsDB = () => TE.TaskEither<Error, ProgramOptions[]>;

    export type GetOptions = (
      programQueries: Pick<ProgramOptions, "name" | "user">
    ) => TE.TaskEither<Error, O.Option<ProgramOptions>>;

    export type SetOptions = (
      options: ProgramOptions
    ) => TE.TaskEither<Error, void>;
  }
  export interface ProgramController {
    launchProgram: (
      programQueries: Pick<Models.ProgramState, "name" | "user">
    ) => TE.TaskEither<Error, void>;
    endProgram: (
      programQueries: Models.ProgramState
    ) => TE.TaskEither<Error, void>;
    getOptionsDB: Models.Methods.GetOptionsDB;
    getOptions: Models.Methods.GetOptions;
    setOptions: Models.Methods.SetOptions;
  }

  type Running = TE.TaskEither<Error, boolean>;
  export type BuilderRunning = (
    queries: ProgramDatabasesSharedProps
  ) => Running;
  export interface BuilderDeps {
    builderRunning: BuilderRunning;
    programs: Program.Models.Program<any, any>[];
    getProgram: Models.Methods.GetProgram;
    setProgram: Models.Methods.SetProgram;
    getOptionsDB: Models.Methods.GetOptionsDB;
    getOptions: Models.Methods.GetOptions;
    setOptions: Models.Methods.SetOptions;
  }
}
namespace Constructors {
  export const buildLaunchProgram = (
    D: Models.BuilderDeps
  ): Models.ProgramController["launchProgram"] => ({
    user,
    name,
  }): TE.TaskEither<Error, void> =>
    pipe(
      // find if program exists
      D.programs,
      A.findFirst((program) => program.name === name),
      O.match(
        () => TE.left(new Error(`Program not found.`)),
        (program) => TE.right(program)
      ),
      // get options
      TE.chain((program) =>
        pipe(
          D.getOptions({ user, name: program.name }),
          TE.chain(
            O.match(
              () =>
                pipe(
                  TE.of(
                    program.defaultOptions({
                      user,
                    })
                  ),
                  TE.chainFirst((dO) => D.setOptions({ user, name, ...dO }))
                ),
              (existingOptions) => TE.of(existingOptions)
            )
          ),
          // run program
          TE.chain(({ extraOptions, launchOptions }) =>
            pipe(
              P.launchPage(launchOptions),
              LP_utils.startFrom(
                program.self({ running: D.builderRunning({ user, name }) })(
                  extraOptions
                )
              )
            )
          )
        )
      ),
      // set program as running
      TE.chain(() =>
        D.setProgram({
          user,
          name,
          running: true,
        })
      )
    );

  export const buildEndProgram = (
    getProgram: Models.Methods.GetProgram,
    setProgram: Models.Methods.SetProgram
  ) => ({ user, name }: Models.ProgramState): TE.TaskEither<Error, void> =>
    pipe(
      getProgram({ user, name }),
      // set program on not-running
      TE.chain(
        O.match(
          () => TE.left(new Error(`Program not found.`)),
          (programState) => setProgram({ ...programState, running: false })
        )
      )
    );
}
/**
 * Given an array of programs, it asks for methods to manipulate
 * database-ish sources.
 */
export const buildController = (
  D: Models.BuilderDeps
): Models.ProgramController => ({
  launchProgram: Constructors["buildLaunchProgram"](D),
  endProgram: Constructors["buildEndProgram"](D.getProgram, D.setProgram),
  getOptionsDB: D.getOptionsDB,
  getOptions: D.getOptions,
  setOptions: D.setOptions,
});
