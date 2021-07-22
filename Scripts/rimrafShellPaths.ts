import glob from 'glob';
import rimraf from 'rimraf';

const rimrafShellPaths = (shellPath: string) =>
  glob.sync(shellPath).forEach((file) => rimraf.sync(file));

export default rimrafShellPaths;
