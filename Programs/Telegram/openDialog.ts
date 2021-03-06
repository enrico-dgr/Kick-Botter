import { pipe } from 'fp-ts/function';
import { Reader } from 'fp-ts/Reader';
import { click } from 'launch-page/lib/ElementHandle';
import {
    getPropertiesFromSettingsAndLanguage, Languages
} from 'launch-page/lib/SettingsByLanguage';
import * as WD from 'launch-page/lib/WebDeps';
import * as WP from 'launch-page/lib/WebProgram';

import {
    Settings as SettingsTelegram, settingsByLanguage as settingsByLanguageTelegram
} from './SettingsByLanguage';

// --------------------------------
// Input
// --------------------------------
interface Settings {
  dialogXPath: (interlocutor: string) => string;
}
const settingsByLanguage = getPropertiesFromSettingsAndLanguage<
  Settings,
  SettingsTelegram
>((sets) => ({
  dialogXPath: sets.dialogLink.returnXPath,
}))(settingsByLanguageTelegram);
/**
 *
 */
interface InputOfBody {
  settings: Settings;
  interlocutor: string;
}

// --------------------------------
// Body
// --------------------------------
/**
 *
 */
type BodyOfOpenDialog = Reader<InputOfBody, WP.WebProgram<void>>;
/**
 *
 */
const bodyOfOpenDialog: BodyOfOpenDialog = (D) =>
  pipe(
    WD.waitFor$x(D.settings.dialogXPath(D.interlocutor)),
    WP.chain((els) =>
      els.length === 1
        ? click()(els[0])
        : WP.left(
            new Error(
              `Chat with ${D.interlocutor} has not been opened.\n` +
                `${els.length} links to dialog found.`
            )
          )
    )
  );
/**
 *
 */
export const openDialog = (language: Languages) => (interlocutor: string) =>
  bodyOfOpenDialog({ settings: settingsByLanguage(language), interlocutor });
