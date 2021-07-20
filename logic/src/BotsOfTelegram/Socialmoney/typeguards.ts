import * as t from 'io-ts';

export const Options = t.type({
  delayBetweenCycles: t.number,
  skip: t.record(
    t.keyof({
      Follow: null,
      Like: null,
      Comment: null,
      SpecificComment: null,
      Story: null,
    }),
    t.boolean
  ),
});
