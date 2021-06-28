import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/lib/function';
import path from 'path';
import { ElementHandle } from 'puppeteer';

import * as EH from '../../../src/ElementHandle';
import { getPropertiesFromSettingsAndLanguage, Languages } from '../../../src/SettingsByLanguage';
import * as WebDeps from '../../../src/WebDeps';
import * as WP from '../../../src/WebProgram';
import { goto } from '../goto';
import {
    Settings as SettingsOfInstagram, settingsByLanguage as settingsByLanguageOfInstagram
} from '../SettingsByLanguage';
import { clickButtonFollow } from './clickButtonFollow';

const ABSOLUTE_PATH = path.resolve(__dirname, "./followAllFollowedByUser.ts");

// -------------------------------
// Input of body
// -------------------------------
interface Settings {
  xpathOfLinkToListOfFollowed: string;
  xpathOfButtonFollowForFollowed: string;
  xpathOfButtonUnfollowForFollowed: string;
  xpathOfScrollableElement: string;
}
/**
 *
 */
interface InputOfBody {
  settings: Settings;
  profileUrl: URL;
  language: Languages;
}
/**
 *
 */
const bodyOfProgram = (I: InputOfBody): WP.WebProgram<void> => {
  // -------------------------------
  // Show list of followed users
  // -------------------------------
  const showListOfFollowed = pipe(
    I.settings.xpathOfLinkToListOfFollowed,
    WebDeps.waitFor$x,
    WP.chain(
      EH.expectedLength((n) => n === 1)(() => ({
        message: `No followed-list found for: ${I.settings.xpathOfLinkToListOfFollowed}`,
      }))
    ),
    WP.chain((els) => EH.click()(els[0])),
    WP.orElseStackErrorInfos({
      message: `Problem at page ${I.profileUrl.href}`,
      nameOfFunction: "showListOfFollowed",
      filePath: ABSOLUTE_PATH,
    })
  );
  /**
   *
   */
  const getFollowButtons = pipe(
    I.settings.xpathOfButtonFollowForFollowed,
    WebDeps.waitFor$x
  );
  /**
   *
   */
  const getUnfollowButtons = pipe(
    I.settings.xpathOfButtonUnfollowForFollowed,
    WebDeps.waitFor$x
  );
  /**
   *
   */
  const scroller: WP.WebProgram<ElementHandle<Element>> = pipe(
    I.settings.xpathOfScrollableElement,
    WebDeps.waitFor$x,
    WP.chain(
      EH.expectedLength((n) => n === 1)(() => ({
        message: `No element to scroll in followed-list found for: ${I.settings.xpathOfScrollableElement}`,
      }))
    ),
    WP.map((els) => els[0]),
    WP.orElseStackErrorInfos({
      message: `Problem at page ${I.profileUrl.href}`,
      nameOfFunction: "scroller",
      filePath: ABSOLUTE_PATH,
    })
  );
  /**
   *
   */
  const scroll: () => WP.WebProgram<void> = () =>
    pipe(
      scroller,
      WP.chainTaskK((scrollers) => () =>
        scrollers.evaluate((scroller: HTMLDivElement) =>
          scroller.scroll(0, scroller.scrollHeight)
        )
      )
    );

  /**
   *
   */
  const followCurrents = (els: ElementHandle<Element>[]): WP.WebProgram<void> =>
    A.isEmpty(els)
      ? WP.of(undefined)
      : pipe(
          clickButtonFollow({
            button: els[0],
            language: "it",
            options: {},
          }),
          WP.chainFirst((output) =>
            output._tag === "Followed"
              ? WP.of(undefined)
              : WP.leftFromErrorInfos({
                  message: JSON.stringify(output),
                  nameOfFunction: "followCurrents",
                  filePath: ABSOLUTE_PATH,
                })
          ),
          WP.chain(WP.delay(4000)),
          WP.chain(() => followCurrents(els.slice(1)))
        );
  // -------------------------------
  // Follow all followed users
  // -------------------------------
  const followAll = (attempts: number): WP.WebProgram<void> =>
    attempts > 1
      ? pipe(
          getFollowButtons,
          WP.chain((els) =>
            A.isEmpty(els)
              ? followAll(attempts - 1)
              : pipe(
                  followCurrents(els),
                  WP.chain(scroll),
                  WP.chain(() => followAll(attempts))
                )
          )
        )
      : pipe(
          getUnfollowButtons,
          WP.chain((els) =>
            A.isNonEmpty(els)
              ? WP.of(undefined)
              : WP.left(
                  new Error(
                    "Follow attempts finished, but no 'Already followed' button matched."
                  )
                )
          )
        );
  return pipe(
    goto(I.language)(I.profileUrl.href),
    WP.chain(() => showListOfFollowed),
    WP.chain(() => followAll(3))
  );
};
// -------------------------------
// Program
// -------------------------------
interface Input {
  language: Languages;
  profileUrl: URL;
}
/**
 *
 */
const settingsByLanguage = getPropertiesFromSettingsAndLanguage<
  Settings,
  SettingsOfInstagram
>((sets) => ({
  xpathOfButtonFollowForFollowed:
    sets.profilePage.elements.followedUsers.buttonFollow.XPath,
  xpathOfButtonUnfollowForFollowed:
    sets.profilePage.elements.followedUsers.buttonAlreadyFollow.XPath,
  xpathOfLinkToListOfFollowed: sets.profilePage.elements.followedUsers.XPath,
  xpathOfScrollableElement:
    sets.profilePage.elements.followedUsers.containerToScroll.XPath,
}))(settingsByLanguageOfInstagram);

/**
 *
 */
export const followAllFollowedByUser = (I: Input) =>
  bodyOfProgram({
    ...I,
    settings: settingsByLanguage(I.language),
  });
