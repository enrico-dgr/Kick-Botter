import * as Executable from './Executable';
import {
    freeFollowerPlanMIExec, freeFollowerPlanTMExec, openBrowserExec, socialgiftExec, socialmoneyExec
} from './executables';
import { jsonProgramController } from './jsonProgramController';
import * as OB from './OpenBrowser';

// ----------------------------------
// Make Visible
// ----------------------------------
export { Executable };
// ----------------------------------
// Programs
// ----------------------------------
export const programs: {
  [k in Executable.NamesOfPrograms]: (
    a: any
  ) => Executable.Executable<any, any>;
} = {
  Socialgift: socialgiftExec,
  SocialMoney: socialmoneyExec,
  OpenBrowser: openBrowserExec,
  FreeFollowerPlanMrInsta: freeFollowerPlanMIExec,
  FreeFollowerPlanTurboMedia: freeFollowerPlanTMExec,
};

// ----------------------------------
// Run Program
// ----------------------------------
export const runProgram = (
  nameOfProgram: Executable.NamesOfPrograms,
  user: string
) => Executable.execute(programs[nameOfProgram](user))();
//
export const Programs = [OB.program];
export const jsonPC = jsonProgramController(Programs);
export * as ProgramController from "./ProgramController";
export * as JsonProgramController from "./jsonProgramController";
