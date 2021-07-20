import BTPrograms from './BotsOfTelegram';
import { jsonProgramController } from './jsonProgramController';
import OBProgram from './OpenBrowser';

export const Programs = [OBProgram, ...BTPrograms];
export const jsonPC = jsonProgramController(Programs);
export * as ProgramController from "./ProgramController";
export * as JsonProgramController from "./jsonProgramController";
