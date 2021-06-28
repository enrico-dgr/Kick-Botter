import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/lib/function';
import path from 'path';

import { expectedLength } from '../../../src/ElementHandle';
import { getPropertiesFromSettingsAndLanguage, Languages } from '../../../src/SettingsByLanguage';
import * as WebDeps from '../../../src/WebDeps';
import * as WP from '../../../src/WebProgram';
import { goto, StateOfInstagramPage } from '../goto';
import { Settings as SettingsInstagram, settingsByLanguage } from '../SettingsByLanguage';
import {
    clickButtonFollow, Followed as FollowedOfClickButtonFollow,
    NotFollowed as NotFollowedOfClickButtonFollow, Options as OptionsOfClickButtonFollow,
    Output as OutputOfClickButtonFollow, Reason as ReasonOfClickButtonFollow, tag
} from './clickButtonFollow';

const PATH = path.resolve(__filename);
/**
 * @category Input of Body
 * @subcategory Subtype
 */
interface Options extends OptionsOfClickButtonFollow {
  /**
   * on *true* allows private profiles to be followed
   */
  allowPrivate: boolean;
}
/**
 * @category Input of Body
 * @subcategory Subtype
 */
interface Settings {
  privateProfileXPath: string;
  buttonFollowXPath: string;
  buttonAlreadyFollowXPath: string;
}
/**
 * @category Input of Body
 * @subcategory Parse to Subtype
 */
const languageSettings = getPropertiesFromSettingsAndLanguage<
  Settings,
  SettingsInstagram
>((sets) => ({
  privateProfileXPath: sets.profilePage.elements.privateProfile.XPath,
  buttonFollowXPath: sets.profilePage.elements.buttonFollow.XPath,
  buttonAlreadyFollowXPath: sets.profilePage.elements.buttonAlreadyFollow.XPath,
}))(settingsByLanguage);
/**
 * @category Input of Body
 */
export interface InputOfBody {
  profileUrl: URL;
  settings: Settings;
  language: Languages;
  options: Options;
}
/**
 * @category Output
 * @subcategory Subtype
 */
interface IsPrivate {
  isPrivate: boolean;
}
/**
 * @category Output
 * @subcategory To Union
 */
interface Followed extends FollowedOfClickButtonFollow, IsPrivate {}
/**
 * @category Output
 * @subcategory Subtype
 */
interface PageState extends tag {
  _tag: StateOfInstagramPage;
}
/**
 * @category Output
 * @subcategory Subtype
 */
interface CannotFollowPrivate extends tag {
  _tag: "CannotFollowPrivate";
}
/**
 * @category Output
 * @subcategory Subtype
 */
export type Reason =
  | ReasonOfClickButtonFollow
  | CannotFollowPrivate
  | PageState;
/**
 * @category Output
 * @subcategory To Union
 */
interface NotFollowed
  extends NotFollowedOfClickButtonFollow<Reason>,
    IsPrivate {}
/**
 * @category Output
 */
export type Output = Followed | NotFollowed;
/**
 * @category Output
 * @subcategory Util
 */
const notFollowed = (reason: Reason, isPrivate: boolean): NotFollowed => ({
  _tag: "NotFollowed",
  reason,
  isPrivate,
});
/**
 * @category Output
 * @subcategory Util
 */
const returnCannotFollowPrivateAsOutput = (isPrivate: boolean) =>
  notFollowed(
    {
      _tag: "CannotFollowPrivate",
    },
    isPrivate
  );
/**
 * @category Output
 * @subcategory Util
 */
const returnNotAvailablePageAsOutput = (state: StateOfInstagramPage) =>
  notFollowed(
    {
      _tag: state,
    },
    false
  );

/**
 * @category Body
 */
const bodyOfFollowUser = (I: InputOfBody): WP.WebProgram<Output> => {
  /**
   * @category Body
   * @subcategory Abstraction
   */
  const isOnPage = pipe(WP.asks((r) => r.page.url() === I.profileUrl.href));
  /**
   * @category Body
   * @subcategory Abstraction
   * @subcategory Body
   */
  const recursivelyCheckIfItIsAPrivateProfile = (
    n: number
  ): WP.WebProgram<boolean> =>
    pipe(
      WebDeps.$x(I.settings.privateProfileXPath),
      WP.map(A.isNonEmpty),
      WP.chain(WP.delay(500)),
      WP.chain((b) =>
        b
          ? WP.of(b)
          : n > 0
          ? recursivelyCheckIfItIsAPrivateProfile(n - 1)
          : WP.of(b)
      )
    );
  /**
   * @description check 3 times each 0.5 seconds if profile is private
   * @category Body
   * @subcategory Abstraction
   */
  const isAPrivateProfile = () => recursivelyCheckIfItIsAPrivateProfile(3);
  /**
   * @description search follow-button in profile page
   * @category Body
   * @subcategory Abstraction
   */
  const button = (XPath: string) =>
    pipe(
      WebDeps.$x(XPath),
      WP.chain(
        expectedLength((n) => n === 1)((els, r) => ({
          buttonFollowXPath: XPath,
          lenght: els.length,
          url: r.page.url(),
        }))
      ),
      WP.map((els) => els[0]),
      WP.orElseStackErrorInfos({
        message: `Can't find button-follow in profile page.`,
        nameOfFunction: button.name,
        filePath: PATH,
      })
    );
  const buttonFollow = () => button(I.settings.buttonFollowXPath);
  const buttonAlreadyFollow = () => button(I.settings.buttonAlreadyFollowXPath);
  /**
   * @description main part of the program.
   * It finds and clicks the button
   * through the `ClickFollowButton` function.
   * @category Body
   * @subcategory Abstraction
   */
  const follow = pipe(
    buttonFollow(),
    WP.orElse(buttonAlreadyFollow),
    WP.chain((button) =>
      clickButtonFollow({
        language: I.language,
        options: { ...I.options },
        button,
      })
    )
  );
  /**
   * @description Parses the output of `ClickFollowButton` into
   * the output of this program.
   * @category Body
   * @subcategory Abstraction
   */
  const parseOutput = (isPrivate: boolean) => (
    o: OutputOfClickButtonFollow
  ): Output => ({ ...o, isPrivate });
  /**
   * @description based on `allowPrivate` option, decides if trying
   * on follow the profile or not.
   * @category Body
   * @subcategory Abstraction
   */
  const tryToFollowCheckingForPrivateProfile = () =>
    pipe(
      undefined,
      WP.delay(1000),
      WP.chain(isAPrivateProfile),
      WP.chain((isPrivate) =>
        isPrivate === true && I.options.allowPrivate === false
          ? WP.of<Output>(returnCannotFollowPrivateAsOutput(isPrivate))
          : pipe(follow, WP.map(parseOutput(isPrivate)))
      )
    );
  /**
   * @category Body
   * @subcategory Core
   */
  return pipe(
    isOnPage,
    WP.chain((isOnPageForReal) =>
      isOnPageForReal
        ? WP.of<StateOfInstagramPage>("AvailablePage")
        : goto(I.language)(I.profileUrl.href)
    ),
    WP.chain<StateOfInstagramPage, Output>((res) =>
      res !== "AvailablePage"
        ? WP.of<Output>(returnNotAvailablePageAsOutput(res))
        : tryToFollowCheckingForPrivateProfile()
    )
  );
};

/**
 * @category Input
 */
export interface Input {
  profileUrl: URL;
  language: Languages;
  options: Options;
}
/**
 * @category Program
 */
export const followUser = (I: Input) =>
  bodyOfFollowUser({
    ...I,
    settings: languageSettings(I.language),
  });
