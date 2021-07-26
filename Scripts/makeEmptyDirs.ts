import * as fs from 'fs';
import path from 'path';

const makeEmptyDirs = (relativePaths: string[]) => {
  const KICKBOTTER = path.resolve(__dirname, "../KickBotter");
  fs.mkdirSync(KICKBOTTER, { recursive: false });
  return relativePaths.forEach((dir) =>
    fs.mkdirSync(path.resolve(__dirname, dir), { recursive: false })
  );
};

export default makeEmptyDirs;
