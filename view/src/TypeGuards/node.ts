import * as t from 'io-ts';

export namespace Errors {
  export const Error = t.type({
    name: t.string,
    message: t.string,
    stack: t.union([t.string, t.undefined]),
  });
}

export namespace Test {
  export type ErrorTest = Extract<t.TypeOf<typeof Errors.Error>, Error>;
}
