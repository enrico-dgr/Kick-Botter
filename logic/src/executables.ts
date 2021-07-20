import { WebProgram as WP } from 'launch-page/lib/index';

import { Deps, jsonExecutable, launchOptions } from './Executable';
import { freeFollowerPlan as freeFollowerPlan_ } from './MrInsta/index';

// ----------------------------------
// Mr Insta
// ----------------------------------
const freeFollowerPlanMI = (): WP.WebProgram<void> =>
  freeFollowerPlan_("MrInsta");
const freeFollowerPlanTM = (): WP.WebProgram<void> =>
  freeFollowerPlan_("TurboMedia");

const defaultDepsFFPMI: Deps<null> = {
  nameOfProgram: "FreeFollowerPlanMrInsta",
  user: null,
  programOptions: null,
  launchOptions: {
    ...launchOptions.default,
    headless: true,
  },
};
const defaultDepsFFPTM: Deps<null> = {
  nameOfProgram: "FreeFollowerPlanTurboMedia",
  user: null,
  programOptions: null,
  launchOptions: {
    ...launchOptions.default,
    headless: true,
  },
};

export const freeFollowerPlanMIExec = (user: string | null) =>
  jsonExecutable<null, void>(
    "FreeFollowerPlanMrInsta",
    user,
    freeFollowerPlanMI
  )(defaultDepsFFPMI);
export const freeFollowerPlanTMExec = (user: string | null) =>
  jsonExecutable<null, void>(
    "FreeFollowerPlanTurboMedia",
    user,
    freeFollowerPlanTM
  )(defaultDepsFFPTM);
