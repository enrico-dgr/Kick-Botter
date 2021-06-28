import * as IOE from 'fp-ts/IOEither';
import { pipe } from 'fp-ts/lib/function';

// ----------------------------
// Variables
// ----------------------------
/**
 *
 */
type Variables = keyof typeof EnumOfVariables;
enum EnumOfVariables {
  "--user",
  "--program",
}

/**
 *
 */
export const variables = (variable: Variables) =>
  pipe(
    process.argv,
    (argv) =>
      argv.indexOf(variable) < 0
        ? IOE.left<string, { argv: string[]; indexOfValue: number }>(
            `Expected variable "${variable}" to be specified.`
          )
        : IOE.right<string, { argv: string[]; indexOfValue: number }>({
            argv: argv,
            indexOfValue: argv.indexOf(variable) + 1,
          }),
    IOE.chain(({ argv, indexOfValue }) =>
      argv.length <= indexOfValue
        ? IOE.left(`No value for "${variable}"`)
        : IOE.right(argv[indexOfValue])
    ),
    IOE.match(
      (e) => {
        throw new Error(e);
      },
      (value) => value
    )
  );
