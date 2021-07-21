import { WebProgram as WP } from 'launch-page';

import { launchOptions } from '../../LaunchOptions';
import { buildProgram, Models as PModels } from '../../Program';
import { freeFollowerPlan } from '../bot';

const NAME = "MrInstaFreeFollowerPlan";

const self = (_D: PModels.ProgramDeps) => (): WP.WebProgram<void> =>
  freeFollowerPlan("MrInsta");

const defaultOptions: PModels.DefaultOptions = (D) => ({
  extraOptions: {},
  launchOptions: launchOptions(D),
});

const program = buildProgram({
  name: NAME,
  defaultOptions,
  self,
});

export default program;
