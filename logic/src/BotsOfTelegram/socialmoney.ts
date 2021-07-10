import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import {
    ElementHandle as EH, SettingsByLanguage as SBL, WebDeps as WD, WebProgram as WP
} from 'launch-page';
import { ElementHandle } from 'puppeteer';

import { FollowUser, LikeToPost, WatchStoryAtUrl } from '../Instagram/index';
import { sendMessage } from '../Telegram';
import { OutcomeOfAction, SettingsFromBot } from './botsOfTelegram';

// --------------------------
// Types
// --------------------------
export type CustomStringLiteralOfActions =
  | "Follow"
  | "Like"
  | "Comment"
  | "SpecificComment"
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
export type OtherPropsInStateOfCycle = {
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
  chatUrl: new URL(`https://web.telegram.org/?legacy=1#/im?p=@Socialmoneyybot`),
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
const parseSafeHref = (safeHref: string): string =>
  decodeURIComponent(safeHref.replace(`tg://unsafe_url?url=`, ""));
/**
 *
 */
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

        (href) => WP.of(new URL(parseSafeHref(href)))
      )
    )
  );
// --------------------------
// Post Action
// --------------------------
// --------------------------
// Settings
// --------------------------
export const socialmoney: (
  language: SBL.Languages
) => SettingsFromBot<
  CustomStringLiteralOfActions,
  CustomStringLiteralOfPostAction,
  InfosForAction,
  InfosFromAction,
  OtherPropsInStateOfCycle
> = (language) => ({
  chatUrl: chatWithBot.chatUrl,
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
          )
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
                    outputOfCheck._tag === "Liked"
                      ? {
                          kindOfPostAction: "End",
                          infosFromAction: outputOfCheck,
                        }
                      : {
                          kindOfPostAction: "Confirm",
                          infosFromAction: outputOfLike,
                        }
                  )
                )
          )
        ),
      /**
       *
       */
      Story: (urlOfAuth) =>
        pipe(
          WD.goto(urlOfAuth.href),
          WP.chain(() => WD.waitFor$x(`//a`)),
          WP.map((els) => els[0]),
          WP.chain((a) =>
            pipe(
              EH.getHref(a),
              WP.chainFirst(() => EH.click()(a))
            )
          ),
          WP.chain(
            O.match(
              () =>
                WP.left(
                  new Error(`Can't get href in socialmoney pre-story page.`)
                ),
              (href) =>
                pipe(
                  WatchStoryAtUrl.watchStoryAtUrl({
                    language,
                    storyUrl: new URL(href),
                    options: {},
                  }),

                  WP.map<
                    WatchStoryAtUrl.Output,
                    OutcomeOfAction<
                      CustomStringLiteralOfPostAction,
                      InfosFromAction
                    >
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
                  )
                )
            )
          )
        ),
      Comment: () =>
        WP.of({
          kindOfPostAction: "Skip",
          infosFromAction: {},
        }),
      SpecificComment: () =>
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
          WP.chain(EH.click())
        ),
      Skip: (mess) =>
        pipe(
          EH.$x(chatWithBot.message.buttonSkip.relativeXPath)(mess),
          WP.chain((els) =>
            els.length === 1
              ? pipe(WP.of(els[0]), WP.chain(EH.click()))
              : pipe(
                  EH.getInnerText(mess),
                  WP.chain((text) =>
                    WP.left(
                      new Error(
                        `${els.length} skip-button found.\n` +
                          `Text of message: ${O.match<string, string>(
                            () => `No text found`,
                            (t) => t
                          )(text)}`
                      )
                    )
                  )
                )
          )
        ),
      End: () => pipe(WP.of(undefined)),
      Default: () =>
        sendMessage(language)(chatWithBot.dialog.buttonNewAction.text),
    },
    message: {
      expectedContainedTextOfMessagesWithAction: {
        Follow: [["innerText", "Segui il Profilo"]],
        Like: [["innerText", "Like al Post"]],
        Story: [["innerText", "Guarda la Storia"]],
        Comment: [["innerText", "Commento al post"]],
        SpecificComment: [["innerText", "Commento Specifico al post"]],
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
          : stateOfCycle.consecutiveNewActions < 3 &&
            stateOfCycle.consecutiveSkips < 5,
    },
  },
});
