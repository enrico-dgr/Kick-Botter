import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as fs from 'fs';
import * as t from 'io-ts';
import { Json as J, jsonFiles as JF } from 'launch-page';

export namespace Models {
  export type DepsGetJson = {
    absolutePath: string;
  };
  export type DepsSetJson = {
    absolutePath: string;
  };

  type Json = J.Json;

  export const Json: t.Type<Json> = t.recursion("Json", () =>
    t.union([
      t.string,
      t.number,
      t.boolean,
      t.readonly(Json),
      t.readonly(t.record(t.string, Json)),
      t.null,
    ])
  );
}
// ------------------------------------
// Methods
// ------------------------------------
/**
 *
 */
export const getJson = ({ absolutePath }: Models.DepsGetJson) =>
  pipe(
    E.of(fs.existsSync(absolutePath)),
    E.map((exists) =>
      exists ? undefined : fs.writeFileSync(absolutePath, "[]")
    ),
    E.chain(() => JF.getFromJsonFile<J.Json[]>(absolutePath)),
    E.chain((d) =>
      Array.isArray(d)
        ? E.right(d)
        : E.left(new Error("DB is an object, should be an array."))
    )
  );
/**
 *
 */
export const setJson = ({ absolutePath }: Models.DepsSetJson) =>
  JF.postToJsonFile<J.Json[]>(absolutePath);
