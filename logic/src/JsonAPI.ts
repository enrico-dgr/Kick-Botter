import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as fs from 'fs';
import { Json as J, jsonFiles as JF } from 'launch-page';

// ------------------------------------
// Models
// ------------------------------------
type StoredObject = J.Json;
type StoredObjects = StoredObject[];
/**
 *
 */
type DepsGetJson = {
  absolutePath: string;
};
/**
 *
 */
type DepsSetJson = {
  absolutePath: string;
};
// ------------------------------------
// Methods
// ------------------------------------
/**
 *
 */
export const getJson = ({ absolutePath }: DepsGetJson) =>
  pipe(
    E.of(fs.existsSync(absolutePath)),
    E.map((exists) =>
      exists ? undefined : fs.writeFileSync(absolutePath, "[]")
    ),
    E.chain(() => JF.getFromJsonFile<StoredObjects>(absolutePath)),
    E.chain((d) =>
      Array.isArray(d)
        ? E.right(d)
        : E.left(new Error("DB is an object, should be an array."))
    )
  );
/**
 *
 */
export const setJson = ({ absolutePath }: DepsSetJson) =>
  JF.postToJsonFile<StoredObjects>(absolutePath);
