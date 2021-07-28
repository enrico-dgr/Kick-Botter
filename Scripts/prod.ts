import copyFiles from './copyFiles';
import rimrafShellPaths from './rimrafShellPaths';

namespace CONSTANTS {
  export const pathsToCopy: string[] = ["../index.html", "../package.json"];
}

/**
 * Note: scripts order is important.
 */
rimrafShellPaths("./KickBotter/*");
copyFiles(CONSTANTS.pathsToCopy);
