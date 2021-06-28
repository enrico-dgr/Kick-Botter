import { pipe } from 'fp-ts/lib/function';
import * as S from 'fp-ts/lib/Semigroup';
import * as WP from 'src/WebProgram';

import { chainNOrElse } from '../index';

export interface RoutineDeps<ProfileType> {
  readonly preRetrieveChecks: WP.WebProgram<void>[];
  readonly retrieveProfile: WP.WebProgram<ProfileType>;
  readonly follow: (p: ProfileType) => WP.WebProgram<void>;
  readonly confirm: WP.WebProgram<void>;
  readonly skip: WP.WebProgram<void>;
}
const concatAll = S.concatAll(WP.getSemigroupChain<void>(WP.chain));
/**
 *
 */
export const routine = <ProfileType>(D: RoutineDeps<ProfileType>) => {
  return pipe(
    concatAll(() => WP.of(undefined))(
      D.preRetrieveChecks.map((c) => () => c)
    )(),
    chainNOrElse<void, void>(
      1000,
      5
    )(() =>
      pipe(
        D.retrieveProfile,
        WP.chain(D.follow),
        WP.orElse((e) =>
          pipe(
            D.skip,
            WP.chain(() => WP.left(e))
          )
        )
      )
    ),
    WP.chain(() => D.confirm)
  );
};
