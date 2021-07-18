import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import * as t from 'io-ts';
import { WebDeps as WD, WebProgram as WP } from 'launch-page';

export namespace Models {
  export const ProgramOptions = t.type({
    extraOptions: t.UnknownRecord,
    launchOptions: t.UnknownRecord,
  });

  export type ProgramOptions = t.TypeOf<typeof ProgramOptions>;
  /**
   * It is not intended to construct instances on your own.
   * Use `getProgram` instead.
   */
  export interface Program<ExtraOptions, B> {
    name: string;
    defaultOptions: ProgramOptions;
    self: (extraOptions: ExtraOptions) => WP.WebProgram<B>;
    end: () => TE.TaskEither<Error, void>;
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
 * Get Program
 */
export const buildProgram = <ProgramOptions, B>(
  program: Models.Program<ProgramOptions, B>
): Models.Program<ProgramOptions, B> => ({
  ...program,
  self: (options: ProgramOptions) =>
    pipe(options, program.self, closeBrowserAtEnd),
});
