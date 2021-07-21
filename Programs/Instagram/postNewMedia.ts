import * as A from 'fp-ts/Array';
import * as B from 'fp-ts/boolean';
import { pipe } from 'fp-ts/function';
import * as fs from 'fs';
import { click, uploadFile } from 'launch-page/lib/ElementHandle';
import {
    getPropertiesFromSettingsAndLanguage, Languages
} from 'launch-page/lib/SettingsByLanguage';
import { browser, emulate, keyboard, reload, waitFor$x } from 'launch-page/lib/WebDeps';
import * as WP from 'launch-page/lib/WebProgram';
import { devices } from 'puppeteer';

import {
    Settings as SettingsOfInstagram, settingsByLanguage as settingsByLanguageOfInstagram
} from './SettingsByLanguage';

// -----------------------------------
// Input of body
// -----------------------------------
/**
 *
 */
interface Settings {
  xpathOfButtonForNewPost: string;
  xpathOfInputToUploadMedia: string;
  xpathOfButtonForNextOperation: string;
  xpathOfTextareaForDescription: string;
  xpathOfButtonToShareMedia: string;
}
/**
 *
 */
interface InputOfBody {
  settings: Settings;
  imageSystemPath: string;
  description: string;
}
// -----------------------------------
// Body
// -----------------------------------
const bodyOfPostNewMedia = (I: InputOfBody): WP.WebProgram<void> => {
  /**
   *
   */
  const device = devices["iPhone 6"];
  /**
   *
   */
  const newPostButton = pipe(
    waitFor$x(I.settings.xpathOfButtonForNewPost),
    WP.chain((els) =>
      pipe(
        A.isEmpty(els),
        B.match(
          () =>
            pipe(
              emulate(device),
              WP.chain(() => reload()),
              WP.chain(() => waitFor$x(I.settings.xpathOfButtonForNewPost))
            ),
          () => WP.right(els)
        )
      )
    ),
    WP.chain((els) =>
      els.length === 1
        ? WP.right(els[0])
        : WP.leftAny(`Found '${els.length}' newPost-button(s).`)
    )
  );
  /**
   *
   */
  const validateMedia = () =>
    pipe(
      I.imageSystemPath,
      WP.fromPredicate(
        (path) =>
          path.toLowerCase().endsWith("jpg") ||
          path.toLowerCase().endsWith("jpeg") ||
          path.toLowerCase().endsWith("mp4"),
        (path) =>
          new Error(
            `Instagram only accepts jpeg/jpg images.\n` +
              `Path "${path}" is not valid.`
          )
      ),
      WP.chain(
        WP.fromPredicate(
          fs.existsSync,
          (path) =>
            new Error(
              `The image you specified does not exist.\n` +
                `Path "${path}" does not exist.`
            )
        )
      ),

      WP.map<fs.PathLike, void>(() => undefined)
    );
  /**
   * @todo validation of element
   */
  const inputForMedia = pipe(
    waitFor$x(I.settings.xpathOfInputToUploadMedia),
    WP.chain((els) =>
      els.length === 1
        ? WP.right(els[0])
        : WP.leftAny(`Found '${els.length}' media-input(s).`)
    )
  );
  /**
   *
   */
  const buttonForNextOperation = pipe(
    waitFor$x(I.settings.xpathOfButtonForNextOperation),
    WP.chain((els) =>
      els.length === 1
        ? WP.right(els[0])
        : WP.leftAny(`Found '${els.length}' nextOperation-button(s).`)
    )
  );
  /**
   *
   */
  const textareaForDescription = pipe(
    waitFor$x(I.settings.xpathOfTextareaForDescription),
    WP.chain((els) =>
      els.length === 1
        ? WP.right(els[0])
        : WP.leftAny(`Found '${els.length}' description-textarea(s).`)
    )
  );
  /**
   *
   */
  const buttonToShareMedia = pipe(
    waitFor$x(I.settings.xpathOfButtonToShareMedia),
    WP.chain((els) =>
      els.length === 1
        ? WP.right(els[0])
        : WP.leftAny(`Found '${els.length}' shareMedia-button(s).`)
    )
  );
  /**
   *
   */
  return pipe(
    newPostButton,
    WP.chain(click()),
    WP.chain(validateMedia),
    WP.chain(() =>
      pipe(inputForMedia, WP.chain(uploadFile(I.imageSystemPath)))
    ),
    WP.chain(() => pipe(buttonForNextOperation, WP.chain(click()))),
    WP.chain(() =>
      pipe(
        textareaForDescription,
        WP.chain(click()),
        WP.chain(() => keyboard.type(I.description, { delay: 150 }))
      )
    ),
    WP.chain(() => pipe(buttonToShareMedia, WP.chain(click()))),
    WP.chain(() =>
      pipe(
        browser,
        WP.chainTaskK((browser) => () => browser.userAgent()),
        WP.chain((userAgent) =>
          emulate({
            userAgent,
            viewport: {
              width: 800,
              height: 600,
            },
          })
        ),
        WP.chain(() => reload())
      )
    ),
    WP.map(() => undefined)
  );
};
// -----------------------------------
// Input
// -----------------------------------
interface Input {
  language: Languages;
  imageSystemPath: string;
  description: string;
}
/**
 *
 */
const settingsByLanguage = getPropertiesFromSettingsAndLanguage<
  Settings,
  SettingsOfInstagram
>((sets) => ({
  xpathOfButtonForNewPost:
    sets.genericLoggedInPage.elements.buttonForNewPost.XPath,
  xpathOfButtonForNextOperation:
    sets.genericLoggedInPage.elements.buttonForNextOperation.XPath,
  xpathOfButtonToShareMedia:
    sets.genericLoggedInPage.elements.buttonToShareMedia.XPath,
  xpathOfInputToUploadMedia:
    sets.genericLoggedInPage.elements.inputToUploadMedia.XPath,
  xpathOfTextareaForDescription:
    sets.genericLoggedInPage.elements.textareaForDescription.XPath,
}))(settingsByLanguageOfInstagram);
// -----------------------------------
// Program
// -----------------------------------
export const postNewMedia = (I: Input) =>
  bodyOfPostNewMedia({
    ...I,
    settings: settingsByLanguage(I.language),
  });
