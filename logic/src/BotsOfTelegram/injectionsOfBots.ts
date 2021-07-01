import { injectBot, Options } from './botsOfTelegram';
import { socialgift } from './socialgift';
import { socialmoney } from './socialmoney';

const bot = injectBot((language) => ({
  Socialgift: socialgift(language),
  SocialMoney: socialmoney(language),
}));
export { bot, Options };
