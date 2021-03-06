import { closeProgram } from './closeProgram';
import { getPrograms } from './getPrograms';
import { getSettings } from './getSettings';
import { getUsers } from './getUsers';
import { openLocal } from './openLocal';
import { postSettings } from './postSettings';
import { runProgram } from './runProgram';

export default [
  getUsers,
  getPrograms,
  runProgram,
  getSettings,
  postSettings,
  closeProgram,
  openLocal,
];
