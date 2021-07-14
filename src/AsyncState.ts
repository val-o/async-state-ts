import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

//#region definitions
const LOADING_TAG = 'Loading';
const SUCCESS_TAG = 'Success';
const ERROR_TAG = 'Error';

export interface LoadingState {
  type: typeof LOADING_TAG;
  loading: true;
  value?: undefined;
  error?: undefined;
}

export interface SuccessState<A> {
  type: typeof SUCCESS_TAG;
  loading: false;
  value: A;
  error?: undefined;
}

export interface ErrorState<E> {
  type: typeof ERROR_TAG;
  loading: false;
  value?: undefined;
  error: E;
}

export type ReadyState<E, A> = SuccessState<A> | ErrorState<E>;

export type AsyncState<E, A> = LoadingState | ReadyState<E, A>;

type Tag = AsyncState<any, any>['type'];

//#endregion

//#region constructors

export const loading = (): LoadingState => ({ type: 'Loading', loading: true });
export const success = <A>(result: A): SuccessState<A> => ({
  type: 'Success',
  value: result,
  loading: false,
});

export const error = <E>(error: E): ErrorState<E> => ({
  type: 'Error',
  error: error,
  loading: false,
});

//#endregion

//#region refinements

export const isSuccess = <E, A>(as: AsyncState<E, A>): as is SuccessState<A> =>
  as.type === 'Success';
export const isError = <E, A>(as: AsyncState<E, A>): as is ErrorState<E> =>
  as.type === 'Error';
export const isLoading = <E, A>(as: AsyncState<E, A>): as is LoadingState =>
  as.type === 'Loading';
export const isReady = <E, A>(as: AsyncState<E, A>): as is ReadyState<E, A> =>
  as.type !== 'Loading';

//#endregion

type Matchers<E, A, B> = {
  [LOADING_TAG]: () => B;
  [SUCCESS_TAG]: (result: A) => B;
  [ERROR_TAG]: (error: E) => B;
};

type BuildMatcher<E, A, B, AS extends AsyncState<E, A>> = {
  [key in AS['type']]: Matchers<E, A, B>[key];
};

export const match = <E, A, B, AS extends AsyncState<E, A>>(
  matcher: BuildMatcher<E, A, B, AS>
) => (state: AS): B => {
  type TMatchers = Matchers<E, A, B>;

  switch (state.type) {
    case ERROR_TAG:
      return ((matcher as any)[state.type] as TMatchers[typeof state.type])(
        (state as ErrorState<E>).error
      );
    case LOADING_TAG:
      return ((matcher as any)[state.type] as TMatchers[typeof state.type])();
    case SUCCESS_TAG:
      return ((matcher as any)[state.type] as TMatchers[typeof state.type])(
        (state as SuccessState<A>).value
      );
  }
};

export const map = <A, B>(fn: (a: A) => B) => <E>(
  as: AsyncState<E, A>
): AsyncState<E, B> => {
  if (as.type === 'Success') {
    return success(fn(as.value));
  }
  return as;
};

//#region fp-ts interop

export const fromEither = <E, A>(either: E.Either<E, A>): ReadyState<E, A> => {
  return pipe(
    either,
    E.fold((e): ReadyState<E, A> => error(e), success)
  );
};

export const toEither = <E, A>(as: ReadyState<E, A>): E.Either<E, A> =>
  as.type === 'Success' ? E.right(as.value) : E.left(as.error);

//#endregion

export const getTag = (state: AsyncState<unknown, unknown>) => state.type;
