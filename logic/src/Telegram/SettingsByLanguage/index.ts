import { SettingsByLanguage } from '../../../src/SettingsByLanguage';
import { Settings } from './settings';

export { Settings } from "./settings";

export const settingsByLanguage: SettingsByLanguage<Settings> = {
  it: {
    urls: {
      base: new URL("https://web.telegram.org/"),
    },
    dialogLink: {
      returnXPath: (interlocutor: string) =>
        `//a[@class='im_dialog' and contains(., '${interlocutor}')]`,
    },
    message: {
      returnXPath: (interlocutor: string, mustContainText: string) =>
        `//div[@class='im_content_message_wrap im_message_in'` +
        ` and contains(., '${interlocutor}')` +
        ` and contains(.,'${mustContainText}')]`,
    },
    dialog: {
      elements: {
        textArea: {
          xpath: `//div[@class='composer_rich_textarea']`,
        },
      },
    },
    loginPage: {
      elements: {
        buttonToSwitchToAccessByNumber: {
          XPath: `//button[contains(.,'Log in by phone Number')]`,
        },
        inputForNumber: {
          XPath: `//input[@name='phone']`,
        },
        buttonToGoToOTP: {
          XPath: `//button[contains(.,'Next')]`,
        },
        inputForOTP: {
          XPath: `//div[contains(.,'We have sent')]/div/div/input[@type='tel']`,
        },
      },
    },
  },
};
