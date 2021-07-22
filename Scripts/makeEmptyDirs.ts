import * as fs from 'fs';

const makeEmptyDirs = (path: string[]) =>
  path.forEach((dir) => fs.mkdirSync(dir, { recursive: false }));

export default makeEmptyDirs;
