import { app } from 'electron';
import fs from 'fs';
import path from 'path';

const PATHS = [path.join(app.getPath("userData"), "Programs")];

const makeDirs = () =>
  PATHS.forEach((path) => fs.mkdirSync(path, { recursive: true }));
export default makeDirs;
