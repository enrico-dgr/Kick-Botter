import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import * as t from 'io-ts';

import * as JsonAPI from './JsonAPI';
import * as ProgramController from './ProgramController';

// ------------------------------------
// Constants
// ------------------------------------
const DB_PATH = './programsState.json';
// ------------------------------------
// Utils
// ------------------------------------
namespace Utils {
  export namespace Array {export const predicateOnUserAndProgramName = ({
    name,
    user,
  }: ProgramController.ProgramQueries) => (
    program: ProgramController.ProgramModel<any, any>
  ) => program.name === name && program.user === user;}

}
// ------------------------------------
// Deps
// ------------------------------------
/**
 * Find corresponding program in an array of programs
 */
const getProgram: ProgramController.GetProgram = (
  programQueries
) =>
  pipe(
    JsonAPI.getJson({absolutePath: DB_PATH}),
    E.map(A.findFirst(Utils.Array.predicateOnUserAndProgramName(programQueries))),
    E.chain(O.map(ProgramController.ProgramQueries.decode)),
    _ => TE.fromEither<Error, O.Option<>>(_)
  );
/**
 * Set program in an array of programs
 */
const setProgram: ProgramController.GetProgram = (
  programQueries
) =>
  pipe(
    getProgram(programQueries),
    O.match(
        () => progr
    )
  );
/**
 * 
 */
const getOptions: ProgramController.GetOptions = (programQueries)  => 

// ------------------------------------
// Implementation
// ------------------------------------
export const jsonProgramController = ProgramController.buildController({
  getProgram,
  setProgram,
  getOptions,
  setOptions,
});
