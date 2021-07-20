import { injectBot, Options } from './botsOfTelegram';
import { socialgift } from './Socialgift/deps';
import { socialmoney } from './Socialmoney/deps';

const bot = injectBot((language) => ({
  Socialgift: socialgift(language),
  SocialMoney: socialmoney(language),
}));
export { bot, Options };
