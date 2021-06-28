import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import * as fs from 'fs';
import path from 'path';

import { createErrorFromErrorInfos } from '../src/ErrorInfos';
import * as J from '../src/Json';
import * as JF from '../src/jsonFiles';
import { LaunchOptions, launchPage } from '../src/Puppeteer';
import { log, startFrom } from '../src/utils';
import * as WP from '../src/WebProgram';

const PATH = path.resolve(__filename);
const INJS = path.resolve(__dirname, "./deps.json");
// --------------------------------------
// Models
// --------------------------------------
/**
 *
 */
export enum EnumNamesOfPrograms {
  "Socialgift",
  "OpenBrowser",
}
export type NamesOfPrograms = keyof typeof EnumNamesOfPrograms;
/**
 *
 */
export type Deps<R extends J.Json> = J.Json & {
  nameOfProgram: NamesOfPrograms | null;
  programOptions: R;
  user: null | string;
  launchOptions: LaunchOptions;
};

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
 * import { log } from '../src/utils';
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
    `src/../userDataDirs/folders/${user ?? "generic"}`,
  default: {
    headless: false,
    userDataDir: `src/../userDataDirs/folders/generic`,
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
const getJson = <R extends J.Json>() =>
  pipe(
    E.of(fs.existsSync(INJS)),
    E.map((exists) => (exists ? undefined : fs.writeFileSync(INJS, "[]"))),
    E.chain(() => JF.getFromJsonFile<Deps<R>[]>(INJS)),
    E.chain((d) =>
      Array.isArray(d)
        ? E.right(d)
        : E.left(
            createErrorFromErrorInfos({
              message: "DB is an object, should be an array.",
              nameOfFunction: getJson.name,
              filePath: PATH,
            })
          )
    )
  );
/**
 *
 */
const setJson = <R extends J.Json>() => JF.postToJsonFile<Deps<R>[]>(INJS);
/**
 *
 */
const modifyDepsOnJsonFile = <R extends J.Json>(
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
const runnerOfJsonExecutable = <R extends J.Json, A>(
  f: (i: R) => WP.WebProgram<A>
) => (D: Deps<R>) =>
  startFrom(f(D.programOptions))(launchPage(D.launchOptions));
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
