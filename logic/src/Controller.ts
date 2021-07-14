import { identity, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { Puppeteer as P, utils as LP_utils } from 'launch-page';

import { Options, Program } from './Program';

// ------------------------------------
// Models
// ------------------------------------
/**
 *
 */
type SetProgram = (
  user: string,
  nameOfProgram: string
) => O.Option<Program<any, any>>;
/**
 *
 */
type GetProgram = (
  user: string,
  nameOfProgram: string
) => O.Option<Program<any, any>>;
/**
 *
 */
type GetOptions = <ProgramOptions>(
  user: string,
  nameOfProgram: string
) => TE.TaskEither<Error, O.Option<Options<ProgramOptions>>>;
/**
 *
 */
type SetOptions = (
  user: string,
  nameOfProgram: string
) => <ProgramOptions>(
  options: Options<ProgramOptions>
) => TE.TaskEither<Error, void>;
/**
 *
 */
export interface ControllerOfPrograms {
  launchProgram: <A>(user: string, program: string) => TE.TaskEither<Error, A>;
  endProgram: (
    user: string,
    nameOfProgram: string
  ) => TE.TaskEither<Error, void>;
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
  getOptions: GetOptions
) => <A>(user: string, nameOfProgram: string): TE.TaskEither<Error, A> =>
  pipe(
    setProgram(user, nameOfProgram),
    O.match(
      () => TE.left(new Error(`Program not found.`)),
      (program) => TE.right(program)
    ),
    TE.chain((program) =>
      pipe(
        getOptions(user, program.name),
        TE.map(O.match(() => program.defaultOptions, identity)),
        TE.chain(({ programOptions, launchOptions }) =>
          pipe(
            P.launchPage(launchOptions),
            LP_utils.startFrom<A>(program.self(programOptions))
          )
        )
      )
    )
  );
/**
 *
 */
const getEndProgram = (getProgram: GetProgram) => (
  user: string,
  nameOfProgram: string
): TE.TaskEither<Error, void> =>
  pipe(
    getProgram(user, nameOfProgram),
    O.match(
      () => TE.left(new Error(`Program is not running.`)),
      (program) => program.end()
    )
  );
/**
 *
 */
export const buildController = (getProgram: GetProgram) => (
  getOptions: GetOptions,
  setOptions: SetOptions
): ControllerOfPrograms => ({
  launchProgram: getLaunchProgram(getProgram)(getOptions),
  endProgram: getEndProgram(getProgram),
  getOptions,
  setOptions,
});
