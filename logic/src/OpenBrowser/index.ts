import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { WebProgram as WP } from 'launch-page';
import { launchOptions } from 'src/LaunchOptions';
import { buildProgram } from 'src/Program';

import { Models } from '../ProgramController';

const NAME = "OpenBrowser";

const self = (
  getRunning: TE.TaskEither<Error, boolean>
) => (): WP.WebProgram<void> =>
  pipe(
    WP.fromTaskEither(getRunning),
    WP.chain((running) => (running ? self(getRunning)() : WP.of(undefined)))
  );

const defaultOptions: Models.ProgramOptions = {
  name: NAME,
  user: "generic",
  extraOptions: {},
  launchOptions: launchOptions({}) as {
    [key: string]: unknown;
  },
};

export const build = (getRunning: TE.TaskEither<Error, boolean>) =>
  buildProgram({
    name: NAME,
    defaultOptions,
    self: self(getRunning),
  });
