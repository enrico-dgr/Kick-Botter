import copyFiles from './copyFiles';
import makeEmptyDirs from './makeEmptyDirs';
import rimrafShellPaths from './rimrafShellPaths';

namespace CONSTANTS {
  export const pathsToCopy: string[] = ["../index.html", "../package.json"];
  export const emptyDirs: string[] = [
    "./KickBotter/Programs",
    "./KickBotter/Programs/local",
  ];
}

/**
 * Note: scripts order is important.
 */
rimrafShellPaths("./KickBotter/*");
makeEmptyDirs(CONSTANTS.emptyDirs);
copyFiles(CONSTANTS.pathsToCopy);
