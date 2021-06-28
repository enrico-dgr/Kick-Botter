import { Executable, execute, NamesOfPrograms } from './Executable';
import { openBrowserExec, socialgiftExec } from './executables';
import { variables } from './variables';

// ----------------------------------
// Programs
// ----------------------------------
export const programs: {
  [k in NamesOfPrograms]: (a: any) => Executable<any, any>;
} = {
  Socialgift: socialgiftExec,
  OpenBrowser: openBrowserExec,
};
// ----------------------------------
// Node Variables
// ----------------------------------
const nameOfProgram = variables("--program")() as NamesOfPrograms;
if (nameOfProgram in programs === false) {
  throw new Error(
    `${nameOfProgram} is not an available program.\n` +
      `Add as 'npm run start -- --program <name_of_program>'`
  );
}
const user = variables("--user")();
// ----------------------------------
// Run Program
// ----------------------------------
execute(programs[nameOfProgram](user))();
