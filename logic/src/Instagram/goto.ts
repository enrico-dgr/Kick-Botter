import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import * as S from 'fp-ts/Semigroup';

import { getPropertiesFromSettingsAndLanguage, Languages } from '../../src/SettingsByLanguage';
import * as WD from '../../src/WebDeps';
import * as WP from '../../src/WebProgram';
import { Settings, settingsByLanguage } from './SettingsByLanguage';

/**
 *
 */
export type StateOfInstagramPage =
  | "AvailablePage"
  | "NotAvailablePage"
  | "WaitForTimePage";
/**
 *
 */
const check = ({
  xpath,
  badState,
}: {
  xpath: string;
  badState: StateOfInstagramPage;
}) =>
  pipe(
    WD.$x(xpath),
    WP.map(A.isEmpty),
    WP.map((isEmpty) => ({
      isEmpty,
      badState,
    }))
  );
/**
 *
 */
const semigroupChainChecks: S.Semigroup<
  WP.WebProgram<{
    isEmpty: boolean;
    badState: StateOfInstagramPage;
  }>
> = {
  concat: (x, y) =>
    pipe(
      x,
      WP.chain(({ isEmpty }) => (isEmpty ? y : x))
    ),
};
/**
 *
 */
const concatChecks = S.concatAll(semigroupChainChecks);
/**
 *
 */
const recursivelyTryGotoInstagramPage = (
  badCases: { xpath: string; badState: StateOfInstagramPage }[]
) => (n: number) => (): WP.WebProgram<StateOfInstagramPage> =>
  n > 0
    ? pipe(
        badCases.map((xpath) => check(xpath)),
        (checks) => concatChecks(checks[0])(checks.slice(1)),
        WP.chain(({ isEmpty, badState }) =>
          isEmpty === true
            ? pipe(
                undefined,
                WP.delay(500),
                WP.chain(() =>
                  recursivelyTryGotoInstagramPage(badCases)(n - 1)()
                )
              )
            : WP.of<StateOfInstagramPage>(badState)
        )
      )
    : WP.of<StateOfInstagramPage>("AvailablePage");
/**
 *
 */
export const goto: (
  lang: Languages
) => (url: string) => WP.WebProgram<StateOfInstagramPage> = (lang) => (url) =>
  pipe(
    WD.goto(url),
    WP.chain(
      recursivelyTryGotoInstagramPage(
        getPropertiesFromSettingsAndLanguage<
          { xpath: string; badState: StateOfInstagramPage }[],
          Settings
        >((sets) => [
          { xpath: sets.notAvailablePage.XPath, badState: "NotAvailablePage" },
          { xpath: sets.waitForTimePage.XPath, badState: "WaitForTimePage" },
        ])(settingsByLanguage)(lang)
      )(3)
    )
  );
