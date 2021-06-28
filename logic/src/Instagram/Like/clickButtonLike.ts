import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/lib/function';
import { ElementHandle } from 'puppeteer';

import * as EH from '../../../src/ElementHandle';
import { getPropertiesFromSettingsAndLanguage, Languages } from '../../../src/SettingsByLanguage';
import * as WP from '../../../src/WebProgram';
import { Settings as SettingsInstagram, settingsByLanguage } from '../SettingsByLanguage';

/**
 * @category Input of Body
 * @subcategory Subtype
 */
type PropertiesOfButton = EH.HTMLElementProperties<HTMLButtonElement, string>;
/**
 * @category Input of Body
 * @subcategory Subtype
 */
type Settings = {
  propsPreLike: PropertiesOfButton[];
  propsPostLike: PropertiesOfButton[];
};
/**
 * @category Input of Body
 * @subcategory Parse to Subtype
 */
const languageSettings = getPropertiesFromSettingsAndLanguage<
  Settings,
  SettingsInstagram
>((sets) => ({
  propsPreLike: [[[{ xpath: sets.buttonLike.svg.XPathPreLike }, "Found"]]],
  propsPostLike: [[[{ xpath: sets.buttonLike.svg.XPathPostLike }, "Found"]]],
}))(settingsByLanguage);
/**
 * @category Input of Body
 * @subcategory Subtype
 */
export interface Options {}
/**
 * @category Input of Body
 */
interface InputOfBody {
  button: ElementHandle<HTMLButtonElement>;
  settings: Settings;
  options: Options;
}
/**
 * @category Output
 * @subcategory Subtype
 */
export interface tag {
  _tag: string;
}
/**
 * @category Output
 * @subcategory To Union
 */
export interface Liked extends tag {
  _tag: "Liked";
}
/**
 * @category Output
 * @subcategory Subtype
 */
interface AlreadyLiked extends tag {
  _tag: "AlreadyLiked";
}
/**
 * @category Output
 * @subcategory Subtype
 */
interface WrongProps {
  wrongProps: PropertiesOfButton;
}
/**
 * @category Output
 * @subcategory Subtype
 */
interface NotClicked extends tag, WrongProps {
  _tag: "NotClicked";
}
/**
 * @category Output
 * @subcategory Subtype
 */
interface InvalidButton extends tag, WrongProps {
  _tag: "InvalidButton";
}
/**
 * @category Output
 * @subcategory Subtype
 */
export type Reason = AlreadyLiked | InvalidButton | NotClicked;
/**
 * @category Output
 * @subcategory To Union
 */
export interface NotLiked<T extends tag = never> extends tag {
  _tag: "NotLiked";
  reason: Reason | T;
}
/**
 * @category Output
 */
export type Output = Liked | NotLiked;
/**
 * @category Output
 * @subcategory Util
 */
const returnLikedAsOutput: () => Liked = () => ({ _tag: "Liked" });
/**
 * @category Output
 * @subcategory Util
 */
const notLiked = (reason: Reason): NotLiked => ({
  _tag: "NotLiked",
  reason,
});
/**
 * @category Output
 * @subcategory Util
 */
const returnInvalidButtonAsOutput = (
  wrongProps: PropertiesOfButton
): NotLiked => notLiked({ _tag: "InvalidButton", wrongProps });
/**
 * @category Output
 * @subcategory Util
 */
const returnNotClickedAsOutput = (wrongProps: PropertiesOfButton): NotLiked =>
  notLiked({ _tag: "NotClicked", wrongProps });
/**
 * @category Output
 * @subcategory Util
 */
const returnAlreadyLikedAsOutput = () => notLiked({ _tag: "AlreadyLiked" });
/**
 * @category Body
 */
const getBodyOfClickButtonLike: (I: InputOfBody) => WP.WebProgram<Output> = (
  I
) => {
  /**
   * @category Body
   * @subcategory Abstraction
   */
  const like = () => pipe(EH.click()(I.button), WP.map(returnLikedAsOutput));
  /**
   * @category Body
   * @subcategory Abstraction
   */
  const checkPropertiesOfButton = (): WP.WebProgram<PropertiesOfButton> =>
    pipe(
      EH.matchOneSetOfHTMLProperties<HTMLButtonElement, string>(
        I.settings.propsPreLike
      )(I.button),
      WP.map(A.flatten)
    );
  /**
   * @category Body
   * @subcategory Abstraction
   * @subcategory Body
   */
  const recursivelyCheckPropertiesOfClickedButton = (
    n: number
  ): WP.WebProgram<PropertiesOfButton> =>
    pipe(
      EH.matchOneSetOfHTMLProperties<HTMLButtonElement, string>(
        I.settings.propsPostLike
      )(I.button),
      WP.map(A.flatten),
      WP.chain<PropertiesOfButton, PropertiesOfButton>((wrongProps) =>
        wrongProps.length > 0 && n > 0
          ? pipe(
              undefined,
              WP.delay(1000),
              WP.chain(() => recursivelyCheckPropertiesOfClickedButton(n - 1))
            )
          : WP.of(wrongProps)
      )
    );
  /**
   * @category Body
   * @subcategory Abstraction
   */
  const checkPropertiesOfClickedButton: () => WP.WebProgram<PropertiesOfButton> = () =>
    recursivelyCheckPropertiesOfClickedButton(5);
  /**
   * @category Body
   * @subcategory Core
   */
  return pipe(
    checkPropertiesOfButton(),
    WP.chain((wrongPropsBF) =>
      wrongPropsBF.length < 1
        ? like()
        : pipe(
            checkPropertiesOfClickedButton(),
            WP.map<PropertiesOfButton, Output>((wrongPropsCBF) =>
              wrongPropsCBF.length < 1
                ? returnAlreadyLikedAsOutput()
                : returnInvalidButtonAsOutput(wrongPropsBF)
            )
          )
    ),
    WP.chain((f) =>
      f._tag === "Liked"
        ? pipe(
            checkPropertiesOfClickedButton(),
            WP.map<PropertiesOfButton, Output>((wrongPropsCBF) =>
              wrongPropsCBF.length < 1
                ? f
                : returnNotClickedAsOutput(wrongPropsCBF)
            )
          )
        : WP.of(f)
    )
  );
};
/**
 * @category Input
 */
export interface Input {
  button: ElementHandle<HTMLButtonElement>;
  language: Languages;
  options: Options;
}
/**
 * @category Program
 */
export const clickButtonLike = (I: Input) =>
  getBodyOfClickButtonLike({
    button: I.button,
    settings: languageSettings(I.language),
    options: I.options,
  });
