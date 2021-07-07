import { execute, NamesOfPrograms } from './Executable';
import { programs } from './index';
import { variables } from './variables';

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
