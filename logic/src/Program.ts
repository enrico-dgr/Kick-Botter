import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { Puppeteer as P, WebDeps as WD, WebProgram as WP } from 'launch-page';

// ------------------------------------
// Models
// ------------------------------------
/**
 *
 */
/**
 *
 */
export interface Options<ProgramOptions> {
  programOptions: ProgramOptions;
  launchOptions: P.LaunchOptions;
}
/**
 * It is not intended to construct instances on your own.
 * Use `getProgram` instead.
 */
export interface Program<ProgramOptions, B> {
  name: string;
  defaultOptions: Options<ProgramOptions>;
  self: (options: ProgramOptions) => WP.WebProgram<B>;
  end: () => TE.TaskEither<Error, void>;
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
 * Get Program
 */
export const buildProgram = <ProgramOptions, B>(
  program: Program<ProgramOptions, B>
): Program<ProgramOptions, B> => ({
  ...program,
  self: (options: ProgramOptions) =>
    pipe(options, program.self, closeBrowserAtEnd),
});
