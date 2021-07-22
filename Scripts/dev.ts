import copyFiles from './copyFiles';
import makeEmptyDirs from './makeEmptyDirs';

namespace CONSTANTS {
  export const pathsToCopy: string[] = ["../index.html"];
  export const emptyDirs: string[] = [
    "./KickBotter",
    "./KickBotter/Programs",
    "./KickBotter/Programs/local",
  ];
}

/**
 * Note: scripts order is important.
 */
makeEmptyDirs(CONSTANTS.emptyDirs);
copyFiles(CONSTANTS.pathsToCopy);
