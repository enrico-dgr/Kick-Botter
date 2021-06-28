import { HTMLElementProperties } from 'src/ElementHandle';

import { TypeOfActions } from './index';

export interface Settings {
  chatUrl: URL;
  message: {
    elements: {
      link: { relativeXPath: string };
      buttonConfirm: { relativeXPath: string };
      buttonSkip: { relativeXPath: string };
    };
    expectedTextsForActions: {
      [k in TypeOfActions]: HTMLElementProperties<HTMLElement, string>;
    };
  };
  dialog: {
    elements: {
      buttonNewAction: {
        text: string;
      };
    };
  };
}
