import path from 'path';

import copyFiles from './copyFiles';
import init from './init';
import rimrafShellPaths from './rimrafShellPaths';

namespace CONSTANTS {
  export const pathsToCopy: string[] = [
    "../index.html",
    "../package.json",
    "../forge.config.js",
    "../assets",
  ];
}

/**
 * Note: scripts order is important.
 */
init();

rimrafShellPaths("./KickBotter/!(node_modules)");

copyFiles(CONSTANTS.pathsToCopy.map((ptc) => path.resolve(__dirname, ptc)));
