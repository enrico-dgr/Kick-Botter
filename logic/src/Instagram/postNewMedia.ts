import * as A from 'fp-ts/Array';
import * as B from 'fp-ts/boolean';
import { pipe } from 'fp-ts/function';
import * as fs from 'fs';
import path from 'path';
import { devices } from 'puppeteer';

import { click, uploadFile } from '../../src/ElementHandle';
import { getPropertiesFromSettingsAndLanguage, Languages } from '../../src/SettingsByLanguage';
import { browser, emulate, keyboard, reload, waitFor$x } from '../../src/WebDeps';
import * as WP from '../../src/WebProgram';
import {
    Settings as SettingsOfInstagram, settingsByLanguage as settingsByLanguageOfInstagram
} from './SettingsByLanguage';

const ABSOLUTE_PATH = path.resolve(__dirname, "./postNewMedia.ts");

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
    ),
    WP.orElseStackErrorInfos({
      message: `Not valid newPost-button.`,
      nameOfFunction: "newPostButton",
      filePath: ABSOLUTE_PATH,
    })
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
      WP.orElseStackErrorInfos({
        message: "Not valid media to post.",
        nameOfFunction: "validateMedia",
        filePath: ABSOLUTE_PATH,
      }),
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
    ),
    WP.orElseStackErrorInfos({
      message: `Not valid media-input.`,
      nameOfFunction: "inputForMedia",
      filePath: ABSOLUTE_PATH,
    })
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
    ),
    WP.orElseStackErrorInfos({
      message: `Not valid nextOperation-button.`,
      nameOfFunction: "buttonForNextOperation",
      filePath: ABSOLUTE_PATH,
    })
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
    ),
    WP.orElseStackErrorInfos({
      message: `Not valid description-textarea.`,
      nameOfFunction: "textareaForDescription",
      filePath: ABSOLUTE_PATH,
    })
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
    ),
    WP.orElseStackErrorInfos({
      message: `Not valid shareMedia-button.`,
      nameOfFunction: "buttonToShareMedia",
      filePath: ABSOLUTE_PATH,
    })
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
    WP.map(() => undefined),
    WP.orElseStackErrorInfos({
      message: `Failed to post media.`,
      nameOfFunction: "postNewMedia",
      filePath: ABSOLUTE_PATH,
    })
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
