import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { pipe } from 'fp-ts/function';
import { LOADING_TAG, SUCCESS_TAG, ERROR_TAG, NOT_INITIATED_TAG } from './constants';
import {
  Success,
  Error,
  Loading,
  NotInitiated,
  ReadyState,
  error as _error,
  loading as _loading,
  notInitiated as _notInitiated,
  success as _success,
} from './base';

//#region definitions

export { ReadyState, Success, Error, NotInitiated, Loading };

export type AsyncStateN<E, A> = NotInitiated | Loading | ReadyState<E, A>;
export type T<E, A> = AsyncStateN<E, A>;

//#region type helpers

export type InferError<AS extends AsyncStateN<any, any>> = AS extends Error<infer U> ? U : never;

export type InferSuccess<AS extends AsyncStateN<any, any>> = AS extends Success<infer U>
  ? U
  : never;

//#endregion

//#endregion

//#region constructors

export const loading: <E = never, A = never>() => AsyncStateN<E, A> = _loading;
export const notInitiated: <E = never, A = never>() => AsyncStateN<E, A> = _notInitiated;
export const success: <E = never, A = never>(a: A) => AsyncStateN<E, A> = _success;
export const error: <E = never, A = never>(a: E) => AsyncStateN<E, A> = _error;

//#endregion

//#region refinements

export const isSuccess = <E, A>(as: AsyncStateN<E, A>): as is Success<A> => as.type === 'Success';
export const isError = <E, A>(as: AsyncStateN<E, A>): as is Error<E> => as.type === 'Error';
export const isLoading = <E, A>(as: AsyncStateN<E, A>): as is Loading => as.type === 'Loading';
export const isNotInitiated = <E, A>(as: AsyncStateN<E, A>): as is NotInitiated =>
  as.type === 'NotInitiated';
export const isReady = <E, A>(as: AsyncStateN<E, A>): as is ReadyState<E, A> =>
  isSuccess(as) || isError(as);

//#endregion

export const map: <A, B>(f: (a: A) => B) => <E>(fa: AsyncStateN<E, A>) => AsyncStateN<E, B> =
  (f) => (fa) =>
    isSuccess(fa) ? success(f(fa.value)) : fa;

type Matchers<E, A, B> = {
  [LOADING_TAG]: () => B;
  [SUCCESS_TAG]: (result: A) => B;
  [ERROR_TAG]: (error: E) => B;
  [NOT_INITIATED_TAG]: () => B;
};

/**
 * Folding AsyncState using functions for each state type.
 * @param state AsyncState
 * @param matcher Matchers
 * @returns Union of values returned by mathcer functions
 */
export const match: <E, A, B>(matcher: Matchers<E, A, B>) => (state: AsyncStateN<E, A>) => B =
  (matcher) => (state) => {
    return matchI(state, matcher);
  };

/**
 * Non-curried version of `match`
 * @param state AsyncState
 * @param matcher Matchers
 * @returns Union of values returned by mathcer functions
 */

export const matchI = <E, A, B>(state: AsyncStateN<E, A>, matcher: Matchers<E, A, B>): B => {
  switch (state.type) {
    case ERROR_TAG:
      return matcher[ERROR_TAG](state.error);
    case LOADING_TAG:
      return matcher[LOADING_TAG]();
    case SUCCESS_TAG:
      return matcher[SUCCESS_TAG](state.value);
    case NOT_INITIATED_TAG:
      return matcher[NOT_INITIATED_TAG]();
  }
};

/**
 * Less strict version of [`chain`](#chain).
 *
 * @category instance operations
 * @since 2.6.0
 */
export const chainW =
  <E2, A, B>(f: (a: A) => AsyncStateN<E2, B>) =>
  <E1>(ma: AsyncStateN<E1, A>): AsyncStateN<E1 | E2, B> =>
    isSuccess(ma) ? f(ma.value) : ma;

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category instance operations
 * @since 2.0.0
 */
export const chain: <E, A, B>(
  f: (a: A) => AsyncStateN<E, B>
) => (ma: AsyncStateN<E, A>) => AsyncStateN<E, B> = chainW;

/**
 * Map a function over the first type argument of a bifunctor.
 *
 * @category instance operations
 */
export const mapLeft: <E, E1>(f: (e: E) => E1) => <A>(fa: AsyncStateN<E, A>) => AsyncStateN<E1, A> =
  (f) => (fa) => isError(fa) ? error(f(fa.error)) : fa;

//#region fp-ts interop

export const fromEither = <E, A>(either: E.Either<E, A>): AsyncStateN<E, A> => {
  return pipe(
    either,
    E.fold((e): AsyncStateN<E, A> => error(e), success)
  );
};

export const toEither = <E, A>(as: ReadyState<E, A>): E.Either<E, A> =>
  as.type === 'Success' ? E.right(as.value) : E.left(as.error);

//#endregion

//#region js interop

/**
 * Takes a default and a nullable value, if the value is not nully, turn it into a `Success`, if the value is nully use
 * the provided default as a `Error`.
 */
export const fromNullable =
  <E>(e: E) =>
  <A>(a: A): AsyncStateN<E, NonNullable<A>> =>
    a === null || a === undefined ? error(e) : success(a as NonNullable<A>);

/**
 * Version of `fromNullable` with `NonInitialized` state.
 */
export const fromNullableN: <E>(e: E) => <A>(a: A) => AsyncStateN<E, NonNullable<A>> = fromNullable;

export const getOrElse: <A>(onOther: () => A) => <E>(as: AsyncStateN<E, A>) => A =
  (onOther) => (as) =>
    isSuccess(as) ? as.value : onOther();

export const getOrElseW: <B>(onOther: () => B) => <E, A>(as: AsyncStateN<E, A>) => A | B =
  (onOther) => (as) =>
    isSuccess(as) ? as.value : onOther();

//#endregion

export const getTag = (state: AsyncStateN<unknown, unknown>) => state.type;

export function combineI<A1, A2, E1, E2, B>(
  state: [AsyncStateN<E1, A1>, AsyncStateN<E2, A2>],
  fn: (a: A1, a2: A2) => B
): AsyncStateN<E1 | E2, B>;
export function combineI<A1, A2, A3, E1, E2, E3, B>(
  state: [AsyncStateN<E1, A1>, AsyncStateN<E2, A2>, AsyncStateN<E3, A3>],
  fn: (a: A1, a2: A2, a3: A3) => B
): AsyncStateN<E1 | E2 | E3, B>;
export function combineI<A1, A2, A3, A4, E1, E2, E3, E4, B>(
  state: [AsyncStateN<E1, A1>, AsyncStateN<E2, A2>, AsyncStateN<E3, A3>, AsyncStateN<E4, A4>],
  fn: (a: A1, a2: A2, a3: A3, a4: A4) => B
): AsyncStateN<E1 | E2 | E3 | E4, B>;
export function combineI(
  states: AsyncStateN<any, any>[],
  fn: (a: object, a2: object, a3?: object, a4?: object) => unknown
): AsyncStateN<unknown, unknown> {
  const error = pipe(states, RA.findFirst(isError));
  if (O.isSome(error)) {
    return error.value;
  }

  const loading = pipe(states, RA.findFirst(isLoading));
  if (O.isSome(loading)) {
    return loading.value;
  }

  const notInitiated = pipe(states, RA.findFirst(isNotInitiated));
  if (O.isSome(notInitiated)) {
    return notInitiated.value;
  }

  const values: any = pipe(
    states,
    RA.map((s) => s.value)
  );
  return success(fn.apply(undefined, values));
}
