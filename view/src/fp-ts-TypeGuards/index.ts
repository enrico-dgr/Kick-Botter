import * as E from 'fp-ts/Either';
import * as t from 'io-ts';

const test = t.type({
  testing: t.string,
});
type Test = t.TypeOf<typeof test>;

export namespace Either {
  export const Left = <E extends t.Props>(E: t.TypeC<E>) =>
    t.readonly(
      t.type({
        _tag: t.literal("Left"),
        left: E,
      })
    );

  export const Right = <A extends t.Props>(A: t.TypeC<A>) =>
    t.readonly(
      t.type({
        _tag: t.literal("Right"),
        right: A,
      })
    );
  export const Either = <E extends t.Props, A extends t.Props>(
    E: t.TypeC<E>,
    A: t.TypeC<A>
  ) => t.union([Left(E), Right(A)]);

  namespace Test {
    const left = Left(test);
    export type Left = Extract<t.TypeOf<typeof left>, E.Left<Test>>;

    const right = Right(test);
    export type Right = Extract<t.TypeOf<typeof right>, E.Right<Test>>;

    const either = Either(test, test);
    export type Either = Extract<t.TypeOf<typeof either>, E.Either<Test, Test>>;
  }
  Test;
}
