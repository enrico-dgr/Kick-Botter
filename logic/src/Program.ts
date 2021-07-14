import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { WebDeps as WD, WebProgram as WP } from 'launch-page';

// ------------------------------------
// Models
// ------------------------------------
/**
 * It is not intended to construct instances on your own.
 * Use `getProgram` instead.
 */
export interface Program<ProgramOptions, B> {
  name: string;
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
export const getProgram = <ProgramOptions, B>(
  program: Program<ProgramOptions, B>
): Program<ProgramOptions, B> => ({
  name: program.name,
  self: (options: ProgramOptions) =>
    pipe(options, program.self, closeBrowserAtEnd),
  end: program.end,
});
