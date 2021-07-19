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

  export type Json = string | number | boolean | JsonArray | JsonRecord | null;

  interface JsonArray extends ReadonlyArray<Json> {}

  interface JsonRecord {
    readonly [key: string]: Json;
  }

  export const Json: t.Type<Json> = t.recursion("Json", () =>
    t.union([t.string, t.number, t.boolean, JsonArray, JsonRecord, t.null])
  );

  const JsonArray: t.Type<JsonArray> = t.recursion("JsonArray", () =>
    t.readonlyArray(Json)
  );
  const JsonRecord: t.Type<JsonRecord> = t.recursion("JsonRecord", () =>
    t.readonly(t.record(t.string, Json))
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
