import { flow, pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import * as t from 'io-ts';
import { WebDeps as WD, WebProgram as WP } from 'launch-page';

import * as JAPI from './JsonAPI';
import * as LO from './LaunchOptions';

export namespace Models {
  export const ProgramOptions = t.type({
    extraOptions: JAPI.Models.Json,
    launchOptions: LO.Models.LaunchOptions,
  });

  export type ProgramOptions = t.TypeOf<typeof ProgramOptions>;

  export interface ProgramDeps {
    running: TE.TaskEither<Error, boolean>;
  }
  /**
   * It is not intended to construct instances on your own.
   * Use `getProgram` instead.
   */
  export interface Program<ExtraOptions, B> {
    name: string;
    defaultOptions: ProgramOptions;
    self: (D: ProgramDeps) => (extraOptions: ExtraOptions) => WP.WebProgram<B>;
  }
}
// ------------------------------------
// Constructor
// ------------------------------------
/**
 *
 */
const closeBrowserAtEnd = <A>(program: WP.WebProgram<A>) =>
  pipe(
    program,
    WP.chainFirst(() =>
      pipe(
        WD.browser,
        WP.chain((browser) => WP.of(browser.close()))
      )
    )
  );
/**
 * Build Program
 */
export const buildProgram = <ProgramOptions, B>(
  program: Models.Program<ProgramOptions, B>
): Models.Program<ProgramOptions, B> => ({
  ...program,
  self: (D: Models.ProgramDeps) => flow(program.self(D), closeBrowserAtEnd),
});
