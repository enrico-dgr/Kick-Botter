import { ipcRenderer } from 'electron';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import * as t from 'io-ts';

import { createAsyncThunk } from '@reduxjs/toolkit';

import { Errors } from '../../../TypeGuards';
import * as fpTG from '../../../TypeGuards/fp-ts';

export const invoke = (channel: string, ...args: any[]) => <A extends t.Props>(
  typeA: t.TypeC<A>
) =>
  createAsyncThunk(channel, async (_, _thunkAPI) => {
    const data = await pipe(
      () => ipcRenderer.invoke(channel, ...args),
      T.map((either) =>
        pipe(
          fpTG.Either.Either(Errors.Error, typeA).decode(either),
          E.mapLeft((e) => new Error(JSON.stringify(e)))
        )
      ),
      TE.chain<
        Error,
        E.Either<Error, t.TypeOf<typeof typeA>>,
        t.TypeOf<typeof typeA>
      >(T.of),
      TE.match(
        (e) => {
          throw e;
        },
        (a) => a
      )
    )();
    return data;
  });
