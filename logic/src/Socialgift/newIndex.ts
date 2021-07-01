import { injectBot } from './bot';
import { socialgift } from './socialgift';
import { socialmoney } from './socialmoney';

export const bots = injectBot((language) => ({
  Socialgift: socialgift(language),
  SocialMoney: socialmoney(language),
}));
