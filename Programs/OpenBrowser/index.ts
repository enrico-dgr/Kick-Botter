import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import { WebProgram as WP } from 'launch-page';

import * as LO from '../LaunchOptions';
import { buildProgram, Models as PModels } from '../Program';

const NAME = "OpenBrowser";

const self = (D: PModels.ProgramDeps) => (): WP.WebProgram<void> =>
  pipe(
    WP.ask(),
    WP.chain((r) =>
      WP.fromTaskEither(async () => {
        let running: boolean = true;
        let res: E.Either<Error, void> = E.left(
          new Error(`Open Browser closed instantly.`)
        );

        while (running) {
          await pipe(
            D.running,
            TE.map((running) => r.page.browser().isConnected() && running),
            TE.chainFirst(() => TE.fromTask(T.delay(1000)(T.of(undefined)))),
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
      })
    )
  );

const defaultOptions: PModels.DefaultOptions = (D) => ({
  extraOptions: {},
  launchOptions: LO.launchOptions(D),
});

const program = buildProgram({
  name: NAME,
  defaultOptions,
  self,
});

export default program;
