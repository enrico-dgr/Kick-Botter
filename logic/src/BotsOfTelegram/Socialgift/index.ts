import * as t from 'io-ts';
import { WebProgram as WP } from 'launch-page';

import { launchOptions } from '../../LaunchOptions';
import { buildProgram, Models as PModels } from '../../Program';
import { bot, TypeGuards } from '../botsOfTelegram';
import { socialgift } from './deps';
import { Options } from './typeguards';

const NAME = "Socialgift";

const extraOptionsType = t.intersection([
  TypeGuards.Input,
  t.type({
    options: Options,
  }),
]);
type ExtraOptions = t.TypeOf<typeof extraOptionsType>;

const self = (programDeps: PModels.ProgramDeps) => (
  extraOptions: ExtraOptions
): WP.WebProgram<any> =>
  bot(socialgift)({
    programDeps,
    options: extraOptions.options,
    loggers: {
      Confirm: [],
      Skip: [],
      End: [],
      Default: [],
    },
    nameOfBot: NAME,
    language: "it",
  });

const defaultOptions: PModels.ProgramOptions = {
  extraOptions: {
    options: {
      skip: {
        Follow: false,
        Like: false,
        Comment: true,
        Story: false,
      },
      delayBetweenCycles: 3 * 60 * 1000,
    },
  },
  launchOptions: launchOptions({}),
};

export const program = buildProgram({
  name: NAME,
  defaultOptions,
  self,
});
