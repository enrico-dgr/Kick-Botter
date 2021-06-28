import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import * as fs from 'fs';
import path from 'path';

import { createErrorFromErrorInfos } from '../src/ErrorInfos';
import { jsonFiles, readline, WebDeps, WebProgram as WP } from '../src/index';
import * as J from '../src/Json';
import { Deps, jsonExecutable, launchOptions, NamesOfPrograms } from './Executable';
import { actuator, Options, Output } from './Socialgift/index';

const PATH = path.resolve(__dirname, "./executables.ts");
// -----------------------
// utils
// -----------------------
/**
 * last element in path must be the file
 */
const mkdir = (path: string) =>
  pipe(path.split("/").reverse().slice(1), ([...dirs]) =>
    pipe(
      dirs.reverse().forEach((dir, i) => {
        let subPathToDir: string = "";
        for (let j = 0; j < i; j++) {
          subPathToDir = subPathToDir + `${dirs[j]}/`;
        }
        subPathToDir += `${dir}/`;
        fs.existsSync(subPathToDir) ? undefined : fs.mkdirSync(subPathToDir);
      })
    )
  );
/**
 *
 */
const getJson = <R extends J.Json>(path: string) =>
  pipe(
    E.of(fs.existsSync(path)),
    E.map((exists) =>
      exists ? undefined : pipe(mkdir(path), () => fs.writeFileSync(path, "[]"))
    ),
    E.chain(() => jsonFiles.getFromJsonFile<R[]>(path)),
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
const setJson = <R extends J.Json>(path: string) =>
  jsonFiles.postToJsonFile<R[]>(path);
/**
 *
 */
const pathOfLogs = (
  user: string | null,
  program: NamesOfPrograms,
  fileName: string
) =>
  `src/../examples/logs/${
    user !== null ? user : "generic"
  }/${program}/${fileName}`;
/**
 *
 */
const appendLog = <R extends J.Json>(
  user: string | null,
  program: NamesOfPrograms,
  fileName: string
) => (D: R) =>
  pipe(
    TE.fromEither(getJson<R>(pathOfLogs(user, program, fileName))),
    TE.chain((db) =>
      TE.fromEither(setJson(pathOfLogs(user, program, fileName))([...db, D]))
    )
  );
// -----------------------
// Socialgift
// -----------------------

const socialgift = (user: string | null) => (opts: Options) =>
  actuator({
    language: "it",
    nameOfBot: "Socialgift",
    loggers: {
      Confirm: [(report) => TE.of(console.log(report))],
      Skip: [(report) => appendLog(user, "Socialgift", "skip.json")(report)],
      End: [(report) => appendLog(user, "Socialgift", "end.json")(report)],
    },
    options: opts,
  });

const defaultDeps: Deps<Options> = {
  nameOfProgram: "Socialgift",
  user: null,
  programOptions: {
    skip: {
      Follow: false,
      Like: false,
      Comment: true,
      WatchStory: false,
      Extra: true,
    },
    delayBetweenCycles: 3 * 60 * 1000,
  },
  launchOptions: {
    ...launchOptions.default,
    headless: false,
  },
};

export const socialgiftExec = (user: string | null) =>
  jsonExecutable<Options, Output>(
    "Socialgift",
    user,
    socialgift(user)
  )(defaultDeps);
// ----------------------------------
// Open browser
// ----------------------------------

const openBrowser = (): WP.WebProgram<void> =>
  pipe(
    readline.askData("Type `exit` to end browser session."),
    WP.chain((read) =>
      read !== "exit"
        ? openBrowser()
        : pipe(
            WebDeps.browser,
            WP.chainTaskK((browser) => () => browser.close())
          )
    )
  );

const defaultDepsOB: Deps<null> = {
  nameOfProgram: "OpenBrowser",
  user: null,
  programOptions: null,
  launchOptions: {
    ...launchOptions.default,
    headless: false,
  },
};

export const openBrowserExec = (user: string | null) =>
  jsonExecutable<null, void>("OpenBrowser", user, openBrowser)(defaultDepsOB);
