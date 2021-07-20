import { WebProgram as WP } from 'launch-page';

import { launchOptions } from '../../LaunchOptions';
import { buildProgram, Models as PModels } from '../../Program';
import { freeFollowerPlan } from '../bot';

const NAME = "TurboMediaFreeFollowerPlan";

const self = (_D: PModels.ProgramDeps) => (): WP.WebProgram<void> =>
  freeFollowerPlan("TurboMedia");

const defaultOptions: PModels.ProgramOptions = {
  extraOptions: {},
  launchOptions: launchOptions({}),
};

const program = buildProgram({
  name: NAME,
  defaultOptions,
  self,
});

export default program;
