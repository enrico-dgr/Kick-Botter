import { flow, pipe } from 'fp-ts/function';
import { Reader } from 'fp-ts/lib/Reader';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/Option';
import * as S from 'fp-ts/Semigroup';
import path from 'path';
import { ElementHandle } from 'puppeteer';

import * as EH from '../../src/ElementHandle';
import { getPropertiesFromSettingsAndLanguage, Languages } from '../../src/SettingsByLanguage';
import * as WD from '../../src/WebDeps';
import * as WP from '../../src/WebProgram';
import { FollowUser, LikeToPost, WatchStoryAtUrl } from '../Instagram/index';
import {
    sendMessage, Settings as SettingsOfTelegram, settingsByLanguage as settingsOfTelegramByLanguage
} from '../Telegram';
import { Settings as SettingsOfBots, settingsByBotChoice } from './settings';
import { Bots, getPropertiesFromSettingsAndBotChoice } from './settingsByBotChoice';

const ABSOLUTE_PATH = path.resolve(__dirname, "./index.ts");

/**
 *
 */
enum enumOfActions {
  Follow = "Follow",
  Like = "Like",
  Comment = "Comment",
  WatchStory = "WatchStory",
  Extra = "EXTRA",
}
/**
 *
 */
export type TypeOfActions = keyof typeof enumOfActions;

/**
 *
 */
export type Options = {
  skip: { [key in TypeOfActions]: boolean };
  /**
   * Default to `3 * 60 * 1000 ms` (3 mins)
   */
  delayBetweenCycles: number;
};
/**
 *
 */
interface Settings {
  chatUrl: URL;
  message: {
    xpath: string;
    link: {
      relativeXPath: string;
    };
    buttonConfirm: {
      relativeXPath: string;
    };
    buttonSkip: {
      relativeXPath: string;
    };
    expectedContainedTextOfMessagesWithAction: {
      [k in TypeOfActions]: EH.HTMLElementProperties<HTMLElement, string>;
    };
  };
  buttonNewAction: {
    text: string;
  };
}
/**
 *
 */
type KindsOfOutcomeOfAction = "Confirm" | "Skip" | "End";
/**
 *
 */
type Report = {
  action: TypeOfActions;
  href: string;
  info: {};
};
/**
 *
 */
type Loggers = {
  [k in KindsOfOutcomeOfAction]: ((
    newReport: Report
  ) => TE.TaskEither<Error, void>)[];
};
/**
 *
 */
interface InputOfBody {
  nameOfBot: Bots;
  language: Languages;
  loggers?: Loggers;
  settings: Settings;
  options: Options;
}

// ----------------------------------
// Output
// ----------------------------------
/**
 *
 */
export type Output = {};
/**
 *
 */
type BodyOfActuator = Reader<InputOfBody, WP.WebProgram<Output>>;
/**
 *
 */
const bodyOfActuator: BodyOfActuator = (D) => {
  // --------------------------
  // Retrieve all loaded messages
  // --------------------------
  const messages = () => WD.waitFor$x(D.settings.message.xpath);
  // --------------------------
  // Find message of Action
  // --------------------------
  type ActionAndFound = {
    action: TypeOfActions;
    found: boolean;
  };
  const defaultActionAndWrongprops: ActionAndFound = {
    action: "Comment",
    found: false,
  };
  /**
   *
   */
  const semigroupChainMatchedAction: S.Semigroup<
    WP.WebProgram<ActionAndFound>
  > = {
    concat: (x, y) =>
      pipe(
        x,
        WP.chain((a) => (a.found ? WP.of(a) : y))
      ),
  };
  /**
   *
   */
  const concatAll = S.concatAll(semigroupChainMatchedAction)(
    WP.of(defaultActionAndWrongprops)
  );
  /**
   *
   */
  interface FoundMessage {
    _tag: "FoundMessage";
    el: ElementHandle<Element>;
    action: TypeOfActions;
  }
  /**
   *
   */
  interface NotFoundMessage {
    _tag: "NotFoundMessage";
  }
  /**
   *
   */
  type LastMessageWithAction = FoundMessage | NotFoundMessage;
  /**
   * @todo refactor
   */
  const findLastMessageWithAction = (
    els: ElementHandle<Element>[]
  ): WP.WebProgram<LastMessageWithAction> =>
    els.length < 1
      ? WP.of({ _tag: "NotFoundMessage" })
      : pipe(
          Object.entries(
            D.settings.message.expectedContainedTextOfMessagesWithAction
          ).map(
            // Object.entries doesn't let you specify keys,
            // ending up with string keys.
            (actionAndProps) =>
              pipe(
                els[els.length - 1],
                EH.getInnerText,
                WP.chain(
                  O.match(
                    () => WP.left(new Error("No innerText in msg")),
                    (text) => WP.of(text.search(actionAndProps[1][0][1]) > -1)
                  )
                ),
                WP.map((found) => ({
                  // To avoid typescript complaints -> `as TypeOfActions`
                  action: actionAndProps[0] as TypeOfActions,
                  found,
                }))
              )
          ),
          concatAll,
          WP.chain(({ action, found }) =>
            found
              ? WP.of<LastMessageWithAction>({
                  _tag: "FoundMessage",
                  el: els[els.length - 1],
                  action,
                })
              : findLastMessageWithAction(els.slice(0, els.length - 1))
          ),
          WP.orElseStackErrorInfos({
            message: "",
            nameOfFunction: "findLastMessageWithAction",
            filePath: ABSOLUTE_PATH,
          })
        );
  // --------------------------
  // Cycle
  // --------------------------
  type ResultOfCycle = "NewAction" | "Confirm" | "Skip" | "End";
  type StateOfCycle = {
    _tag: ResultOfCycle;
    /**
     * should be less than 5
     */
    consecutiveSkips: number;
    /**
     * should be less than 5
     */
    consecutiveNewActions: number;
  };
  const updateState = (soc: StateOfCycle): StateOfCycle => {
    switch (soc._tag) {
      case "Confirm":
        return { ...soc, consecutiveSkips: 0, consecutiveNewActions: 0 };
      case "Skip":
        return { ...soc, consecutiveSkips: soc.consecutiveSkips + 1 };
      case "NewAction":
        return { ...soc, consecutiveNewActions: soc.consecutiveNewActions + 1 };
      case "End":
        return { ...soc };
    }
  };
  /**
   *
   */
  const cycle = (
    soc: StateOfCycle = {
      _tag: "Confirm",
      consecutiveSkips: 0,
      consecutiveNewActions: 0,
    }
  ): WP.WebProgram<StateOfCycle> => {
    // --------------------------
    // Action
    // --------------------------
    const runAction = (action: TypeOfActions) => (
      messageWithAction: ElementHandle<Element>
    ): WP.WebProgram<ResultOfCycle> => {
      // --------------------------
      // Get Infos for Action
      // --------------------------
      const getActionHref: () => WP.WebProgram<string> = () =>
        pipe(
          EH.$x(D.settings.message.link.relativeXPath)(messageWithAction),
          WP.chain((els) =>
            els.length === 1
              ? WP.of(els[0])
              : pipe(
                  EH.getInnerText(messageWithAction),
                  WP.chain((text) =>
                    WP.left(
                      new Error(
                        `Found ${els.length} HTMLAnchorElement(s) containing 'http'.\n` +
                          `Text of message is: ${text}`
                      )
                    )
                  )
                )
          ),
          WP.chain(EH.getHref),
          WP.chain(
            O.match(() => WP.left(new Error("No link at bot message")), WP.of)
          ),
          WP.orElseStackErrorInfos({
            message: `In message with bot ${D.nameOfBot}`,
            nameOfFunction: "getActionHref",
            filePath: ABSOLUTE_PATH,
          })
        );
      // --------------------------
      // Actions Implementation
      // --------------------------
      /**
       *
       */

      type OutcomeOfAction = { outcome: KindsOfOutcomeOfAction; info: {} };
      /**
       *
       */
      const returnSkip = (info: {}): OutcomeOfAction => ({
        outcome: "Skip",
        info,
      });
      const returnConfirm = (info: {}): OutcomeOfAction => ({
        outcome: "Confirm",
        info,
      });
      const returnEnd = (info: {}): OutcomeOfAction => ({
        outcome: "End",
        info,
      });
      /**
       *
       */
      const implementationsOfActions: {
        [k in TypeOfActions]: (url: URL) => WP.WebProgram<OutcomeOfAction>;
      } = {
        Follow: (url: URL) =>
          pipe(
            FollowUser.followUser({
              language: D.language,
              profileUrl: url,
              options: { allowPrivate: false },
            }),
            WP.chain((outputOfFollowUser) =>
              outputOfFollowUser._tag === "NotFollowed"
                ? WP.of(returnSkip(outputOfFollowUser))
                : pipe(
                    FollowUser.followUser({
                      language: D.language,
                      profileUrl: url,
                      options: { allowPrivate: false },
                    }),
                    WP.map((outputOfCheck) =>
                      outputOfCheck._tag === "NotFollowed"
                        ? returnConfirm(outputOfFollowUser)
                        : returnEnd(outputOfCheck)
                    )
                  )
            ),
            WP.orElseStackErrorInfos({
              message: "",
              nameOfFunction: "Follow",
              filePath: ABSOLUTE_PATH,
            })
          ),
        Like: (url: URL) =>
          pipe(
            LikeToPost.likeToPost({
              language: D.language,
              urlOfPost: url,
              options: {},
            }),
            WP.chain((outputOfLike) =>
              outputOfLike._tag === "NotLiked"
                ? WP.of(returnSkip(outputOfLike))
                : pipe(
                    LikeToPost.likeToPost({
                      language: D.language,
                      urlOfPost: url,
                      options: {},
                    }),
                    WP.map((outputOfCheck) =>
                      outputOfCheck._tag === "NotLiked"
                        ? returnConfirm(outputOfLike)
                        : returnEnd(outputOfCheck)
                    )
                  )
            ),
            WP.orElseStackErrorInfos({
              message: "",
              nameOfFunction: "Like",
              filePath: ABSOLUTE_PATH,
            })
          ),
        WatchStory: (url: URL) =>
          pipe(
            WatchStoryAtUrl.watchStoryAtUrl({
              language: D.language,
              storyUrl: url,
              options: {},
            }),
            WP.map((o) =>
              o._tag === "AllWatched" ? returnConfirm(o) : returnSkip(o)
            ),
            WP.orElseStackErrorInfos({
              message: "",
              nameOfFunction: "WatchStory",
              filePath: ABSOLUTE_PATH,
            })
          ),
        Comment: (url: URL) =>
          WP.of(
            returnSkip({ message: "Comment is not implemented", url: url.href })
          ),
        Extra: (url: URL) =>
          WP.of(
            returnSkip({ message: "Extra is not implemented", url: url.href })
          ),
      };

      // --------------------------
      // Skip, Confirm, End
      // --------------------------
      const semigroupReportLoggers: S.Semigroup<
        (newReport: Report) => TE.TaskEither<Error, void>
      > = {
        concat: (x, y) =>
          flow((newReport: Report) =>
            pipe(
              x(newReport),
              TE.chain(() => y(newReport))
            )
          ),
      };
      const ___emptyLogger = () => TE.of(undefined);
      const concatAllReportLoggers = S.concatAll(semigroupReportLoggers)(
        ___emptyLogger
      );
      /**
       *
       */
      const abstractionOfConfirmAndSkip: (
        nameOfFunction: KindsOfOutcomeOfAction,
        xpathOfButton: string,
        newReport?: ((newReport: Report) => TE.TaskEither<Error, void>)[]
      ) => (report: Report) => WP.WebProgram<ResultOfCycle> = (
        _nameOfFunction,
        _xpathOfButton,
        _newReport
      ) => (report) =>
        pipe(
          EH.$x(_xpathOfButton)(messageWithAction),
          WP.chain((els) =>
            els.length === 1
              ? WP.of(els[0])
              : WP.left(
                  new Error(
                    `Found ${els.length} HTMLButtonElement(s) containing ${_nameOfFunction}-button.`
                  )
                )
          ),
          WP.chain(EH.click()),
          WP.chainFirst(() =>
            WP.fromTaskEither(
              concatAllReportLoggers(_newReport ?? [___emptyLogger])(report)
            )
          ),
          WP.map<void, ResultOfCycle>(() => _nameOfFunction),
          WP.orElseStackErrorInfos({
            message: `In message with bot ${D.nameOfBot}`,
            nameOfFunction: _nameOfFunction,
            filePath: ABSOLUTE_PATH,
          })
        );
      const fromActionToNewCycle: {
        [k in KindsOfOutcomeOfAction]: (
          report: Report
        ) => WP.WebProgram<ResultOfCycle>;
      } = {
        Confirm: abstractionOfConfirmAndSkip(
          "Confirm",
          D.settings.message.buttonConfirm.relativeXPath,
          D.loggers?.Confirm
        ),
        Skip: abstractionOfConfirmAndSkip(
          "Skip",
          D.settings.message.buttonSkip.relativeXPath,
          D.loggers?.Skip
        ),
        End: (report) =>
          pipe(
            WP.fromTaskEither(
              concatAllReportLoggers(D.loggers?.End ?? [___emptyLogger])(report)
            ),
            WP.map<void, ResultOfCycle>(() => "End"),
            WP.orElseStackErrorInfos({
              message: `In message with bot ${D.nameOfBot}`,
              nameOfFunction: "End",
              filePath: ABSOLUTE_PATH,
            })
          ),
      };

      /**
       *
       */
      return pipe(
        getActionHref(),
        WP.chain((href) =>
          pipe(
            D.options.skip[action]
              ? WP.of(
                  returnSkip({
                    message: `${action} skipped because of option's skip === true`,
                  })
                )
              : WD.runOnAnyDifferentPage<OutcomeOfAction>(
                  implementationsOfActions[action](new URL(href))
                ),
            WP.map((outcomeOfAction) => ({ ...outcomeOfAction, href }))
          )
        ),

        WP.chainFirst(WP.delay(1000)),

        WP.chainFirst(() => WD.bringToFront),
        WP.chain(({ outcome: kindOfOutcome, info, href }) =>
          fromActionToNewCycle[kindOfOutcome]({
            action,
            href,
            info,
          })
        )
      );
    };
    /**
     *
     */
    const routineOfBot = flow(
      findLastMessageWithAction,
      WP.chain((messageWithAction) =>
        messageWithAction._tag === "NotFoundMessage"
          ? pipe(
              sendMessage(D.language)(D.settings.buttonNewAction.text),
              WP.map<void, ResultOfCycle>(() => "NewAction")
            )
          : pipe(runAction(messageWithAction.action)(messageWithAction.el))
      ),
      WP.orElseStackErrorInfos({
        message: "",
        nameOfFunction: "routineOfBot",
        filePath: ABSOLUTE_PATH,
      })
    );

    return soc._tag === "End"
      ? WP.of(soc)
      : soc.consecutiveNewActions > 2 || soc.consecutiveSkips > 4
      ? WP.of(updateState({ ...soc, _tag: "End" }))
      : pipe(
          WP.delay(D.options.delayBetweenCycles)(undefined),

          WP.chain(() => messages()),
          WP.chain((messages) => routineOfBot(messages)),
          WP.map<ResultOfCycle, StateOfCycle>((_tag) =>
            updateState({ ...soc, _tag })
          ),

          WP.chain(cycle),
          WP.orElseStackErrorInfos({
            message: "",
            nameOfFunction: "cycle",
            filePath: ABSOLUTE_PATH,
          })
        );
  };
  /**
   *
   */
  return pipe(
    WD.goto(D.settings.chatUrl.href),

    WP.chain(() => cycle())
  );
};

export interface Input {
  nameOfBot: Bots;
  language: Languages;
  loggers?: Loggers;
  options: Options;
}
export const actuator = (I: Input) => {
  const getPropsByBotChoice = <A>(selectProps: (g: SettingsOfBots) => A) =>
    getPropertiesFromSettingsAndBotChoice<A, SettingsOfBots>(selectProps)(
      settingsByBotChoice
    )(I.nameOfBot);
  const getPropsByLanguage = <A>(selectProps: (g: SettingsOfTelegram) => A) =>
    getPropertiesFromSettingsAndLanguage<A, SettingsOfTelegram>(selectProps)(
      settingsOfTelegramByLanguage
    )(I.language);

  return bodyOfActuator({
    ...I,
    settings: {
      chatUrl: getPropsByBotChoice((sets) => sets.chatUrl),
      buttonNewAction: {
        text: getPropsByBotChoice<string>(
          (sets) => sets.dialog.elements.buttonNewAction.text
        ),
      },
      message: {
        xpath: getPropsByLanguage<string>((sets) =>
          sets.message.returnXPath(I.nameOfBot, "")
        ),
        link: {
          relativeXPath: getPropsByBotChoice<string>(
            (sets) => sets.message.elements.link.relativeXPath
          ),
        },
        buttonConfirm: {
          relativeXPath: getPropsByBotChoice<string>(
            (sets) => sets.message.elements.buttonConfirm.relativeXPath
          ),
        },
        buttonSkip: {
          relativeXPath: getPropsByBotChoice<string>(
            (sets) => sets.message.elements.buttonSkip.relativeXPath
          ),
        },
        expectedContainedTextOfMessagesWithAction: getPropsByBotChoice(
          (sets) => sets.message.expectedTextsForActions
        ),
      },
    },
  });
};
