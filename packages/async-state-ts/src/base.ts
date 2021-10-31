import { LOADING_TAG, SUCCESS_TAG, ERROR_TAG, NOT_INITIATED_TAG } from './constants';

export type Loading = {
  readonly type: typeof LOADING_TAG;
  readonly loading: true;
  readonly value?: undefined;
  readonly error?: undefined;
};

export type Success<A> = {
  readonly type: typeof SUCCESS_TAG;
  readonly loading: false;
  readonly value: A;
  readonly error?: undefined;
};

export type ReadyState<E, A> = Success<A> | Error<E>;

export type Error<E> = {
  readonly type: typeof ERROR_TAG;
  readonly loading: false;
  readonly value?: undefined;
  readonly error: E;
};

export type NotInitiated = {
  readonly type: typeof NOT_INITIATED_TAG;
  readonly loading: false;
  readonly value?: undefined;
  readonly error?: undefined;
};

const _loading: Loading = { type: 'Loading', loading: true };
export const loading = (): Loading => _loading;
export const success = <A>(result: A): Success<A> => ({
  type: 'Success',
  value: result,
  loading: false,
});

export const error = <E>(error: E): Error<E> => ({
  type: 'Error',
  error: error,
  loading: false,
});

const _notInitiated: NotInitiated = { type: 'NotInitiated', loading: false };
export const notInitiated = (): NotInitiated => _notInitiated;
