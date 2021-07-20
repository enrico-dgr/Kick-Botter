import { jsonProgramController } from './jsonProgramController';
import * as OB from './OpenBrowser';

export const Programs = [OB.program];
export const jsonPC = jsonProgramController(Programs);
export * as ProgramController from "./ProgramController";
export * as JsonProgramController from "./jsonProgramController";
