import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { pipe } from 'fp-ts/function';
import {
  isError as _isError,
  isLoading as _isLoading,
  isSuccess as _isSuccess,
  isReady as _isReady,
  getOrElse as _getOrElse,
  getOrElseW as _getOrElseW,
  chainW as _chainW,
  match as _match,
  matchI as _matchI,
  map as _map,
  getTag as _getTag,
  combineI as _combineI,
} from './AsyncStateN';
import {
  Error,
  Loading,
  Success,
  NotInitiated,
  ReadyState,
  error as _error,
  loading as _loading,
  success as _success,
  notInitiated as _notInitiated,
} from './base';
import { ERROR_TAG, LOADING_TAG, SUCCESS_TAG } from './constants';

//#region definitions

export type AsyncState<E, A> = Loading | ReadyState<E, A>;
export type T<E, A> = AsyncState<E, A>;

//#endregion

//#region constructors

export const loading: <E = never, A = never>() => AsyncState<E, A> = _loading;
export const success: <E = never, A = never>(a: A) => AsyncState<E, A> = _success;
export const error: <E = never, A = never>(e: E) => AsyncState<E, A> = _error;

//#endregion

//#region refinements

export const isSuccess = _isSuccess;
export const isError = _isError;
export const isLoading = _isLoading;
export const isReady = _isReady;

//#endregion

export const map: <A, B>(f: (a: A) => B) => <E>(fa: AsyncState<E, A>) => AsyncState<E, B> =
  _map as any;

type Matchers<E, A, B> = {
  [LOADING_TAG]: () => B;
  [SUCCESS_TAG]: (result: A) => B;
  [ERROR_TAG]: (error: E) => B;
};

/**
 * Folding AsyncState using functions for each state type.
 * @param state AsyncState
 * @param matcher Matchers
 * @returns Union of values returned by mathcer functions
 */
export const match: <E, A, B>(matcher: Matchers<E, A, B>) => (state: AsyncState<E, A>) => B =
  _match as any;
/**
 * Non-curried version of `match`
 * @param state AsyncState
 * @param matcher Matchers
 * @returns Union of values returned by mathcer functions
 */

export const matchI: <E, A, B>(state: AsyncState<E, A>, matcher: Matchers<E, A, B>) => B =
  _matchI as any;
/**
 * Less strict version of [`chain`](#chain).
 *
 * @category instance operations
 * @since 2.6.0
 */
export const chainW: <E2, A, B>(
  f: (a: A) => AsyncState<E2, B>
) => <E1>(ma: AsyncState<E1, A>) => AsyncState<E1 | E2, B> = _chainW as any;

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category instance operations
 * @since 2.0.0
 */
export const chain: <E, A, B>(
  f: (a: A) => AsyncState<E, B>
) => (ma: AsyncState<E, A>) => AsyncState<E, B> = chainW;

/**
 * Map a function over the first type argument of a bifunctor.
 *
 * @category instance operations
 */
export const mapLeft: <E, E1>(f: (e: E) => E1) => <A>(fa: AsyncState<E, A>) => AsyncState<E1, A> =
  (f) => (fa) =>
    isError(fa) ? error(f(fa.error)) : fa;

//#region fp-ts interop

export const fromEither = <E, A>(either: E.Either<E, A>): AsyncState<E, A> => {
  return pipe(
    either,
    E.fold(
      (e): AsyncState<E, A> => error(e),
      (a) => success(a)
    )
  );
};

export const toEither = <E, A, L>(as: AsyncState<E, A>, onLoading: () => L): E.Either<E | L, A> =>
  isSuccess(as) ? E.right(as.value) : E.left(isLoading(as) ? onLoading() : as.error);

//#endregion

//#region interop

/**
 * Takes a default and a nullable value, if the value is not nully, turn it into a `Success`, if the value is nully use
 * the provided default as a `Error`.
 */
export const fromNullable =
  <E>(e: E) =>
  <A>(a: A): AsyncState<E, NonNullable<A>> =>
    a === null || a === undefined ? error(e) : success(a as NonNullable<A>);

export const getOrElse = _getOrElse;
export const getOrElseW = _getOrElseW;

//#endregion

export const getTag = _getTag;

export function combineI<A1, A2, E1, E2, B>(
  state: [AsyncState<E1, A1>, AsyncState<E2, A2>],
  fn: (a: A1, a2: A2) => B
): AsyncState<E1 | E2, B>;
export function combineI<A1, A2, A3, E1, E2, E3, B>(
  state: [AsyncState<E1, A1>, AsyncState<E2, A2>, AsyncState<E3, A3>],
  fn: (a: A1, a2: A2, a3: A3) => B
): AsyncState<E1 | E2 | E3, B>;
export function combineI<A1, A2, A3, A4, E1, E2, E3, E4, B>(
  state: [AsyncState<E1, A1>, AsyncState<E2, A2>, AsyncState<E3, A3>, AsyncState<E4, A4>],
  fn: (a: A1, a2: A2, a3: A3, a4: A4) => B
): AsyncState<E1 | E2 | E3 | E4, B>;
export function combineI(
  states: AsyncState<any, any>[],
  fn: (a: object, a2: object, a3?: object, a4?: object) => unknown
): AsyncState<unknown, unknown> {
  return (_combineI as any)(states, fn);
}
