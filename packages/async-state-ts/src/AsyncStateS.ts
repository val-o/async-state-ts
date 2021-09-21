import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { pipe } from 'fp-ts/function';
import {
  isLoading as _isLoading,
  isSuccess as _isSuccess,
  getOrElse as _getOrElse,
  getOrElseW as _getOrElseW,
  chainW as _chainW,
  match as _match,
  matchI as _matchI,
  map as _map,
  getTag as _getTag,
  combineI as _combineI,
} from './AsyncStateN';
import { Loading, Success, loading as _loading, success as _success } from './base';
import { LOADING_TAG, SUCCESS_TAG } from './constants';

//#region definitions

export type AsyncStateS<A> = Loading | Success<A>;
export type T<A> = AsyncStateS<A>;

//#endregion

//#region constructors

export const loading: <A = never>() => AsyncStateS<A> = _loading;
export const success: <A = never>(a: A) => AsyncStateS<A> = _success;

//#endregion

//#region refinements

export const isSuccess = _isSuccess;
export const isLoading = _isLoading;

//#endregion

export const map: <A, B>(f: (a: A) => B) => <E>(fa: AsyncStateS<A>) => AsyncStateS<B> = _map as any;

type Matchers<A, B> = {
  [LOADING_TAG]: () => B;
  [SUCCESS_TAG]: (result: A) => B;
};

/**
 * Folding AsyncState using functions for each state type.
 * @param state AsyncState
 * @param matcher Matchers
 * @returns Union of values returned by mathcer functions
 */
export const match: <A, B>(matcher: Matchers<A, B>) => (state: AsyncStateS<A>) => B = _match as any;
/**
 * Non-curried version of `match`
 * @param state AsyncState
 * @param matcher Matchers
 * @returns Union of values returned by mathcer functions
 */

export const matchI: <A, B>(state: AsyncStateS<A>, matcher: Matchers<A, B>) => B = _matchI as any;

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category instance operations
 * @since 2.0.0
 */
export const chain: <A, B>(f: (a: A) => AsyncStateS<B>) => (ma: AsyncStateS<A>) => AsyncStateS<B> =
  (f) => (ma) =>
    isSuccess(ma) ? f(ma.value) : ma;

//#region fp-ts interop

export const fromOption = <A>(fa: O.Option<A>): AsyncStateS<A> => {
  return pipe(
    fa,
    O.fold(
      (): AsyncStateS<A> => loading(),
      (a) => success(a)
    )
  );
};

export const toEither = <A, E>(as: AsyncStateS<A>, onLoading: () => E): E.Either<E, A> =>
  isSuccess(as) ? E.right(as.value) : E.left(onLoading());

export const toOption = <A>(as: AsyncStateS<A>): O.Option<A> =>
  isSuccess(as) ? O.some(as.value) : O.none;

//#endregion

//#region interop

/**
 * Takes a default and a nullable value, if the value is not nully, turn it into a `Success`, if the value is nully use `Loading`
 */
export const fromNullable = <A>(a: A): AsyncStateS<NonNullable<A>> =>
  a !== null && a !== undefined ? success(a as NonNullable<A>) : loading();

export const getOrElse = _getOrElse;
export const getOrElseW = _getOrElseW;
//#endregion

export const getTag = _getTag;

export function combineI<A1, A2, B>(
  state: [AsyncStateS<A1>, AsyncStateS<A2>],
  fn: (a: A1, a2: A2) => B
): AsyncStateS<B>;
export function combineI<A1, A2, A3, E3, B>(
  state: [AsyncStateS<A1>, AsyncStateS<A2>, AsyncStateS<A3>],
  fn: (a: A1, a2: A2, a3: A3) => B
): AsyncStateS<B>;
export function combineI<A1, A2, A3, A4, E3, E4, B>(
  state: [AsyncStateS<A1>, AsyncStateS<A2>, AsyncStateS<A3>, AsyncStateS<A4>],
  fn: (a: A1, a2: A2, a3: A3, a4: A4) => B
): AsyncStateS<B>;
export function combineI(
  states: AsyncStateS<any>[],
  fn: (a: object, a2: object, a3?: object, a4?: object) => unknown
): AsyncStateS<unknown> {
  return (_combineI as any)(states, fn);
}
