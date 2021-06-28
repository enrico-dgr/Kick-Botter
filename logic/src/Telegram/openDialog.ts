import { pipe } from 'fp-ts/function';
import { Reader } from 'fp-ts/Reader';
import path from 'path';

import { click } from '../../src/ElementHandle';
import { getPropertiesFromSettingsAndLanguage, Languages } from '../../src/SettingsByLanguage';
import * as WD from '../../src/WebDeps';
import * as WP from '../../src/WebProgram';
import {
    Settings as SettingsTelegram, settingsByLanguage as settingsByLanguageTelegram
} from './SettingsByLanguage';

const ABSOLUTE_PATH = path.resolve(__dirname, "./index.ts");
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
        : WP.leftFromErrorInfos({
            message:
              `Chat with ${D.interlocutor} has not been opened.\n` +
              `${els.length} links to dialog found.`,
            nameOfFunction: "bodyOfActuator",
            filePath: ABSOLUTE_PATH,
          })
    )
  );
/**
 *
 */
export const openDialog = (language: Languages) => (interlocutor: string) =>
  bodyOfOpenDialog({ settings: settingsByLanguage(language), interlocutor });
