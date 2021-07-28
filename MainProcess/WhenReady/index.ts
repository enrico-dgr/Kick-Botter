import { app } from 'electron';

const whenReady = (additionalCbs: (() => void)[]) =>
  app.whenReady().then(() => {
    additionalCbs.forEach((cb) => cb());
  });

export default whenReady;
