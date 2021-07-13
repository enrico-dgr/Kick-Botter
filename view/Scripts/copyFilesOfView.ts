import * as fs from 'fs';
import { join, relative, resolve } from 'path';

/**
 * CONSTANTS
 */
const BUILD_PATH: string = `../../KickBotter`;
//
const pathsToCopy: string[] = ["../src/index.html", "../src/logic"];
// --------------------------------
// Script
// --------------------------------
const relativePath = (path: string) =>
  relative(resolve(__dirname, "../.."), resolve(__dirname, path));
//
const buildPath = (relativePath_: string) =>
  resolve(__dirname, BUILD_PATH, relativePath(relativePath_));
/**
 * Copy Dir
 */
const copyDir = (src: string, dest: string) => {
  fs.mkdir(dest, { recursive: true }, () => undefined);
  fs.readdir(src, { withFileTypes: true }, (err, entries) => {
    if (err) throw err;

    entries.forEach((entry) => {
      let srcPath = join(src, entry.name);
      let destPath = join(dest, entry.name);

      entry.isDirectory()
        ? copyDir(srcPath, destPath)
        : fs.copyFileSync(srcPath, destPath);
    });
  });
};
/**
 * Copy Dir Or File
 */
const copy = (src: string, dest: string) =>
  fs.lstatSync(src).isDirectory()
    ? copyDir(src, dest)
    : fs.copyFileSync(src, dest);
/**
 * Execution
 */
pathsToCopy.forEach((path_) => {
  copy(resolve(__dirname, path_), buildPath(path_));
});
