import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import { WebProgram as WP } from 'launch-page';

import { launchOptions } from '../LaunchOptions';
import { buildProgram, Models as PModels } from '../Program';
import { Models as PCModels } from '../ProgramController';

const NAME = "OpenBrowser";

const self = (D: PModels.ProgramDeps) => (): WP.WebProgram<void> =>
  WP.fromTaskEither<void>(async () => {
    let running: boolean = true;
    let res: E.Either<Error, void> = E.left(
      new Error(`Open Browser closed instantly.`)
    );
    while (running) {
      await pipe(
        D.running,
        TE.chainFirst(() => TE.fromTask(T.delay(500)(T.of(undefined)))),
        TE.match(
          (e) => {
            running = false;
            res = E.left(e);
          },
          (running_) => {
            running = running_;
            res = E.right(undefined);
          }
        )
      )();
    }

    return res;
  });

const defaultOptions: PCModels.ProgramOptions = {
  name: NAME,
  user: "generic",
  extraOptions: {},
  launchOptions: launchOptions({}) as {
    [key: string]: unknown;
  },
};

export const program = buildProgram({
  name: NAME,
  defaultOptions,
  self,
});
