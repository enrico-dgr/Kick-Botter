import { flow, pipe } from 'fp-ts/lib/function';

import * as WP from '../../../src/WebProgram';

const dummyRepeat: <A>(
  millis: number,
  numberOfTimes: number
) => (awp: (a: A) => WP.WebProgram<A>) => (a: A) => WP.WebProgram<A> = <A>(
  millis: number,
  numberOfTimes: number
) => (awp: (a: A) => WP.WebProgram<A>) =>
  flow(
    awp,
    WP.chain((a) =>
      numberOfTimes > 1
        ? pipe(
            undefined,
            WP.delay(millis),
            WP.chain(() => dummyRepeat<A>(millis, numberOfTimes - 1)(awp)(a))
          )
        : WP.right(a)
    )
  );

const chainNTimes: <A>(
  millis: number,
  numberOfTimes: number
) => (
  awp: (a: A) => WP.WebProgram<A>
) => (wp: WP.WebProgram<A>) => WP.WebProgram<A> = <A>(
  millis: number,
  numberOfTimes: number
) => (awp: (a: A) => WP.WebProgram<A>) => (wp: WP.WebProgram<A>) =>
  pipe(wp, WP.chain(dummyRepeat<A>(millis, numberOfTimes)(awp)));
export interface PlanDeps {
  readonly init: WP.WebProgram<void>;
  readonly routine: WP.WebProgram<void>;
  readonly end: WP.WebProgram<void>;
}
/**
 *
 */
export const plan = (D: PlanDeps) => {
  return pipe(
    D.init,
    chainNTimes<void>(100, 10)(() => D.routine),
    WP.chain(() => D.end)
  );
};
