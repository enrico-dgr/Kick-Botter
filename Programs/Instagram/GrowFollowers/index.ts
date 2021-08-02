import * as t from 'io-ts';
import { WebProgram as WP } from 'launch-page';

import { launchOptions } from '../../LaunchOptions';
import { buildProgram, Models as PModels } from '../../Program';
import growFollowers from './growFollowers';

const NAME = "GrowFollowers";

const extraOptionsType = t.type({
  db: t.type({
    path: t.string,
    followedDb: t.string,
    // Will store all unfollowed users here
    unfollowedDb: t.string,
    // Will store all likes here
    likedPhotosDb: t.string,
    cookiesPath: t.string,
  }),
  usersToFollowFollowersOf: t.array(t.string),
});

type ExtraOptions = t.TypeOf<typeof extraOptionsType>;

const extraOptions: ExtraOptions = {
  db: {
    path: "unknown",
    followedDb: "followed.json",
    // Will store all unfollowed users here
    unfollowedDb: "unfollowed.json",
    // Will store all likes here
    likedPhotosDb: "liked-photos.json",
    cookiesPath: "cookies.json",
  },
  usersToFollowFollowersOf: ["lostleblanc", "sam_kolder"],
};

const defaultOptions: PModels.DefaultOptions = (D) => ({
  extraOptions,
  launchOptions: launchOptions(D),
});

const self = (_programDeps: PModels.ProgramDeps) => (
  extraOptions: ExtraOptions
): WP.WebProgram<void> => growFollowers(extraOptions);

const program = buildProgram({
  name: NAME,
  defaultOptions,
  self,
});

export { program };
