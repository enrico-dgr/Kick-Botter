import * as fs from 'fs';
import { relative, resolve } from 'path';

/**
 * ENV
 */
function isNotPackaging() {
  return process.env.NODE_ENV !== "packaging";
}

/**
 * CONSTANTS
 */
const BUILD_PATH: () => string = () =>
  `../${isNotPackaging() ? "build" : "KickBotter"}`;
//
const pathsToCopy: string[] = ["../src/index.html"];
/**
 * Script
 */
const relativePath = (path: string) =>
  relative(resolve(__dirname, "../.."), resolve(__dirname, path));
//
const buildPath = (relativePath_: string) =>
  resolve(__dirname, BUILD_PATH(), relativePath(relativePath_));
//
pathsToCopy.forEach((path_) => {
  fs.copyFileSync(resolve(__dirname, path_), buildPath(path_));
});
