import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import * as fs from 'fs';
import { WebDeps } from 'launch-page';
import * as J from 'launch-page/lib/Json';
import * as JF from 'launch-page/lib/jsonFiles';
import { LaunchOptions, launchPage } from 'launch-page/lib/Puppeteer';
import { log, startFrom } from 'launch-page/lib/utils';
import * as WP from 'launch-page/lib/WebProgram';
import path from 'path';

const INJS = path.resolve(__dirname, "./deps.json");
// --------------------------------------
// Models
// --------------------------------------
/**
 *
 */
export enum EnumNamesOfPrograms {
  "Socialgift",
  "SocialMoney",
  "OpenBrowser",
  "FreeFollowerPlanMrInsta",
  "FreeFollowerPlanTurboMedia",
}
export type NamesOfPrograms = keyof typeof EnumNamesOfPrograms;
/**
 *
 */
export type Settings<R extends J.Json = J.Json> = {
  programOptions: R;
  launchOptions: LaunchOptions;
};
/**
 *
 */
export type Queries = {
  nameOfProgram: NamesOfPrograms | null;
  user: null | string;
};
/**
 *
 */
export type Deps<R extends J.Json = J.Json> = J.Json & Queries & Settings<R>;
/**
 *
 */
type Injecter<R extends J.Json> = TE.TaskEither<Error, Deps<R>>;
/**
 *
 */
type Modifier<R extends J.Json> = (D: Deps<R>) => TE.TaskEither<Error, void>;
/**
 *
 */
type Runner<R extends J.Json, A> = (D: Deps<R>) => TE.TaskEither<Error, A>;
/**
 *
 */
export type Executable<R extends J.Json, A> = {
  injecter: Injecter<R>;
  modifier: Modifier<R>;
  runner: Runner<R, A>;
};
// --------------------------------------
// Execute
// --------------------------------------
/**
 * @description execute an `Executable` and log the result to console
 * with
 * ```ts
 * import { log } from 'launch-page/lib/utils';
 * ```
 * @param executable
 * @returns void
 */
export const execute = <R extends J.Json, A>(executable: Executable<R, A>) =>
  pipe(executable.injecter, TE.chain(executable.runner), log);
// --------------------------------------
// Default Launch Options
// --------------------------------------

export const launchOptions = {
  userDataDir: (user: string | null) =>
    path.resolve(__dirname, `../userDataDirs/${user ?? "generic"}`),
  default: {
    headless: false,
    userDataDir: path.resolve(__dirname, `../userDataDirs/generic`),
    args: [
      "--lang=it",
      "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4403.0 Safari/537.36",
    ],
    defaultViewport: { width: 1050, height: 800 },
  },
};
// --------------------------------------
// DB
// --------------------------------------
/**
 *
 */
type DBGet = <R extends J.Json>(
  nameOfProgram: NamesOfPrograms,
  user: string | null
) => (db: Deps<R>[]) => O.Option<Deps<R>>;
/**
 *
 */
const getDepsFromDB: DBGet = (nameOfProgram, user) => (db) =>
  pipe(
    db,
    A.findFirst((D) => D.nameOfProgram === nameOfProgram && D.user === user)
  );
/**
 *
 */
const setDepsOnDB = <R extends J.Json>(
  nameOfProgram: NamesOfPrograms,
  user: string | null,
  db: Deps<R>[],
  writer: (db: Deps<R>[]) => TE.TaskEither<Error, void>
) => (deps: Deps<R>) =>
  pipe(
    db,
    A.findIndex((D) => D.nameOfProgram === nameOfProgram && D.user === user),
    O.match(
      () => writer([...db, deps]),
      (index) => writer([...db.slice(0, index), deps, ...db.slice(index + 1)])
    )
  );
// --------------------------------------
// Json file
// --------------------------------------
/**
 *
 */
export const getJson = <R extends J.Json>() =>
  pipe(
    E.of(fs.existsSync(INJS)),
    E.map((exists) => (exists ? undefined : fs.writeFileSync(INJS, "[]"))),
    E.chain(() => JF.getFromJsonFile<Deps<R>[]>(INJS)),
    E.chain((d) =>
      Array.isArray(d)
        ? E.right(d)
        : E.left(new Error("DB is an object, should be an array."))
    )
  );
/**
 *
 */
const setJson = <R extends J.Json>() => JF.postToJsonFile<Deps<R>[]>(INJS);
/**
 *
 */
export const modifyDepsOnJsonFile = <R extends J.Json>(
  nameOfProgram: NamesOfPrograms,
  user: string | null
) => (D: Deps<R>) =>
  pipe(
    TE.fromEither(getJson<R>()),
    TE.chain((db) =>
      setDepsOnDB(nameOfProgram, user, db, (db: Deps<R>[]) =>
        TE.fromEither(setJson()(db))
      )(D)
    )
  );
/**
 *
 */
const injectionFromJsonFile = <R extends J.Json>(
  nameOfProgram: NamesOfPrograms,
  user: string | null
) => (DefaultDeps: Deps<R>) =>
  pipe(
    TE.fromEither(getJson<R>()),
    TE.map(getDepsFromDB(nameOfProgram, user)),
    TE.chain(
      O.match(
        () =>
          pipe(
            TE.of({
              nameOfProgram,
              user,
              programOptions: DefaultDeps.programOptions,
              launchOptions: {
                ...DefaultDeps.launchOptions,
                userDataDir: launchOptions.userDataDir(user),
              },
            } as Deps<R>),
            TE.chainFirst(modifyDepsOnJsonFile<R>(nameOfProgram, user))
          ),
        TE.of
      )
    )
  );
/**
 *
 */
const closeBrowserAtEnd = <A>(program: WP.WebProgram<A>) =>
  pipe(
    program,
    WP.chainFirst(() =>
      pipe(
        WebDeps.browser,
        WP.chain((browser) => WP.of(browser.close()))
      )
    )
  );
/**
 *
 */
const runnerOfJsonExecutable = <R extends J.Json, A>(
  f: (i: R) => WP.WebProgram<A>
) => (D: Deps<R>) =>
  startFrom(closeBrowserAtEnd(f(D.programOptions)))(
    launchPage(D.launchOptions)
  );
/**
 *
 */
export const jsonExecutable = <R extends J.Json, A>(
  nameOfProgram: NamesOfPrograms,
  user: string | null,
  f: (i: R) => WP.WebProgram<A>
) => (DefaultDeps: Deps<R>): Executable<R, A> => ({
  injecter: injectionFromJsonFile<R>(nameOfProgram, user)(DefaultDeps),
  modifier: modifyDepsOnJsonFile(nameOfProgram, user),
  runner: runnerOfJsonExecutable(f),
});
