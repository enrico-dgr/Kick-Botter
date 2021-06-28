import { pipe } from 'fp-ts/function';
import path from 'path';

import { click } from '../../src/ElementHandle';
import { askData as askDataFromConsole } from '../../src/readline';
import { getPropertiesFromSettingsAndLanguage, Languages } from '../../src/SettingsByLanguage';
import { keyboard, setUserAgent, waitFor$x } from '../../src/WebDeps';
import * as WP from '../../src/WebProgram';
import { goto } from './goto';
import {
    Settings as SettingsOfInstagram, settingsByLanguage as settingsByLanguageOfInstagram
} from './SettingsByLanguage';

const ABSOLUTE_PATH = path.resolve(__dirname, "./login.ts");

// -----------------------------------
// Input of body
// -----------------------------------
/**
 *
 */
interface Settings {
  xpathOfInputForPassword: string;
  xpathOfInputForId: string;
  xpathOfButtonToLogin: string;
  baseUrl: URL;
}
/**
 *
 */
enum EnumOfData {
  "Id",
  "Password",
}
type DataNames = keyof typeof EnumOfData;
/**
 *
 */
interface InputOfBody {
  settings: Settings;
  askData: (data: DataNames) => WP.WebProgram<string>;
  language: Languages;
}
// -----------------------------------
// Body
// -----------------------------------
const bodyOfLogin = (I: InputOfBody): WP.WebProgram<void> => {
  /**
   *
   */
  const inputForId = pipe(
    waitFor$x(I.settings.xpathOfInputForId),
    WP.chain((els) =>
      els.length === 1
        ? WP.right(els[0])
        : WP.leftAny(`Found '${els.length}' id-input(s).`)
    ),
    WP.orElseStackErrorInfos({
      message: `Not valid id-input.`,
      nameOfFunction: "inputForId",
      filePath: ABSOLUTE_PATH,
    })
  );
  /**
   *
   */
  const inputForPassword = pipe(
    waitFor$x(I.settings.xpathOfInputForPassword),
    WP.chain((els) =>
      els.length === 1
        ? WP.right(els[0])
        : WP.leftAny(`Found '${els.length}' password-input(s).`)
    ),
    WP.orElseStackErrorInfos({
      message: `Not valid password-input.`,
      nameOfFunction: "inputForPassword",
      filePath: ABSOLUTE_PATH,
    })
  );
  /**
   *
   */
  const buttonToLogin = pipe(
    waitFor$x(I.settings.xpathOfButtonToLogin),
    WP.chain((els) =>
      els.length === 1
        ? WP.right(els[0])
        : WP.leftAny(`Found '${els.length}' login-button(s).`)
    ),
    WP.orElseStackErrorInfos({
      message: `Not valid login-button.`,
      nameOfFunction: "buttonToLogin",
      filePath: ABSOLUTE_PATH,
    })
  );

  /**
   *
   */
  return pipe(
    setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36"
    ),
    WP.chain(() =>
      WP.asks((r) =>
        r.page.setViewport({
          width: 768,
          height: 1024,
          deviceScaleFactor: 2,
          isMobile: false,
          hasTouch: false,
          isLandscape: false,
        })
      )
    ),
    WP.chain(() => goto(I.language)(I.settings.baseUrl.href)),
    WP.chainFirst((a) =>
      a === "AvailablePage"
        ? WP.of(undefined)
        : WP.leftFromErrorInfos({
            message: a,
            nameOfFunction: "login > goto",
            filePath: ABSOLUTE_PATH,
          })
    ),
    WP.chain(() =>
      pipe(
        inputForId,
        WP.chain(click()),
        WP.chain(() => I.askData("Id")),
        WP.chain((Id) => keyboard.type(Id, { delay: 150 }))
      )
    ),
    WP.chain(() =>
      pipe(
        inputForPassword,
        WP.chain(click()),
        WP.chain(() => I.askData("Password")),
        WP.chain((password) => keyboard.type(password, { delay: 150 }))
      )
    ),
    WP.chain(() =>
      pipe(buttonToLogin, WP.chain(WP.delay(750)), WP.chain(click()))
    ),
    WP.chainFirst(WP.delay(1500)),
    WP.chainFirst(WP.delay(3000)),
    WP.map(() => undefined),
    WP.orElseStackErrorInfos({
      message: `Failed to login.`,
      nameOfFunction: "login",
      filePath: ABSOLUTE_PATH,
    })
  );
};
// -----------------------------------
// Input of Program
// -----------------------------------
interface InputWithSettingsImplemented {
  language: Languages;
  askData: (data: DataNames) => WP.WebProgram<string>;
}
/**
 *
 */
const settingsByLanguage = getPropertiesFromSettingsAndLanguage<
  Settings,
  SettingsOfInstagram
>((sets) => ({
  xpathOfInputForId: sets.loginPage.elements.inputForId.XPath,
  xpathOfInputForPassword: sets.loginPage.elements.inputForPassword.XPath,
  xpathOfButtonToLogin: sets.loginPage.elements.buttonToLogin.XPath,
  baseUrl: sets.urls.base,
}))(settingsByLanguageOfInstagram);
// -----------------------------------
// Program
// -----------------------------------
export const login = (I: InputWithSettingsImplemented) =>
  bodyOfLogin({
    ...I,
    settings: settingsByLanguage(I.language),
  });
// -----------------------------------
// Input of Program for console
// -----------------------------------
interface InputOfProgramForConsole {
  language: Languages;
}

// -----------------------------------
// Program for console
// -----------------------------------
export const loginFromConsole = (I: InputOfProgramForConsole) =>
  login({
    ...I,
    askData: askDataFromConsole,
  });
