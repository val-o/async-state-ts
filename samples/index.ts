import * as AsyncState from '../src';
import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/Either';

const either: E.Either<string, number> = E.right(1);

const b = pipe(either, AsyncState.fromEither);
const c = pipe(
  b,
  AsyncState.map(s => 3 + ''),
  AsyncState.match({
    Error: () => 3,
    Loading: () => 3,
    Success: s => 3,
  })
);
const d = pipe(b, AsyncState.toEither);
