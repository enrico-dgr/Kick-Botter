import { jsonPC, Programs } from './index';
import { variables } from './variables';

// ----------------------------------
// Node Variables
// ----------------------------------
const name = variables("--program")();
if (name in Programs.map((program) => program.name) === false) {
  throw new Error(
    `${name} is not an available program.\n` +
      `Add as 'npm run start -- --program <name_of_program>'`
  );
}
const user = variables("--user")();
// ----------------------------------
// Run Program
// ----------------------------------
jsonPC(".").launchProgram({
  user,
  name,
});
