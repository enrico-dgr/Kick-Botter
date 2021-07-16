import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/lib/function';

import * as Program from './Program';
import * as ProgramController from './ProgramController';

// ------------------------------------
// Programs
// ------------------------------------
let programs: ProgramController.ProgramModel<any, any>[];
// ------------------------------------
// Utils
// ------------------------------------
namespace Utils {
  export const predicateOnUserAndProgramName = ({
    name,
    user,
  }: ProgramController.ProgramQueries) => (
    program: ProgramController.ProgramModel<any, any>
  ) => program.name === name && program.user === user;
}
// ------------------------------------
// Deps
// ------------------------------------
const getProgram: ProgramController.GetProgram = (
  programQueries: ProgramController.ProgramQueries
) =>
  pipe(
    programs,
    A.findFirst(Utils.predicateOnUserAndProgramName(programQueries))
  );
// ------------------------------------
// Implementation
// ------------------------------------
export const jsonProgramController = ProgramController.buildController({
  getProgram,
  getOptions,
  setOptions,
});
