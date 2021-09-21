import { LOADING_TAG, SUCCESS_TAG, ERROR_TAG, NOT_INITIATED_TAG } from './constants';

export type Loading = {
  type: typeof LOADING_TAG;
  loading: true;
  value?: undefined;
  error?: undefined;
};

export type Success<A> = {
  type: typeof SUCCESS_TAG;
  loading: false;
  value: A;
  error?: undefined;
};

export type ReadyState<E, A> = Success<A> | Error<E>;

export type Error<E> = {
  type: typeof ERROR_TAG;
  loading: false;
  value?: undefined;
  error: E;
};

export type NotInitiated = {
  type: typeof NOT_INITIATED_TAG;
  loading: false;
  value?: undefined;
  error?: undefined;
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
