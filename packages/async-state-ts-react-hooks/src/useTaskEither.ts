import { useEffect, useRef, useState } from 'react';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import * as T from 'fp-ts/Task';
import * as E from 'fp-ts/Either';
import * as AsyncState from 'async-state-ts/dist/es6/AsyncState';
import * as AsyncStateN from 'async-state-ts/dist/es6/AsyncStateN';

const noop = () => {};

type ResetFn = () => void;
type UseTaskEitherResult<TParams extends any[], E, A> = [
  state: AsyncStateN.T<E, A>,
  execute: (...args: TParams) => Promise<E.Either<E, A>>,
  retry: () => void,
  reset: ResetFn
];

/**
 * Converts function which return TaskEither to AsyncState
 * @returns [State, ExecuteFunction, RetryFunction, ResetFunction]
 */
export const useTaskEither = <TParams extends any[], E, A>(
  func: (...args: TParams) => TE.TaskEither<E, A>,
  initialState?: AsyncStateN.T<E, A>
): UseTaskEitherResult<TParams, E, A> => {
  const [state, setState] = useState<AsyncStateN.T<E, A>>(
    initialState ?? AsyncStateN.notInitiated()
  );
  const lastArgsRef = useRef<TParams | undefined>(undefined);
  const execute = useRef((...args: TParams) => {
    setState(AsyncStateN.loading);
    lastArgsRef.current = args;
    return pipe(
      func(...args),
      T.chain((res) => {
        setState(AsyncStateN.fromEither(res));
        return T.of(res);
      })
    )();
  }).current;

  const retry = useRef(() =>
    lastArgsRef.current ? execute(...lastArgsRef.current) : noop
  ).current;

  const reset = useRef(() => setState(AsyncStateN.notInitiated())).current;

  return [state, execute, retry, reset];
};

type UseTaskEitherImmediateResult<E, A> = [state: AsyncState.AsyncState<E, A>, retry: () => void];

/**
 *
 * @param func
 * @returns [State, RetryFunction]
 */
export const useTaskEitherImmediate = <E, A>(
  func: () => TE.TaskEither<E, A>
): UseTaskEitherImmediateResult<E, A> => {
  const [state, execute, retry] = useTaskEither(func, AsyncState.loading());

  useEffect(() => {
    execute();
  }, []);

  return [state as AsyncState.T<E, A>, retry];
};
