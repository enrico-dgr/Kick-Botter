import { pipe } from 'fp-ts/lib/function';
import { WebProgram as WP } from 'launch-page';
import { launchOptions } from 'src/LaunchOptions';
import { buildProgram, Models as PModels } from 'src/Program';

import { Models as PCModels } from '../ProgramController';

const NAME = "OpenBrowser";

const self = (D: PModels.ProgramDeps) => (): WP.WebProgram<void> =>
  pipe(
    WP.fromTaskEither(D.running),
    WP.chain((running) => (running ? self(D)() : WP.of(undefined)))
  );

const defaultOptions: PCModels.ProgramOptions = {
  name: NAME,
  user: "generic",
  extraOptions: {},
  launchOptions: launchOptions({}) as {
    [key: string]: unknown;
  },
};

export const build = buildProgram({
  name: NAME,
  defaultOptions,
  self,
});
