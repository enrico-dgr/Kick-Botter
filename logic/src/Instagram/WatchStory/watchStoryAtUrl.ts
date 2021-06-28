import { pipe } from 'fp-ts/lib/function';

import { click, expectedLength } from '../../../src/ElementHandle';
import { getPropertiesFromSettingsAndLanguage, Languages } from '../../../src/SettingsByLanguage';
import * as WD from '../../../src/WebDeps';
import * as WP from '../../../src/WebProgram';
import { goto, StateOfInstagramPage } from '../goto';
import { Settings as SettingsOfInstagram, settingsByLanguage } from '../SettingsByLanguage';
import { Options, Output as OutputOfScrollStories, scrollStories, tag } from './scrollStories';

interface Settings {
  xpathOfButtonPermission: string;
  xpathOfButtonNext: string;
}
/**
 * @category Input of Body
 */
interface InputOfBody {
  storyUrl: URL;
  settings: Settings;
  options: Options;
  language: Languages;
}
/**
 * @category type-classes
 * @subcategory Output
 */
interface PageState extends tag {
  _tag: StateOfInstagramPage;
}
/**
 * @category Output
 */
type Output = PageState | OutputOfScrollStories;
/**
 * @category Body
 */
const bodyOfWatchStoryAtUrl = (I: InputOfBody) => {
  /**
   * @description
   * Tries to click on permission-button.
   * Recur+$x is used instead of waitFor$x,
   * but maybe is to change. @todo <--
   * @returns
   * - *true* on verified clicked
   * - *false* otherwise
   * @category Abstraction
   */
  const showStories = (
    delay: number,
    attempts: number
  ): WP.WebProgram<boolean> =>
    attempts > 0
      ? pipe(
          WD.$x(I.settings.xpathOfButtonPermission),
          WP.chain(
            expectedLength((n) => n === 1)(
              (els) => `${els.length} permission-button to story`
            )
          ),
          WP.map((els) => els[0]),
          WP.chain(click()),
          WP.map(() => true),
          WP.orElse(() =>
            pipe(
              undefined,
              WP.delay(delay),
              WP.chain(() => showStories(delay, attempts - 1))
            )
          )
        )
      : WP.of(false);
  /**
   * @description
   * Verify if permission-button disappeared.
   * @category Abstraction
   */
  const checkIfButtonPermissionIsGone = () =>
    pipe(
      WD.$x(I.settings.xpathOfButtonPermission),
      WP.chain(
        expectedLength((n) => n === 0)(
          (els) => `${els.length} permission-button to story`
        )
      ),
      WP.map(() => true),
      WP.orElse(() => WP.of<boolean>(false))
    );
  /**
   * @returns the button to scroll stories
   * from left to right.
   * @category Abstraction
   */
  const returnButtonNext = () =>
    pipe(
      WD.$x(I.settings.xpathOfButtonNext),
      WP.chain(
        expectedLength((n) => n === 1)(
          (els) => `${els.length} scrollRight-button in story`
        )
      ),
      WP.map((btns) => btns[0])
    );
  /**
   * @category Core
   */
  return pipe(
    goto(I.language)(I.storyUrl.href),
    WP.chain((pageState) =>
      pageState !== "AvailablePage"
        ? WP.of<Output>({ _tag: pageState })
        : pipe(
            showStories(500, 10),
            WP.chain((permissionIsGiven) =>
              permissionIsGiven ? checkIfButtonPermissionIsGone() : WP.of(false)
            ),
            WP.chain((storiesAreShown) =>
              storiesAreShown === false
                ? WP.of<Output>({ _tag: "NoAvailableStories" })
                : pipe(
                    returnButtonNext(),
                    WP.chain((buttonNext) =>
                      scrollStories({
                        language: I.language,
                        options: I.options,
                        buttonNext,
                      })
                    )
                  )
            )
          )
    )
  );
};
/**
 * @category type-classes
 */
interface Input {
  storyUrl: URL;
  language: Languages;
  options: Options;
}
/**
 * @category constructors
 */
const getSettings: (
  lang: Languages
) => Settings = getPropertiesFromSettingsAndLanguage<
  Settings,
  SettingsOfInstagram
>((sets) => ({
  xpathOfButtonNext: sets.pageOfStory.elements.buttonToScrollStory.XPath,
  xpathOfButtonPermission: sets.pageOfStory.elements.buttonForPermission.XPath,
}))(settingsByLanguage);
/**
 * @description Given a Url of a story-collection,
 * watch a given number (or all, if not specified)
 * of stories in that collection.
 * It assumes that, loading a new page of story,
 * instagram will ask for permission of profile and
 * will not switch to a new story-collection at
 * the end of the current one.
 * @category program
 */
export const watchStoryAtUrl = (I: Input): WP.WebProgram<Output> =>
  bodyOfWatchStoryAtUrl({
    ...I,
    settings: getSettings(I.language),
  });
