import { pipe } from 'fp-ts/function';
import { Reader } from 'fp-ts/Reader';
import path from 'path';

import { click, expectedLength, type } from '../../src/ElementHandle';
import { getPropertiesFromSettingsAndLanguage, Languages } from '../../src/SettingsByLanguage';
import * as WD from '../../src/WebDeps';
import * as WP from '../../src/WebProgram';
import {
    Settings as SettingsTelegram, settingsByLanguage as settingsByLanguageTelegram
} from './SettingsByLanguage';

const PATH = path.resolve(__dirname, "./sendMessage.ts");
interface Settings {
  xpathOfTextAreaInDialog: string;
}
const settingsByLanguage = getPropertiesFromSettingsAndLanguage<
  Settings,
  SettingsTelegram
>((sets) => ({
  xpathOfTextAreaInDialog: sets.dialog.elements.textArea.xpath,
}))(settingsByLanguageTelegram);
/**
 * @name Input of Body
 * @category type-classes
 */
interface InputOfBody {
  settings: Settings;
  text: string;
}
/**
 * @category type-classes
 */
type BodyOfSendMessage = Reader<InputOfBody, WP.WebProgram<void>>;
/**
 * Body
 */

const bodyOfSendMessage: BodyOfSendMessage = (D) =>
  pipe(
    WD.waitFor$x(D.settings.xpathOfTextAreaInDialog),
    WP.chain(
      expectedLength((n) => n === 1)(
        (els, r) => `Found '${els.length}' textarea-input(s) at ${r.page.url()}`
      )
    ),
    WP.chain((els) => WP.of(els[0])),
    WP.chainFirst(click()),
    WP.chain(WP.delay(700)),
    WP.chain(type(D.text + String.fromCharCode(13), { delay: 150 })),
    WP.orElseStackErrorInfos({
      message: "",
      nameOfFunction: "bodyOfSendMessage",
      filePath: PATH,
    })
  );

/**
 *
 */
export const sendMessage = (language: Languages) => (text: string) =>
  bodyOfSendMessage({ settings: settingsByLanguage(language), text });
