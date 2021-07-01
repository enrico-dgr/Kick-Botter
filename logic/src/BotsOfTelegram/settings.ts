import { SettingsByBotChoice } from './settingsByBotChoice';
import { Settings } from './settingsType';

export { Settings } from "./settingsType";

export const settingsByBotChoice: SettingsByBotChoice<Settings> = {
  Socialgift: {
    chatUrl: new URL(`https://web.telegram.org/?legacy=1#/im?p=@socialgiftbot`),
    message: {
      elements: {
        link: {
          relativeXPath: `.//div[@class='im_message_text']//a[contains(@href,'http')]`,
        },
        buttonConfirm: {
          relativeXPath: `.//button[contains(text(),'CONFERMA')]`,
        },
        buttonSkip: {
          relativeXPath: `.//button[contains(text(),'SALTA')]`,
        },
      },
      expectedTextsForActions: {
        Follow: [["innerText", "Segui il Profilo"]],
        Like: [["innerText", "Like al Post"]],
        WatchStory: [["innerText", "Visualizza Stories"]],
        Comment: [["innerText", "Comment"]],
        Extra: [["innerText", "EXTRA"]],
      },
    },
    dialog: {
      elements: {
        buttonNewAction: {
          text: "🤑 GUADAGNA 🤑",
        },
      },
    },
  },
};
