import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';

import * as EH from '../../src/ElementHandle';
import * as WD from '../../src/WebDeps';
import * as WP from '../../src/WebProgram';
import * as Instagram from '../Instagram';
import { init } from './Init';
import { plan } from './Plan';
import { routine } from './Routine';
import { UrlsMI, UrlsTM } from './Urls';
import { freeFollower, plansPage } from './XPaths';

const nOrElse: <A, B>(
  millis: number,
  attempts: number
) => (awp: (a: A) => WP.WebProgram<B>) => (a: A) => WP.WebProgram<B> = <A, B>(
  millis: number,
  attempts: number
) => (awp: (a: A) => WP.WebProgram<B>) => (a: A) =>
  pipe(
    a,
    awp,
    WP.orElse((e) =>
      attempts > 1
        ? pipe(
            undefined,
            WP.delay(millis),
            WP.chain(() => nOrElse<A, B>(millis, attempts - 1)(awp)(a))
          )
        : WP.left(e)
    )
  );

export const chainNOrElse: <A, B>(
  millis: number,
  attempts: number
) => (
  awp: (a: A) => WP.WebProgram<B>
) => (wp: WP.WebProgram<A>) => WP.WebProgram<B> = <A, B>(
  millis: number,
  attempts: number
) => (awp: (a: A) => WP.WebProgram<B>) => (wp: WP.WebProgram<A>) =>
  pipe(wp, WP.chain(nOrElse<A, B>(millis, attempts)(awp)));

type SocialPlatform = "MrInsta" | "TurboMedia";
const getBaseUrl = (socialPlatform: SocialPlatform): string => {
  switch (socialPlatform) {
    case "MrInsta":
      return UrlsMI.base.href;

    case "TurboMedia":
      return UrlsTM.base.href;
  }
};
export const initFreeFollower = flow(getBaseUrl, (url: string) =>
  init({
    goToGrowthPlansPage: WD.goto(url),
    activatePlan: pipe(
      WD.waitFor$x(plansPage.freeFollower),
      WP.chain(
        EH.isOneElementArray(
          (els, r) =>
            `Found "${
              els.length
            }" activateFreeFollowersPlan-button(s) on page ${r.page.url()}.\n` +
            `Expected page: ${url}`
        )
      ),
      WP.chain((els) => EH.evaluateClick(els[0]))
    ),
  })
);
/**
 *
 */
export const routineFreeFollower = routine<string>({
  retrieveProfile: pipe(
    WD.waitFor$x(freeFollower.followProfileButton),
    WP.chain(
      EH.isOneElementArray(
        (els, r) => `Found "${els.length}" profile-links at ${r.page.url()}`
      )
    ),
    WP.chain((els) => pipe(els[0], EH.getHref)),
    WP.chain(
      O.match(() => WP.leftAny(`No profile-link href in MrInsta/index`), WP.of)
    )
  ),
  follow: (href) =>
    pipe(
      WP.ask(),
      WP.chain((r) =>
        pipe(
          WD.openNewPage,
          WP.map((page) => ({ r, page }))
        )
      ),
      WP.chainTaskEitherK(({ r, page }) =>
        pipe(
          { ...r, page: page },
          Instagram.FollowUser.followUser({
            language: "it",
            profileUrl: new URL(href),
            options: { allowPrivate: false },
          })
        )
      ),
      WP.chain(() => WP.of(undefined))
    ),
  confirm: pipe(
    WD.closeOtherPages,
    WP.chain(() => WD.waitFor$x(freeFollower.confirmButton)),
    WP.chain(
      EH.isOneElementArray(
        (els, r) => `Found "${els.length}" confirm-buttons at ${r.page.url()}`
      )
    ),
    WP.chain((els) => EH.evaluateClick(els[0]))
  ),
  preRetrieveChecks: [
    pipe(
      WP.of(undefined),
      chainNOrElse<void, void>(
        1000,
        18
      )(() =>
        pipe(
          WD.$x(`//*[contains(.,'Processing')]`),
          WP.chain(
            EH.isZeroElementArray(
              (els, r) =>
                `Found "${els.length}" processing-text at ${r.page.url()}`
            )
          ),
          WP.chain(() => WP.of(undefined))
        )
      )
    ),
    WP.delay<void>(2000)(undefined),
  ],
  /**
   *
   */
  skip: pipe(
    WD.closeOtherPages,
    WP.chainFirst(WP.delay(1000)),
    WP.chain(() => WD.bringToFront),
    chainNOrElse<void, void>(
      1000,
      5
    )(() =>
      pipe(
        WD.$x(`//*//a[contains(.,'Skip')]`),
        WP.chain(
          EH.isOneElementArray(
            (els, r) => `Found "${els.length}" skip-button at ${r.page.url()}`
          )
        ),
        WP.chain((els) => EH.evaluateClick(els[0])),
        WP.chain(() => WP.of(undefined))
      )
    )
  ),
});
/**
 *
 * @param socialPlatform
 * @returns
 */
export const freeFollowerPlan = (socialPlatform: SocialPlatform) =>
  plan({
    init: initFreeFollower(socialPlatform),
    routine: routineFreeFollower,
    end: pipe(
      WP.of(undefined),
      chainNOrElse<undefined, void>(
        1000,
        60
      )(() =>
        pipe(
          WD.$x(`//button[text()='Validate']`),
          WP.chain(
            EH.isOneElementArray(
              (els, r) =>
                `Found "${els.length}" validate-button at ${r.page.url()}`
            )
          ),
          WP.chain((els) => EH.evaluateClick(els[0])),
          WP.chain(() => WP.of(undefined))
        )
      )
    ),
  });
