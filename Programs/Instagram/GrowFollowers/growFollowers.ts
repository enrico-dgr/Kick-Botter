import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/TaskEither';
import fs from 'fs';
import * as t from 'io-ts';
import { WebDeps as WD, WebProgram as WP } from 'launch-page';
import path from 'path';
import { Browser } from 'puppeteer';

const Instauto = require("./instauto.js");

export namespace Models {
  const DB = t.type({
    path: t.string,
    followedDb: t.string,
    unfollowedDb: t.string,
    likedPhotosDb: t.string,
    cookiesPath: t.string,
    screenshotsDbDir: t.string,
  });

  interface _DB {
    path: string;
    followedDb: string;
    // Will store all unfollowed users here
    unfollowedDb: string;
    // Will store all likes here
    likedPhotosDb: string;
    cookiesPath: string;
    screenshotsDbDir: string;
  }

  type DB = Extract<_DB, t.TypeOf<typeof DB>>;

  export const Deps = t.type({
    db: DB,
    // List of usernames that we should follow the followers of, can be celebrities etc.
    usersToFollowFollowersOf: t.readonlyArray(t.string),
  });

  interface _Deps {
    db: DB;
    usersToFollowFollowersOf: string[];
  }

  export type Deps = Extract<_Deps, t.TypeOf<typeof Deps>>;
}

const options = {
  username: "rioccard",
  password: "asdf4ssHrd",

  // Global limit that prevents follow or unfollows (total) to exceed this number over a sliding window of one hour:
  maxFollowsPerHour: 40,
  // Global limit that prevents follow or unfollows (total) to exceed this number over a sliding window of one day:
  maxFollowsPerDay: 300,
  // (NOTE setting the above parameters too high will cause temp ban/throttle)

  maxLikesPerDay: 50,

  // Don't follow users that have a followers / following ratio less than this:
  followUserRatioMin: 0.2,
  // Don't follow users that have a followers / following ratio higher than this:
  followUserRatioMax: 4.0,
  // Don't follow users who have more followers than this:
  followUserMaxFollowers: null,
  // Don't follow users who have more people following them than this:
  followUserMaxFollowing: null,
  // Don't follow users who have less followers than this:
  followUserMinFollowers: null,
  // Don't follow users who have more people following them than this:
  followUserMinFollowing: null,

  // NOTE: The dontUnfollowUntilTimeElapsed option is ONLY for the unfollowNonMutualFollowers function
  // This specifies the time during which the bot should not touch users that it has previously followed (in milliseconds)
  // After this time has passed, it will be able to unfollow them again.
  // TODO should remove this option from here
  dontUnfollowUntilTimeElapsed: 3 * 24 * 60 * 60 * 1000,

  // Usernames that we should not touch, e.g. your friends and actual followings
  excludeUsers: [],

  // If true, will not do any actions (defaults to true)
  dryRun: false,
};

const existOrCreate = (path: string) =>
  fs.existsSync(path) ? undefined : fs.writeFileSync(path, "");

const main = async (
  D: Models.Deps,
  browser: Browser,
  keepGoing: () => boolean
) => {
  try {
    fs.existsSync(D.db.path)
      ? undefined
      : fs.mkdirSync(D.db.path, { recursive: true });

    const mainDB = {
      followedDbPath: path.join(D.db.path, D.db.followedDb),
      unfollowedDbPath: path.join(D.db.path, D.db.unfollowedDb),
      likedPhotosDbPath: path.join(D.db.path, D.db.likedPhotosDb),
    };

    const optionsPaths = {
      screenshotsPath: path.join(D.db.path, D.db.screenshotsDbDir),
      cookiesPath: path.join(D.db.path, D.db.cookiesPath),
    };

    Object.entries({ ...mainDB, ...optionsPaths }).forEach(([_key, value]) =>
      existOrCreate(value)
    );
    // Create a database where state will be loaded/saved to
    const instautoDb = await Instauto.JSONDB(mainDB);

    const instauto = await Instauto(instautoDb, browser, {
      ...options,
      ...optionsPaths,
    });

    const unfollowedCount = await instauto.unfollowOldFollowed({
      ageInDays: 14,
      limit: options.maxFollowsPerDay * (2 / 3),
    });

    if (unfollowedCount > 0) await instauto.sleep(10 * 60 * 1000);

    // Now go through each of these and follow a certain amount of their followers
    await instauto.followUsersFollowers(
      {
        usersToFollowFollowersOf: D.usersToFollowFollowersOf,
        maxFollowsTotal: options.maxFollowsPerDay - unfollowedCount,
        skipPrivate: true,
        enableLikeImages: true,
        likeImagesMax: 3,
      },
      keepGoing
    );

    await instauto.sleep(10 * 60 * 1000);

    console.log("Done running");

    await instauto.sleep(10000);
  } catch (err) {
    console.error(err);
  }
};

const growFollowers = (running: TE.TaskEither<Error, boolean>) => (
  D: Models.Deps
) =>
  pipe(
    WD.browser,
    WP.chain((browser) =>
      WP.fromTaskEither(async () => {
        let keepGoing: boolean = true;
        let res: E.Either<Error, void> = E.of(undefined);

        main(D, browser, () => keepGoing);

        while (keepGoing) {
          await pipe(
            running,
            TE.chainTaskK((b) => T.delay(400)(T.of(b))),
            TE.match(
              (e) => {
                console.error(e.message);
                res = E.left(e);
              },
              (keepGoing_) => {
                keepGoing = keepGoing_;
              }
            )
          )();
        }

        return res;
      })
    )
  );

export default growFollowers;
