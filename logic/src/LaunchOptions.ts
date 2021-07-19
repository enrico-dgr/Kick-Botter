import * as t from 'io-ts';
import { Puppeteer as P } from 'launch-page';
import path from 'path';

export namespace Models {
  export interface Deps {
    /**
     * default to `generic`
     */
    user?: string;
  }

  export const LaunchOptions = t.partial({
    headless: t.boolean,
    userDataDir: t.string,
    args: t.array(t.string),
    defaultViewport: t.type({
      width: t.number,
      height: t.number,
    }),
  });

  type RunTimeLO = t.TypeOf<typeof LaunchOptions>;

  export type LaunchOptions = Pick<P.LaunchOptions, keyof RunTimeLO>;
}
namespace Builders {
  export const userDataDir = (user?: string) =>
    path.resolve(__dirname, `../userDataDirs/${user ?? "generic"}`);
}

export const launchOptions = (D: Models.Deps): P.LaunchOptions => ({
  headless: false,
  userDataDir: Builders.userDataDir(D.user),
  args: [
    "--lang=it",
    "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4403.0 Safari/537.36",
  ],
  defaultViewport: { width: 1050, height: 800 },
});
