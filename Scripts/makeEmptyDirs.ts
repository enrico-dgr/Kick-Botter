import * as fs from 'fs';

const makeEmptyDirs = (path: string[]) =>
  path.forEach((dir) => fs.mkdir(dir, { recursive: false }, () => undefined));

export default makeEmptyDirs;
