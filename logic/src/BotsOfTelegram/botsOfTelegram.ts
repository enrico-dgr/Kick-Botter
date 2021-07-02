import { flow, pipe } from 'fp-ts/function';
import * as E from 'fp-ts/lib/Either';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/Option';
import * as S from 'fp-ts/Semigroup';
import * as EH from 'launch-page/lib/ElementHandle';
import * as SBL from 'launch-page/lib/SettingsByLanguage';
import * as WD from 'launch-page/lib/WebDeps';
import * as WP from 'launch-page/lib/WebProgram';
import { ElementHandle } from 'puppeteer';

import {
    Settings as SettingsOfTelegram, settingsByLanguage as settingsOfTelegramByLanguage
} from '../Telegram';

/**
 *
 */
enum EnumOfBots {
  Socialgift = "Socialgift",
  SocialMoney = "Social Money",
}
/**
 *
 */
export type StringLiteralOfBots = keyof typeof EnumOfBots;

/**
 *
 */
type StringLiteralOfActions<
  CustomStringLiteralOfActions extends string
> = CustomStringLiteralOfActions;

/**
 *
 */
type StringLiteralOfPostAction<
  CustomStringLiteralOfPostAction extends string
> = CustomStringLiteralOfPostAction | "Default" | "Skip";
/**
 *
 */
export type OutcomeOfAction<
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
  action: StringLiteralOfActions | "None";
  kindOfPostAction: StringLiteralOfPostAction<CustomStringLiteralOfPostAction>;
  infosForAction: InfosForAction | "None";
  infosFromAction: InfosFromAction | "None";
};
/**
 *
 */
export type Actions<
  CustomStringLiteralOfActions extends string,
  CustomStringLiteralOfPostAction extends string,
  InfosForAction,
  InfosFromAction
> = {
  [k in StringLiteralOfActions<CustomStringLiteralOfActions>]: (
    infosForAction: InfosForAction
  ) => WP.WebProgram<
    OutcomeOfAction<
      StringLiteralOfPostAction<CustomStringLiteralOfPostAction>,
      InfosFromAction
    >
  >;
};
/**
 *
 */
export type StateOfCycle<
  CustomStringLiteralOfPostAction extends string,
  OtherProps
> = {
  kindOfPostAction: StringLiteralOfPostAction<CustomStringLiteralOfPostAction>;
} & OtherProps;
/**
 *
 */
export interface SettingsFromBot<
  CustomStringLiteralOfActions extends string,
  CustomStringLiteralOfPostAction extends string,
  InfosForAction,
  InfosFromAction,
  OtherPropsInStateOfCycle
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
    implementationsOfActions: Actions<
      CustomStringLiteralOfActions,
      CustomStringLiteralOfPostAction,
      InfosForAction,
      InfosFromAction
    >;
    postAction: {
      [k in StringLiteralOfPostAction<CustomStringLiteralOfPostAction>]: (
        mess: ElementHandle<Element>
      ) => WP.WebProgram<void>;
    } & {
      Default: (mess: "None") => WP.WebProgram<void>;
    };
    cycle: {
      defaultState: StateOfCycle<
        CustomStringLiteralOfPostAction,
        OtherPropsInStateOfCycle
      >;
      updateState: (
        stateOfCycle: StateOfCycle<
          CustomStringLiteralOfPostAction,
          OtherPropsInStateOfCycle
        >
      ) => StateOfCycle<
        CustomStringLiteralOfPostAction,
        OtherPropsInStateOfCycle
      >;
      continueCycle: (
        stateOfCycle: StateOfCycle<
          CustomStringLiteralOfPostAction,
          OtherPropsInStateOfCycle
        >
      ) => boolean;
    };
  };
}
/**
 *
 */
interface SettingsFromLanguage {
  message: {
    xpath: string;
  };
}
/**
 *
 */
export type MapOfSettingsByBot<
  CustomStringLiteralOfActions extends string,
  CustomStringLiteralOfPostAction extends string,
  InfosForAction,
  InfosFromAction,
  OtherPropsInStateOfCycle
> = {
  [key in StringLiteralOfBots]: SettingsFromBot<
    CustomStringLiteralOfActions,
    StringLiteralOfPostAction<CustomStringLiteralOfPostAction>,
    InfosForAction,
    InfosFromAction,
    OtherPropsInStateOfCycle
  >;
};
const mapSettingsByBot: <
  CustomStringLiteralOfActions extends string,
  CustomStringLiteralOfPostAction extends string,
  InfosForAction,
  InfosFromAction,
  OtherPropsInStateOfCycle
>(
  mapOfSettingsByBot: MapOfSettingsByBot<
    CustomStringLiteralOfActions,
    CustomStringLiteralOfPostAction,
    InfosForAction,
    InfosFromAction,
    OtherPropsInStateOfCycle
  >
) => (
  nameOfBot: StringLiteralOfBots
) => SettingsFromBot<
  CustomStringLiteralOfActions,
  StringLiteralOfPostAction<CustomStringLiteralOfPostAction>,
  InfosForAction,
  InfosFromAction,
  OtherPropsInStateOfCycle
> = (mapOfSettingsByBot) => (nameOfBot) => mapOfSettingsByBot[nameOfBot];

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
  CustomStringLiteralOfActions extends string,
  CustomStringLiteralOfPostAction extends string,
  InfosForAction,
  InfosFromAction,
  OtherPropsInStateOfCycle
> = {
  language: SBL.Languages;
  loggers: Loggers<
    CustomStringLiteralOfActions,
    StringLiteralOfPostAction<CustomStringLiteralOfPostAction>,
    InfosForAction,
    InfosFromAction
  >;
  settingsFromBot: SettingsFromBot<
    CustomStringLiteralOfActions,
    StringLiteralOfPostAction<CustomStringLiteralOfPostAction>,
    InfosForAction,
    InfosFromAction,
    OtherPropsInStateOfCycle
  >;
  settingsFromLanguage: SettingsFromLanguage;
  options: Options<CustomStringLiteralOfActions>;
};

/**
 *
 */
const bodyOfBot = <
  CustomStringLiteralOfActions extends string,
  CustomStringLiteralOfPostAction extends string,
  InfosForAction,
  InfosFromAction,
  OtherPropsInStateOfCycle
>(
  I: InputOfBody<
    CustomStringLiteralOfActions,
    StringLiteralOfPostAction<CustomStringLiteralOfPostAction>,
    InfosForAction,
    InfosFromAction,
    OtherPropsInStateOfCycle
  >
): WP.WebProgram<
  StateOfCycle<CustomStringLiteralOfPostAction, OtherPropsInStateOfCycle>
> => {
  // --------------------------
  // Retrieve all loaded messages
  // --------------------------
  const retrieveAllLoadedMessages = () =>
    WD.waitFor$x(I.settingsFromLanguage.message.xpath);
  // --------------------------
  // Find message with Action
  // --------------------------
  type StateOfAction = {
    action: CustomStringLiteralOfActions;
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
          /**
           * @todo try this code and use this if good
           */
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
            I.settingsFromBot.fromBot.message
              .expectedContainedTextOfMessagesWithAction
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
                  action: actionAndProps[0] as CustomStringLiteralOfActions,
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
          )
        );
  // --------------------------
  // Run Action
  // --------------------------
  const runAction = (action: CustomStringLiteralOfActions) => (
    infosForAction: InfosForAction
  ): WP.WebProgram<
    OutcomeOfAction<
      StringLiteralOfPostAction<CustomStringLiteralOfPostAction>,
      InfosFromAction
    >
  > =>
    pipe(
      WD.runOnAnyDifferentPage(
        I.settingsFromBot.fromBot.implementationsOfActions[action](
          infosForAction
        )
      ),
      WP.chainFirst(WP.delay(1000)),
      WP.chainFirst(() => WD.bringToFront)
    );

  // -------------------------------
  // Post Action
  // -------------------------------
  const postAction = (mess: ElementHandle<Element>) => ({
    kindOfPostAction,
  }: Report<
    CustomStringLiteralOfActions,
    CustomStringLiteralOfPostAction,
    InfosForAction,
    InfosFromAction
  >): WP.WebProgram<void> =>
    I.settingsFromBot.fromBot.postAction[kindOfPostAction](mess);
  // -------------------------------
  // Loggers
  // -------------------------------
  const semigroupLoggers: S.Semigroup<
    (
      newReport: Report<
        CustomStringLiteralOfActions,
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
  const loggers = (action: CustomStringLiteralOfActions) => ({
    infosForAction,
    infosFromAction,
    kindOfPostAction,
  }: Report<
    CustomStringLiteralOfActions,
    CustomStringLiteralOfPostAction,
    InfosForAction,
    InfosFromAction
  >) =>
    WP.fromTaskEither(
      concatAllLoggers(I.loggers[kindOfPostAction])({
        action,
        kindOfPostAction,
        infosForAction,
        infosFromAction,
      })
    );
  // -------------------------------
  // Routine
  // -------------------------------
  const routineOfBot = (messages: ElementHandle<Element>[]) =>
    pipe(
      findLastMessageWithAction(messages),
      WP.chain((messageWithAction) =>
        messageWithAction.found === false
          ? pipe(
              I.settingsFromBot.fromBot.postAction.Default("None"),
              WP.map<
                void,
                StringLiteralOfPostAction<CustomStringLiteralOfPostAction>
              >(() => "Default")
            )
          : pipe(
              I.options.skip[messageWithAction.action]
                ? WP.of<
                    Report<
                      CustomStringLiteralOfActions,
                      CustomStringLiteralOfPostAction,
                      InfosForAction,
                      InfosFromAction
                    >
                  >({
                    action: messageWithAction.action,
                    kindOfPostAction: "Skip",
                    infosForAction: "None",
                    infosFromAction: "None",
                  })
                : pipe(
                    I.settingsFromBot.fromBot.getInfosForAction(
                      messageWithAction.mess
                    ),
                    WP.chain((infosForAction) =>
                      pipe(
                        runAction(messageWithAction.action)(infosForAction),
                        WP.map<
                          OutcomeOfAction<
                            StringLiteralOfPostAction<CustomStringLiteralOfPostAction>,
                            InfosFromAction
                          >,
                          Report<
                            CustomStringLiteralOfActions,
                            CustomStringLiteralOfPostAction,
                            InfosForAction,
                            InfosFromAction
                          >
                        >((o) => ({ ...o, infosForAction, action: "None" }))
                      )
                    )
                  ),
              WP.chainFirst(postAction(messageWithAction.mess)),
              WP.chainFirst(loggers(messageWithAction.action)),
              WP.map(({ kindOfPostAction }) => kindOfPostAction)
            )
      )
    );
  // --------------------------
  // Cycle
  // --------------------------
  const cycle = () => (
    webDeps: WD.WebDeps
  ): WP.WebProgram<
    StateOfCycle<CustomStringLiteralOfPostAction, OtherPropsInStateOfCycle>
  > => {
    const asyncLoop = async () => {
      /**
       *
       */
      let stateOfCycle: StateOfCycle<
        CustomStringLiteralOfPostAction,
        OtherPropsInStateOfCycle
      > = I.settingsFromBot.fromBot.cycle.defaultState;
      /**
       *
       */
      let continueCycle: boolean = true;
      /**
       *
       */
      let eitherOfWebProgram:
        | E.Either<
            Error,
            StateOfCycle<
              CustomStringLiteralOfPostAction,
              OtherPropsInStateOfCycle
            >
          >
        | undefined = undefined;
      /**
       *
       */
      const updateStateOfCycle = flow(
        I.settingsFromBot.fromBot.cycle.updateState,
        (updatedState) => (stateOfCycle = updatedState)
      );
      /**
       *
       */
      while (continueCycle) {
        await pipe(
          WP.delay(I.options.delayBetweenCycles)(undefined),
          WP.chain(() => retrieveAllLoadedMessages()),
          WP.chain((messages) => routineOfBot(messages)),
          WP.map<
            StringLiteralOfPostAction<CustomStringLiteralOfPostAction>,
            StateOfCycle<
              CustomStringLiteralOfPostAction,
              OtherPropsInStateOfCycle
            >
          >((kindOfPostAction) =>
            updateStateOfCycle({
              ...stateOfCycle,
              kindOfPostAction,
            })
          ),
          WP.match(
            (e) => {
              continueCycle = false;
              eitherOfWebProgram = E.left(e);
            },
            (updatedState) => {
              continueCycle = I.settingsFromBot.fromBot.cycle.continueCycle(
                updatedState
              );
              eitherOfWebProgram = E.right(updatedState);
            }
          )
        )(webDeps)();
        eitherOfWebProgram;
      }
      /**
       *
       */
      if (eitherOfWebProgram === undefined) {
        return E.left(new Error("Cycle return value is undefined."));
      }
      // value is give inside: while > pipe > WP.match
      return eitherOfWebProgram as E.Either<
        Error,
        StateOfCycle<CustomStringLiteralOfPostAction, OtherPropsInStateOfCycle>
      >;
    };

    return WP.fromTaskEither(() => asyncLoop());
  };

  /**
   *
   */
  return pipe(
    WD.goto(I.settingsFromBot.chatUrl.href),
    WP.chain(() => WP.ask()),
    WP.chain(cycle())
  );
};
// --------------------------
// Input
// --------------------------
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
export type Input<
  CustomStringLiteralOfActions extends string,
  CustomStringLiteralOfPostAction extends string,
  InfosForAction,
  InfosFromAction
> = {
  nameOfBot: StringLiteralOfBots;
  language: SBL.Languages;
  loggers: Loggers<
    CustomStringLiteralOfActions,
    StringLiteralOfPostAction<CustomStringLiteralOfPostAction>,
    InfosForAction,
    InfosFromAction
  >;
  options: Options<CustomStringLiteralOfActions>;
};
// --------------------------
// Settings from language
// --------------------------
const getPropsByLanguage = <A>(language: SBL.Languages) => (
  selectProps: (g: SettingsOfTelegram) => A
) =>
  SBL.getPropertiesFromSettingsAndLanguage<A, SettingsOfTelegram>(selectProps)(
    settingsOfTelegramByLanguage
  )(language);
/**
 *
 */
export const injectBot = <
  CustomStringLiteralOfActions extends string,
  CustomStringLiteralOfPostAction extends string,
  InfosForAction,
  InfosFromAction,
  OtherPropsInStateOfCycle
>(
  fromLanguageToMapOfSettingsByBot: (
    language: SBL.Languages
  ) => MapOfSettingsByBot<
    CustomStringLiteralOfActions,
    CustomStringLiteralOfPostAction,
    InfosForAction,
    InfosFromAction,
    OtherPropsInStateOfCycle
  >
) => (
  I: Input<
    CustomStringLiteralOfActions,
    CustomStringLiteralOfPostAction,
    InfosForAction,
    InfosFromAction
  >
) =>
  bodyOfBot({
    ...I,
    settingsFromBot: mapSettingsByBot(
      fromLanguageToMapOfSettingsByBot(I.language)
    )(I.nameOfBot),
    settingsFromLanguage: {
      message: {
        xpath: getPropsByLanguage<string>(I.language)((sets) =>
          sets.message.returnXPath(EnumOfBots[I.nameOfBot], "")
        ),
      },
    },
  });
