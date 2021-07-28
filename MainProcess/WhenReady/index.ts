import { app } from 'electron';

import makeDirs from './makeDirs';

const whenReady = (additionalCbs: (() => void)[]) =>
  app.whenReady().then(() => {
    additionalCbs.forEach((cb) => cb());

    makeDirs();
  });

export default whenReady;
