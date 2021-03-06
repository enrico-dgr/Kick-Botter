import { pipe } from 'fp-ts/function';
import { click } from 'launch-page/lib/ElementHandle';
import { askData as askDataFromConsole } from 'launch-page/lib/readline';
import {
    getPropertiesFromSettingsAndLanguage, Languages
} from 'launch-page/lib/SettingsByLanguage';
import { goto, keyboard, setUserAgent, waitFor$x } from 'launch-page/lib/WebDeps';
import * as WP from 'launch-page/lib/WebProgram';

import {
    Settings as SettingsOfTelegram, settingsByLanguage as settingsByLanguageOfTelegram
} from './SettingsByLanguage';

// -----------------------------------
// Input of body
// -----------------------------------
/**
 *
 */
interface Settings {
  xpathOfButtonToSwitchToAccessByNumber: string;
  xpathOfInputForNumber: string;
  xpathOfInputForOTP: string;
  xpathOfButtonToGoToOTP: string;
  baseUrl: URL;
}
/**
 *
 */
enum EnumOfData {
  "NumberWithPrefix",
  "OTP",
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
  const inputForOTP = pipe(
    waitFor$x(I.settings.xpathOfInputForOTP),
    WP.chain((els) =>
      els.length === 1
        ? WP.right(els[0])
        : WP.leftAny(`Found '${els.length}' OTP-input(s).`)
    )
  );
  /**
   *
   */
  const inputForNumber = pipe(
    waitFor$x(I.settings.xpathOfInputForNumber),
    WP.chain((els) =>
      els.length === 1
        ? WP.right(els[0])
        : WP.leftAny(`Found '${els.length}' number-input(s).`)
    )
  );
  /**
   *
   */
  const buttonToGoToOTP = pipe(
    waitFor$x(I.settings.xpathOfButtonToGoToOTP),
    WP.chain((els) =>
      els.length === 1
        ? WP.right(els[0])
        : WP.leftAny(`Found '${els.length}' goToOTP-button(s).`)
    )
  );
  /**
   *
   */
  const buttonToSwitchToAccessByNumber = pipe(
    waitFor$x(I.settings.xpathOfButtonToSwitchToAccessByNumber),
    WP.chain((els) =>
      els.length < 2
        ? WP.right(els)
        : WP.leftAny(`Found '${els.length}' login-button(s).`)
    )
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
    WP.chain(() => goto(I.settings.baseUrl.href)),
    WP.chain(() =>
      pipe(
        buttonToSwitchToAccessByNumber,
        // could be already at number input
        WP.chain((els) =>
          els.length === 1 ? click()(els[0]) : WP.of(undefined)
        )
      )
    ),
    WP.chain(() =>
      pipe(
        inputForNumber,
        WP.chain(click({ clickCount: 3 })),
        WP.chain(() => I.askData("NumberWithPrefix")),
        WP.chain((numberWithPrefix) =>
          keyboard.type(numberWithPrefix, { delay: 150 })
        )
      )
    ),
    WP.chain(() =>
      pipe(buttonToGoToOTP, WP.chain(WP.delay(750)), WP.chain(click()))
    ),
    WP.chain(() =>
      pipe(
        inputForOTP,
        // to avoid to check for visibility
        WP.chain(WP.delay(2000)),
        WP.chain(click()),
        WP.chain(() => I.askData("OTP")),
        WP.chain((OTP) => keyboard.type(OTP, { delay: 150 }))
      )
    ),
    WP.map(() => undefined)
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
  SettingsOfTelegram
>((sets) => ({
  xpathOfButtonToSwitchToAccessByNumber:
    sets.loginPage.elements.buttonToSwitchToAccessByNumber.XPath,
  xpathOfInputForOTP: sets.loginPage.elements.inputForOTP.XPath,
  xpathOfInputForNumber: sets.loginPage.elements.inputForNumber.XPath,
  xpathOfButtonToGoToOTP: sets.loginPage.elements.buttonToGoToOTP.XPath,
  baseUrl: sets.urls.base,
}))(settingsByLanguageOfTelegram);
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
