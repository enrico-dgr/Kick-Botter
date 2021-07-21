import * as fs from 'fs';

const dirs: string[] = ["./KickBotter/Programs/local"];

dirs.forEach((dir) => fs.mkdir(dir, { recursive: false }, () => undefined));
