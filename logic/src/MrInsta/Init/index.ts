import { pipe } from 'fp-ts/lib/function';

import * as WP from '../../../src/WebProgram';

export interface InitDeps {
  readonly goToGrowthPlansPage: WP.WebProgram<void>;
  readonly activatePlan: WP.WebProgram<void>;
}
/**
 *
 * @param D
 * @returns The element used to follow.
 */
export const init = (D: InitDeps) => {
  return pipe(
    D.goToGrowthPlansPage,
    WP.chain(() => D.activatePlan)
  );
};
