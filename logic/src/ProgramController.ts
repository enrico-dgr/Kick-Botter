import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import * as t from 'io-ts';
import { Puppeteer as P, utils as LP_utils } from 'launch-page';

import * as Program from './Program';

// ------------------------------------
// Models
// ------------------------------------
/**
 *
 */

export const ProgramQueries = t.type({
  user: t.string,
  name: t.string,
});
export type ProgramQueries = t.TypeOf<typeof ProgramQueries>;
/**
 *
 */
export interface ProgramModel<ProgramOptions, B> extends ProgramQueries {
  program: Program.Program<ProgramOptions, B>;
}
/**
 *
 */
const State = t.type({});
/**
 *
 */
export interface ProgramStateModel<ProgramOptions, B> extends ProgramQueries {
  program: Program.Program<ProgramOptions, B>;
}
/**
 *
 */
export type GetProgram = (
  programQueries: ProgramQueries
) => TE.TaskEither<Error, O.Option<ProgramModel<any, any>>>;
/**
 * @returns the new set program
 */
export type SetProgram = (
  programQueries: ProgramQueries
) => TE.TaskEither<Error, O.Option<ProgramModel<any, any>>>;
/**
 *
 */
export type GetOptions = <ProgramOptions>(
  programQueries: ProgramQueries
) => TE.TaskEither<Error, O.Option<Program.ProgramOptions<ProgramOptions>>>;
/**
 *
 */
export type SetOptions = (
  programQueries: ProgramQueries
) => <ProgramOptions>(
  options: Program.ProgramOptions<ProgramOptions>
) => TE.TaskEither<Error, void>;
/**
 *
 */
export interface ProgramController {
  launchProgram: <A>(programQueries: ProgramQueries) => TE.TaskEither<Error, A>;
  endProgram: (programQueries: ProgramQueries) => TE.TaskEither<Error, void>;
  getOptions: GetOptions;
  setOptions: SetOptions;
}
/**
 *
 */
export interface BuilderDeps {
  getProgram: GetProgram;
  setProgram: SetProgram;
  getOptions: GetOptions;
  setOptions: SetOptions;
}
// ------------------------------------
// Constructors
// ------------------------------------
/**
 *
 */
const getLaunchProgram = (setProgram: SetProgram) => (
  getOptions: GetOptions,
  setOptions: SetOptions
) => <A>({ user, name }: ProgramQueries): TE.TaskEither<Error, A> =>
  pipe(
    setProgram({ user, name }),
    TE.chain(
      O.match(
        () => TE.left(new Error(`Program not found.`)),
        (program) => TE.right(program)
      )
    ),
    TE.chain((program) =>
      pipe(
        getOptions({ user, name: program.name }),
        TE.chain(
          O.match(
            () =>
              pipe(
                TE.of(program.program.defaultOptions),
                TE.chainFirst(setOptions({ user, name }))
              ),
            TE.of
          )
        ),
        TE.chain(({ extraOptions: programOptions, launchOptions }) =>
          pipe(
            P.launchPage(launchOptions),
            LP_utils.startFrom<A>(program.program.self(programOptions))
          )
        )
      )
    )
  );
/**
 *
 */
const getEndProgram = (getProgram: GetProgram) => ({
  user,
  name,
}: ProgramQueries): TE.TaskEither<Error, void> =>
  pipe(
    getProgram({ user, name }),
    TE.chain(
      O.match(
        () => TE.left(new Error(`Program is not running.`)),
        (program) => program.program.end()
      )
    )
  );
/**
 *
 */
export const buildController = ({
  getProgram,
  setProgram,
  getOptions,
  setOptions,
}: BuilderDeps): ProgramController => ({
  launchProgram: getLaunchProgram(setProgram)(getOptions, setOptions),
  endProgram: getEndProgram(getProgram),
  getOptions,
  setOptions,
});
