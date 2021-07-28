import { app } from 'electron';
import * as t from 'io-ts';

export namespace GetPath {
  type Params = Parameters<typeof app.getPath>;

  const names: Record<Params[0], null> = {
    home: null,
    appData: null,
    userData: null,
    cache: null,
    temp: null,
    exe: null,
    module: null,
    desktop: null,
    documents: null,
    downloads: null,
    music: null,
    pictures: null,
    videos: null,
    recent: null,
    logs: null,
    crashDumps: null,
  };
  export const paramsType = t.type({ name: t.keyof(names) });
  export type ParamsType = t.TypeOf<typeof paramsType>;
  export const resultType = t.type({ path: t.string });
  export type ResultType = t.TypeOf<typeof resultType>;
}
