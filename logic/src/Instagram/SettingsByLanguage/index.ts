import { SettingsByLanguage } from '../../../src/SettingsByLanguage';
import { Settings } from './settings';

export { Settings } from "./settings";

export const settingsByLanguage: SettingsByLanguage<Settings> = {
  it: {
    urls: {
      base: new URL("https://www.instagram.com"),
    },
    buttonFollow: {
      expectedProps: {
        preFollow: [
          [["innerText", "Segui"]],
          [["innerText", "Segui anche tu"]],
        ],
        postFollow: [
          [["innerText", ""]],
          [["innerText", "Richiesta effettuata"]],
        ],
      },
    },
    buttonLike: {
      svg: {
        expectedProps: {
          preLike: [[["aria-label", "Mi piace"]]],
          postLike: [[["aria-label", "Non mi piace più"]]],
        },
        XPath: `./div/span/*[name()='svg']`,
        XPathPreLike: `./div/span/*[name()='svg' and @aria-label='Mi piace']`,
        XPathPostLike: `./div/span/*[name()='svg' and @aria-label='Non mi piace più']`,
      },
    },
    notAvailablePage: {
      XPath: `//*[contains(.,'Spiacenti, questa pagina non è disponibile')]`,
    },
    waitForTimePage: {
      XPath: `//*[contains(.,'Attendi qualche minuto prima di riprovare.')]`,
    },
    profilePage: {
      elements: {
        privateProfile: {
          XPath: `//*[contains(text(),'Questo account è privato')]`,
        },
        buttonFollow: {
          XPath: `//header//*/button[contains(text(),'Segui')]`,
        },
        buttonAlreadyFollow: {
          XPath: `//button[./div/span[@aria-label='Segui già']]`,
        },
        followedUsers: {
          XPath: `//a[@class='-nal3 ' and contains(.,' profili seguiti')]`,
          containerToScroll: {
            XPath: `//div[./ul/div/li/div/div/button[contains(.,'Segui')]]`,
          },
          buttonFollow: {
            XPath: `//ul/div/li/div/div/button[text()='Segui']`,
          },
          buttonAlreadyFollow: {
            XPath: `//ul/div/li/div/div/button[text()='Segui già']`,
          },
        },
      },
    },
    igPostPage: {
      elements: {
        buttonLike: {
          XPath: `//section/span/button[./div/span/*[name()='svg' and @aria-label='Mi piace']]`,
        },
        buttonUnlike: {
          XPath: `//section/span/button[./div/span/*[name()='svg' and @aria-label='Non mi piace più']]`,
        },
      },
    },
    pageOfStory: {
      elements: {
        barsOfStories: {
          XPath: `//div[@class='_7zQEa']`,
        },
        barsOfLoadingForStories: {
          XPath: `//div[@class='XcATa ' and @style='width: 100%;']`,
        },
        buttonForPermission: {
          XPath: `//section/div//button[contains(.,'Visualizza la storia')]`,
        },
        buttonToScrollStory: {
          expectedProps: [
            [{ xpath: `./div[@class='coreSpriteRightChevron']` }, "Found"],
          ],
          XPath: `//button[./div[@class='coreSpriteRightChevron']]`,
        },
      },
    },
    genericLoggedInPage: {
      elements: {
        buttonForNewPost: {
          XPath: '//div[./*[@aria-label="Nuovo post"]]',
        },
        buttonForNextOperation: {
          XPath: `//button[contains(text(),'Avanti')]`,
        },
        buttonToShareMedia: {
          XPath: `//button[contains(text(),'Condividi')]`,
        },
        textareaForDescription: {
          XPath: `//textarea[@aria-label='Scrivi una didascalia...']`,
        },
        inputToUploadMedia: {
          XPath: `//div[./div/div/div[@data-testid='mobile-nav-logged-in']/div[@data-testid='new-post-button']]/form/input`,
        },
      },
    },
    loginPage: {
      elements: {
        inputForId: {
          XPath: `//input[@name='username']`,
          // `//input[@aria-label="Numero di telefono, nome utente o e-mail"]`,
        },
        inputForPassword: {
          XPath: `//input[@name='password']`,
        },
        buttonToLogin: {
          XPath: `//button[./div[text()='Accedi']]`,
        },
      },
    },
  },
};
