import BTPrograms from './BotsOfTelegram';
import { jsonProgramController } from './jsonProgramController';
import MITMPrograms from './MrInsta_TurboMedia';
import OBProgram from './OpenBrowser';

export const Programs = [OBProgram, ...BTPrograms, ...MITMPrograms];
export const jsonPC = jsonProgramController(Programs);
export * as ProgramController from "./ProgramController";
export * as JsonProgramController from "./jsonProgramController";
