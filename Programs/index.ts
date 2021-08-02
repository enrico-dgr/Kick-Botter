import BTPrograms from './BotsOfTelegram';
import IGPrograms from './Instagram';
import { jsonProgramController } from './jsonProgramController';
import MITMPrograms from './MrInsta_TurboMedia';
import OBProgram from './OpenBrowser';

export const Programs = [
  OBProgram,
  ...BTPrograms,
  ...MITMPrograms,
  ...IGPrograms,
];

export const jsonPC = jsonProgramController(Programs);
export * as ProgramController from "./ProgramController";
export * as JsonProgramController from "./jsonProgramController";
