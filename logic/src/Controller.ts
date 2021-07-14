import * as A from 'fp-ts/Arr';
import * as TE from 'fp-ts/TaskEither';
import { Puppeteer as P, utils as LP_utils, WebDeps as WD, WebProgram as WP } from 'launch-page';

import { getProgram, Program } from './Program';

// ------------------------------------
// Models
// ------------------------------------
/**
 *
 */
export interface Options<ProgramOptions> {
  programOptions: ProgramOptions;
  launchOptions: P.LaunchOptions;
}
/**
 * 
 */
export interface Controller {
  launchProgram: <A>(user: string, program:string) => TE.TaskEither<Error,A>,
  endProgram: (user: string, nameOfProgram:string) => TE.TaskEither<Error,void>,
  getOptions: (user: string, nameOfProgram:string) => <ProgramOptions>(options:Options<ProgramOptions>) => TE.TaskEither<Error,void>
  setOptions: (user: string, nameOfProgram:string) => <ProgramOptions>(options:Options<ProgramOptions>) => TE.TaskEither<Error,void>
}
// ------------------------------------
// Constructors
// ------------------------------------
/**
 * 
 */
const getLaunchProgram = (programs:Program<any,any>[]) => 
  (user: string, nameOfProgram:string)=>
  pipe()
/**
 *
 */
export const getController = (programs:Program<any,any>[]) => 