import * as t from 'io-ts';
import { WebProgram as WP } from 'launch-page';

import { launchOptions } from '../../LaunchOptions';
import { buildProgram, Models as PModels } from '../../Program';
import buildDeps from './buildDeps';
import postPhotos from './postPhotos';

const NAME = "PostPhotos";

const extraOptionsType = t.type({
  dirPath: t.string,
});

type ExtraOptions = t.TypeOf<typeof extraOptionsType>;

const extraOptions: ExtraOptions = {
  dirPath: "",
};

const defaultOptions: PModels.DefaultOptions = (D) => ({
  extraOptions,
  launchOptions: launchOptions(D),
});

const self = (programDeps: PModels.ProgramDeps) => (
  extraOptions: ExtraOptions
): WP.WebProgram<void> =>
  postPhotos(programDeps.running)(buildDeps(extraOptions.dirPath));

const program = buildProgram({
  name: NAME,
  defaultOptions,
  self,
});

export { program, postPhotos };
