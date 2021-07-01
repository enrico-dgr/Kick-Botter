import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { ElementHandle as EH, SettingsByLanguage as SBL, WebProgram as WP } from 'launch-page';
import path from 'path';
import { ElementHandle } from 'puppeteer';

import { FollowUser, LikeToPost, WatchStoryAtUrl } from '../Instagram/index';
import { sendMessage } from '../Telegram';
import { OutcomeOfAction, SettingsFromBot } from './botsOfTelegram';

const ABSOLUTE_PATH = path.resolve(__filename);

// --------------------------
// Types
// --------------------------
export type CustomStringLiteralOfActions =
  | "Follow"
  | "Like"
  | "Comment"
  | "Story";
/**
 *
 */
type CustomStringLiteralOfPostAction = "Skip" | "Confirm" | "End";
/**
 *
 */
type InfosForAction = URL;
/**
 *
 */
type InfosFromAction = {};
/**
 *
 */
type OtherPropsInStateOfCycle = {
  /**
   * should be less than 5
   */
  consecutiveSkips: number;
  /**
   * should be less than 5
   */
  consecutiveNewActions: number;
};
// --------------------------
// Dom variables
// --------------------------
const chatWithBot = {
  chatUrl: new URL(`https://web.telegram.org/?legacy=1#/im?p=@socialgiftbot`),
  message: {
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
  dialog: {
    buttonNewAction: {
      text: "🤑 GUADAGNA 🤑",
    },
  },
};
// --------------------------
// Get Infos for Action
// --------------------------
const getActionHref = (xpathOfLinkRelativeToMessage: string) => (
  messageWithAction: ElementHandle<Element>
): WP.WebProgram<URL> =>
  pipe(
    EH.$x(xpathOfLinkRelativeToMessage)(messageWithAction),
    WP.chain((els) =>
      els.length === 1
        ? WP.of(els[0])
        : pipe(
            EH.getInnerText(messageWithAction),
            WP.chain((text) =>
              WP.left(
                new Error(
                  `Found ${els.length} HTMLAnchorElement(s) containing 'http'.` +
                    O.match<string, string>(
                      () => `No text found in message`,
                      (t) => `Text of message is: ${t}`
                    )(text)
                )
              )
            )
          )
    ),
    WP.chain(EH.getHref),
    WP.chain(
      O.match(
        () => WP.left(new Error("No link at bot message")),

        (href) => WP.of(new URL(href))
      )
    ),
    WP.orElseStackErrorInfos({
      message: `Error while trying to get link for action.`,
      nameOfFunction: getActionHref.name,
      filePath: ABSOLUTE_PATH,
    })
  );

// --------------------------
// Settings
// --------------------------
export const socialgift: (
  language: SBL.Languages
) => SettingsFromBot<
  CustomStringLiteralOfActions,
  CustomStringLiteralOfPostAction,
  InfosForAction,
  InfosFromAction,
  OtherPropsInStateOfCycle
> = (language) => ({
  chatUrl: new URL(`https://web.telegram.org/?legacy=1#/im?p=@socialgiftbot`),
  fromBot: {
    // --------------------------
    // Get Infos for Action
    // --------------------------
    getInfosForAction: getActionHref(chatWithBot.message.link.relativeXPath),
    // --------------------------
    // Implementations of Actions
    // --------------------------
    implementationsOfActions: {
      Follow: (url) =>
        pipe(
          FollowUser.followUser({
            language,
            profileUrl: url,
            options: { allowPrivate: false },
          }),
          WP.chain((outputOfFollowUser) =>
            outputOfFollowUser._tag === "NotFollowed"
              ? WP.of<
                  OutcomeOfAction<
                    CustomStringLiteralOfPostAction,
                    InfosFromAction
                  >
                >({
                  kindOfPostAction: "Skip",
                  infosFromAction: outputOfFollowUser,
                })
              : pipe(
                  FollowUser.followUser({
                    language,
                    profileUrl: url,
                    options: { allowPrivate: false },
                  }),
                  WP.map<
                    FollowUser.Output,
                    OutcomeOfAction<
                      CustomStringLiteralOfPostAction,
                      InfosFromAction
                    >
                  >((outputOfCheck) =>
                    outputOfCheck._tag === "NotFollowed"
                      ? {
                          kindOfPostAction: "Confirm",
                          infosFromAction: outputOfFollowUser,
                        }
                      : {
                          kindOfPostAction: "End",
                          infosFromAction: outputOfCheck,
                        }
                  )
                )
          ),
          WP.orElseStackErrorInfos<
            OutcomeOfAction<CustomStringLiteralOfPostAction, InfosFromAction>
          >({
            message: "",
            nameOfFunction: "Follow",
            filePath: ABSOLUTE_PATH,
          })
        ),
      /**
       *
       */
      Like: (url) =>
        pipe(
          LikeToPost.likeToPost({
            language,
            urlOfPost: url,
            options: {},
          }),
          WP.chain((outputOfLike) =>
            outputOfLike._tag === "NotLiked"
              ? WP.of<
                  OutcomeOfAction<
                    CustomStringLiteralOfPostAction,
                    InfosFromAction
                  >
                >({
                  kindOfPostAction: "Skip",
                  infosFromAction: outputOfLike,
                })
              : pipe(
                  LikeToPost.likeToPost({
                    language,
                    urlOfPost: url,
                    options: {},
                  }),
                  WP.map<
                    LikeToPost.Output,
                    OutcomeOfAction<
                      CustomStringLiteralOfPostAction,
                      InfosFromAction
                    >
                  >((outputOfCheck) =>
                    outputOfCheck._tag === "NotLiked"
                      ? {
                          kindOfPostAction: "Confirm",
                          infosFromAction: outputOfLike,
                        }
                      : {
                          kindOfPostAction: "End",
                          infosFromAction: outputOfCheck,
                        }
                  )
                )
          ),
          WP.orElseStackErrorInfos({
            message: "",
            nameOfFunction: "Like",
            filePath: ABSOLUTE_PATH,
          })
        ),
      /**
       *
       */
      Story: (url) =>
        pipe(
          WatchStoryAtUrl.watchStoryAtUrl({
            language,
            storyUrl: url,
            options: {},
          }),
          WP.map<
            WatchStoryAtUrl.Output,
            OutcomeOfAction<CustomStringLiteralOfPostAction, InfosFromAction>
          >((outputOfStory) =>
            outputOfStory._tag === "AllWatched"
              ? {
                  kindOfPostAction: "Confirm",
                  infosFromAction: outputOfStory,
                }
              : {
                  kindOfPostAction: "Skip",
                  infosFromAction: outputOfStory,
                }
          ),
          WP.orElseStackErrorInfos({
            message: "",
            nameOfFunction: "WatchStory",
            filePath: ABSOLUTE_PATH,
          })
        ),
      /**
       *
       */
      Comment: () =>
        WP.of({
          kindOfPostAction: "Skip",
          infosFromAction: {},
        }),
    },
    // --------------------------
    // Post Action
    // --------------------------
    postAction: {
      Confirm: (mess) =>
        pipe(
          EH.$x(chatWithBot.message.buttonConfirm.relativeXPath)(mess),
          WP.chain((els) =>
            els.length === 1
              ? WP.of(els[0])
              : WP.left(
                  new Error(
                    `Found ${els.length} HTMLButtonElement(s) containing confirm-button.`
                  )
                )
          ),
          WP.chain(EH.click()),
          WP.orElseStackErrorInfos({
            message: `Error while trying to confirm action as done.`,
            nameOfFunction: "Confirm",
            filePath: ABSOLUTE_PATH,
          })
        ),
      /**
       *
       */
      Skip: (mess: ElementHandle<Element>) =>
        pipe(
          EH.$x(chatWithBot.message.buttonSkip.relativeXPath)(mess),
          WP.chain((els) =>
            els.length === 1
              ? WP.of(els[0])
              : WP.left(
                  new Error(
                    `Found ${els.length} HTMLButtonElement(s) containing skip-button.`
                  )
                )
          ),
          WP.chain(EH.click()),
          WP.orElseStackErrorInfos({
            message: `Error while trying to skip action.`,
            nameOfFunction: "Skip",
            filePath: ABSOLUTE_PATH,
          })
        ),
      /**
       *
       */
      End: () =>
        pipe(
          WP.of(undefined),
          WP.orElseStackErrorInfos({
            message: `Error while trying to end cycle of bot.`,
            nameOfFunction: "End",
            filePath: ABSOLUTE_PATH,
          })
        ),
      /**
       *
       */
      Default: () =>
        sendMessage(language)(chatWithBot.dialog.buttonNewAction.text),
    },
    message: {
      expectedContainedTextOfMessagesWithAction: {
        Follow: [["innerText", "Segui il Profilo"]],
        Like: [["innerText", "Like al Post"]],
        Story: [["innerText", "Visualizza Stories"]],
        Comment: [["innerText", "Comment"]],
      },
    },
    cycle: {
      defaultState: {
        kindOfPostAction: "Confirm",
        consecutiveSkips: 0,
        consecutiveNewActions: 0,
      },
      updateState: (stateOfCycle) => {
        switch (stateOfCycle.kindOfPostAction) {
          case "Confirm":
            return {
              ...stateOfCycle,
              consecutiveSkips: 0,
              consecutiveNewActions: 0,
            };
          case "Skip":
            return {
              ...stateOfCycle,
              consecutiveSkips: stateOfCycle.consecutiveSkips + 1,
            };
          case "Default":
            return {
              ...stateOfCycle,
              consecutiveNewActions: stateOfCycle.consecutiveNewActions + 1,
            };
          case "End":
            return { ...stateOfCycle };
        }
      },
      continueCycle: (stateOfCycle) =>
        stateOfCycle.kindOfPostAction === "End"
          ? false
          : stateOfCycle.consecutiveNewActions < 5 &&
            stateOfCycle.consecutiveSkips < 5,
    },
  },
});
