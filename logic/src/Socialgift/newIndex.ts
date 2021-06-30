import { flow, pipe } from 'fp-ts/function';
import { Reader } from 'fp-ts/lib/Reader';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/Option';
import * as S from 'fp-ts/Semigroup';
import * as EH from 'launch-page/lib/ElementHandle';
import {
    getPropertiesFromSettingsAndLanguage, Languages
} from 'launch-page/lib/SettingsByLanguage';
import * as WD from 'launch-page/lib/WebDeps';
import * as WP from 'launch-page/lib/WebProgram';
import path from 'path';
import { ElementHandle } from 'puppeteer';

import { FollowUser, LikeToPost, WatchStoryAtUrl } from '../Instagram/index';
import {
    sendMessage, Settings as SettingsOfTelegram, settingsByLanguage as settingsOfTelegramByLanguage
} from '../Telegram';
import { Settings as SettingsOfBots, settingsByBotChoice } from './settings';
import {
    Bots as StringLiteralOfBots, getPropertiesFromSettingsAndBotChoice
} from './settingsByBotChoice';

const ABSOLUTE_PATH = path.resolve(__dirname, "./index.ts");
/**
 *
 */
type StringLiteralOfActions<CustomStringLiteralOfActions extends string> =
  | CustomStringLiteralOfActions
  | "None";
/**
 *
 */
export type Options<CustomStringLiteralOfActions extends string> = {
  skip: {
    [key in StringLiteralOfActions<CustomStringLiteralOfActions>]: boolean;
  };
  /**
   * Default to `3 * 60 * 1000 ms` (3 mins)
   */
  delayBetweenCycles: number;
};

/**
 *
 */
type StringLiteralOfPostAction<
  CustomStringLiteralOfPostAction extends string
> = CustomStringLiteralOfPostAction | "Default";
/**
 *
 */
type OutcomeOfAction<
  CustomStringLiteralOfPostAction extends string,
  InfosFromAction
> = {
  kindOfPostAction: StringLiteralOfPostAction<CustomStringLiteralOfPostAction>;
  infosFromAction: InfosFromAction;
};
/**
 *
 */
type Report<
  StringLiteralOfActions extends string,
  CustomStringLiteralOfPostAction extends string,
  InfosForAction,
  InfosFromAction
> = {
  action: StringLiteralOfActions;
  kindOfPostAction: StringLiteralOfPostAction<CustomStringLiteralOfPostAction>;
  infosForAction: InfosForAction | "None";
  infosFromAction: InfosFromAction | "None";
};
/**
 *
 */
interface Settings<
  CustomStringLiteralOfActions extends string,
  CustomStringLiteralOfPostAction extends string,
  InfosForAction,
  InfosFromAction,
  StateOfCycle extends {
    kindOfPostAction: StringLiteralOfPostAction<CustomStringLiteralOfPostAction>;
  }
> {
  chatUrl: URL;
  fromBot: {
    message: {
      expectedContainedTextOfMessagesWithAction: {
        [k in StringLiteralOfActions<CustomStringLiteralOfActions>]: EH.HTMLElementProperties<
          HTMLElement,
          string
        >;
      };
    };
    getInfosForAction: (
      messageOfAction: ElementHandle<Element>
    ) => WP.WebProgram<InfosForAction>;
    implementationsOfActions: {
      [k in StringLiteralOfActions<CustomStringLiteralOfActions>]: (
        infosForAction: InfosForAction
      ) => WP.WebProgram<
        OutcomeOfAction<
          StringLiteralOfPostAction<CustomStringLiteralOfPostAction>,
          InfosFromAction
        >
      >;
    };
    postAction: {
      [k in StringLiteralOfPostAction<CustomStringLiteralOfPostAction>]: (
        report: Report<
          StringLiteralOfActions<CustomStringLiteralOfActions>,
          StringLiteralOfPostAction<CustomStringLiteralOfPostAction>,
          InfosForAction,
          InfosFromAction
        >
      ) => WP.WebProgram<void>;
    };
    cycle: {
      defaultState: StateOfCycle;
      updateState: (stateOfCycle: StateOfCycle) => StateOfCycle;
      continueCycle: (stateOfCycle: StateOfCycle) => boolean;
    };
  };
  fromLanguage: {
    message: {
      xpath: string;
    };
  };
}
/**
 *
 */
type Loggers<
  StringLiteralOfActions extends string,
  CustomStringLiteralOfPostAction extends string,
  InfosForAction,
  InfosFromAction
> = {
  [k in StringLiteralOfPostAction<CustomStringLiteralOfPostAction>]: ((
    newReport: Report<
      StringLiteralOfActions,
      StringLiteralOfPostAction<CustomStringLiteralOfPostAction>,
      InfosForAction,
      InfosFromAction
    >
  ) => TE.TaskEither<Error, void>)[];
};

/**
 *
 */
type InputOfBody<
  StringLiteralOfActions extends string,
  CustomStringLiteralOfPostAction extends string,
  InfosForAction,
  InfosFromAction,
  StateOfCycle extends {
    kindOfPostAction: StringLiteralOfPostAction<CustomStringLiteralOfPostAction>;
  }
> = {
  nameOfBot: StringLiteralOfBots;
  language: Languages;
  loggers: Loggers<
    StringLiteralOfActions,
    StringLiteralOfPostAction<CustomStringLiteralOfPostAction>,
    InfosForAction,
    InfosFromAction
  >;
  settings: Settings<
    StringLiteralOfActions,
    StringLiteralOfPostAction<CustomStringLiteralOfPostAction>,
    InfosForAction,
    InfosFromAction,
    StateOfCycle
  >;
  options: Options<StringLiteralOfActions>;
};

/**
 *
 */
const bodyOfActuator = <
  StringLiteralOfActions extends string,
  CustomStringLiteralOfPostAction extends string,
  InfosForAction,
  InfosFromAction,
  StateOfCycle extends {
    kindOfPostAction: StringLiteralOfPostAction<CustomStringLiteralOfPostAction>;
  }
>(
  I: InputOfBody<
    StringLiteralOfActions,
    StringLiteralOfPostAction<CustomStringLiteralOfPostAction>,
    InfosForAction,
    InfosFromAction,
    StateOfCycle
  >
): WP.WebProgram<StateOfCycle> => {
  // --------------------------
  // Retrieve all loaded messages
  // --------------------------
  const messages = () => WD.waitFor$x(I.settings.fromLanguage.message.xpath);
  // --------------------------
  // Find message of Action
  // --------------------------
  type StateOfAction = {
    action: StringLiteralOfActions;
    found: boolean;
  };
  /**
   *
   */
  const semigroupChainMatchedAction: S.Semigroup<
    WP.WebProgram<StateOfAction>
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
  const concatAll = S.concatAll(semigroupChainMatchedAction);
  /**
   *
   */
  type LastMessageWithAction =
    | (StateOfAction & {
        found: true;
        mess: ElementHandle<Element>;
      })
    | { found: false };
  /**
   * @todo refactor
   */
  const findLastMessageWithAction = (
    els: ElementHandle<Element>[]
  ): WP.WebProgram<LastMessageWithAction> =>
    els.length < 1
      ? WP.of({ found: false })
      : pipe(
          // const func = (text: string) => (o: asd) => {
          //   const actionLit = Object.keys(o) as ActionLit[];

          //   actionLit.forEach((k) => {
          //     const htmlProps = o[k];
          //     const expectedInnerText = htmlProps.find((prop) => prop[0] === "innerText");
          //     if (expectedInnerText === undefined) {
          //       return undefined;
          //     }

          //     if (text.search(expectedInnerText[1]) > -1) {
          //       return {
          //         action: k,
          //         found: true,
          //       };
          //     } else {
          //       return {
          //         action: k,
          //         found: false,
          //       };
          //     }
          //   });
          // };
          Object.entries<EH.HTMLElementProperties<HTMLElement, string>>(
            I.settings.fromBot.message.expectedContainedTextOfMessagesWithAction
          ).map(
            // <[TypeOfActions,EH.HTMLElementProperties<HTMLElement, string>]>
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
                  action: actionAndProps[0] as StringLiteralOfActions,
                  found,
                }))
              )
          ),
          (res) => concatAll(res[0])(res.slice(1)),
          WP.chain(({ action, found }) =>
            found
              ? WP.of<LastMessageWithAction>({
                  found: true,
                  mess: els[els.length - 1],
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
  // Run Action
  // --------------------------
  const runAction = (action: StringLiteralOfActions) => (
    infosForAction: InfosForAction
  ): WP.WebProgram<
    OutcomeOfAction<
      StringLiteralOfPostAction<CustomStringLiteralOfPostAction>,
      InfosFromAction
    >
  > => {
    /**
     *
     */
    return pipe(
      WD.runOnAnyDifferentPage(
        I.settings.fromBot.implementationsOfActions[action](infosForAction)
      ),
      WP.chainFirst(WP.delay(1000)),
      WP.chainFirst(() => WD.bringToFront)
    );
  };
  // -------------------------------
  // Concat Loggers
  // -------------------------------
  const semigroupLoggers: S.Semigroup<
    (
      newReport: Report<
        StringLiteralOfActions,
        CustomStringLiteralOfPostAction,
        InfosForAction,
        InfosFromAction
      >
    ) => TE.TaskEither<Error, void>
  > = {
    concat: (x, y) =>
      flow((newReport) =>
        pipe(
          x(newReport),
          TE.chain(() => y(newReport))
        )
      ),
  };
  const concatAllLoggers = S.concatAll(semigroupLoggers)(() =>
    TE.of(undefined)
  );
  // -------------------------------
  // Routine
  // -------------------------------
  const routineOfBot = (messages: ElementHandle<Element>[]) =>
    pipe(
      findLastMessageWithAction(messages),
      WP.chain<LastMessageWithAction, any>((messageWithAction) =>
        messageWithAction.found === false
          ? pipe(
              I.settings.fromBot.postAction["Default"]({
                action: "None",
                kindOfPostAction: "Default",
                infosForAction: "None",
                infosFromAction: "None",
              }),
              WP.map<
                void,
                StringLiteralOfPostAction<CustomStringLiteralOfPostAction>
              >(() => "Default")
            )
          : pipe(
              I.settings.fromBot.getInfosForAction(messageWithAction.mess),
              WP.chain((infosForAction) =>
                pipe(
                  runAction(messageWithAction.action)(infosForAction),
                  WP.map((o) => ({ ...o, infosForAction }))
                )
              ),
              WP.chainFirst(
                ({ infosForAction, infosFromAction, kindOfPostAction }) =>
                  I.settings.fromBot.postAction[kindOfPostAction]({
                    action: messageWithAction.action,
                    kindOfPostAction,
                    infosForAction,
                    infosFromAction,
                  })
              ),
              WP.chainFirst(
                ({ infosForAction, infosFromAction, kindOfPostAction }) =>
                  WP.fromTaskEither(
                    concatAllLoggers(I.loggers[kindOfPostAction])({
                      action: messageWithAction.action,
                      kindOfPostAction,
                      infosForAction,
                      infosFromAction,
                    })
                  )
              ),
              WP.map(({ kindOfPostAction }) => kindOfPostAction)
            )
      ),
      WP.orElseStackErrorInfos({
        message: "",
        nameOfFunction: "routineOfBot",
        filePath: ABSOLUTE_PATH,
      })
    );
  // --------------------------
  // Cycle
  // --------------------------
  const cycle = (
    stateOfCycle: StateOfCycle = I.settings.fromBot.cycle.defaultState
  ): WP.WebProgram<StateOfCycle> => {
    return I.settings.fromBot.cycle.continueCycle(stateOfCycle) === false
      ? WP.of(stateOfCycle)
      : pipe(
          WP.delay(I.options.delayBetweenCycles)(undefined),

          WP.chain(() => messages()),
          WP.chain((messages) => routineOfBot(messages)),
          WP.map<
            StringLiteralOfPostAction<CustomStringLiteralOfPostAction>,
            StateOfCycle
          >((kindOfPostAction) =>
            I.settings.fromBot.cycle.updateState({
              ...stateOfCycle,
              kindOfPostAction,
            })
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
    WD.goto(I.settings.chatUrl.href),

    WP.chain(() => cycle())
  );
};

// export interface Input {
//   nameOfBot: Bots;
//   language: Languages;
//   loggers?: Loggers;
//   options: Options;
// }
// export const actuator = (I: Input) => {
//   const getPropsByBotChoice = <A>(selectProps: (g: SettingsOfBots) => A) =>
//     getPropertiesFromSettingsAndBotChoice<A, SettingsOfBots>(selectProps)(
//       settingsByBotChoice
//     )(I.nameOfBot);
//   const getPropsByLanguage = <A>(selectProps: (g: SettingsOfTelegram) => A) =>
//     getPropertiesFromSettingsAndLanguage<A, SettingsOfTelegram>(selectProps)(
//       settingsOfTelegramByLanguage
//     )(I.language);

//   return bodyOfActuator({
//     ...I,
//     settings: {
//       chatUrl: getPropsByBotChoice((sets) => sets.chatUrl),
//       buttonNewAction: {
//         text: getPropsByBotChoice<string>(
//           (sets) => sets.dialog.elements.buttonNewAction.text
//         ),
//       },
//       message: {
//         xpath: getPropsByLanguage<string>((sets) =>
//           sets.message.returnXPath(I.nameOfBot, "")
//         ),
//         link: {
//           relativeXPath: getPropsByBotChoice<string>(
//             (sets) => sets.message.elements.link.relativeXPath
//           ),
//         },
//         buttonConfirm: {
//           relativeXPath: getPropsByBotChoice<string>(
//             (sets) => sets.message.elements.buttonConfirm.relativeXPath
//           ),
//         },
//         buttonSkip: {
//           relativeXPath: getPropsByBotChoice<string>(
//             (sets) => sets.message.elements.buttonSkip.relativeXPath
//           ),
//         },
//         expectedContainedTextOfMessagesWithAction: getPropsByBotChoice(
//           (sets) => sets.message.expectedTextsForActions
//         ),
//       },
//     },
//   });
// };
