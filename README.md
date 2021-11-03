# async-state-ts

## Recipies

### Combining async states

If you need to derive `AsyncState` from multiple given ones, you could use `combine` method.
The resulting `AsyncState` will have following shape:

- `Error` will have collected error types from input `AsyncState`s (represented by union).
- `Success`' value type will be the type which mapping function returns.

The resulting `AsyncState` will be in `Success` state only if all input `AsyncState`s are succeeded.

Example: Suppose we have `UserInfo` and `Balance` holding async states with different error types, by using `combine` we are able to derive state with `UserWithBalance` by using mapping function.

```ts
import * as AsyncState from 'async-state-ts/AsyncState';

// User Info
type UserInfo = {
  name: string;
  id: string;
};
type SomeError = { type: 'SomeError' };
type UserInfoState = AsyncState.AsyncState<SomeError, UserInfo>;
declare const userInfoState: UserInfoState;

// Balance
type OtherError = { type: 'OtherError' };
type Balance = {
  amount: number;
};
type BalanceState = AsyncState.AsyncState<OtherError, Balance>;
declare const balanceState: BalanceState;

// Combination
type UserWithBalance = {
  balance: number;
  userName: string;
  userId: string;
};

// The resolved type will be AsyncState<SomeError | OtherError, UserWithBalance>
const userWithBalanceState = AsyncState.combineI(
  [userInfoState, balanceState],
  // Mapping function
  ({ id, name }, { amount }): UserWithBalance => ({
    balance: amount,
    userId: id,
    userName: name,
  })
);
```

### Usage with React

If you need to use `TaskEither` returning function inside a component, you can track the lifecycle of its call by using `useTaskEither` and `useTaskEitherImmediate` hooks.

Example: Suppose you're going to fetch `UserInfo` when component is mounted and give client a feedback of request state (Loading, Error, Succes). You can achieve this by using `useTaskEitherImmediate` hook, which will call TaskEither returning function upon component mount.

```tsx
import * as AsyncState from 'async-state-ts/AsyncState';
import { useTaskEitherImmediate } from 'async-state-ts-react-hooks';


type FetchError = { type: 'FetchError', message: string };
type UserInfo = {
  name: string;
  id: string;
};

declare const fetchUserInfoFromServer: () => TE.TaskEither<FetchError, UserInfo>;

const UserInfoComponent: React.FC = () => {
  const [state, retry] = useTaskEitherImmediate(fetchUserInfoFromServer);

  return pipe(
    state,
    AsyncState.match({
      Error: ({message}) => <>
        <p>Sorry, we couldn't load user info. Message: {message}</p>,
        <button onClick={retry}>Try Again</button>
      </>
      Loading: () => <p>Loading...</p>,
      Success: ({name}) => <p>Hello {name}!</p>,
    })
  )

}

```

But if you don't need to trigger `fetchUserInfoFromServer` upon mounting, but rather by effect or callback, you could make use of `useTaskEither` hook. Note that now state will also have `NotInitiated` state.

```tsx
import * as AsyncStateN from 'async-state-ts/AsyncStateN';
import { useTaskEither } from 'async-state-ts-react-hooks';

declare const fetchUserInfoFromServer: () => TE.TaskEither<FetchError, UserInfo>;

const UserInfoComponent: React.FC = () => {
  const [state, execute, retry, reset] = useTaskEither(fetchUserInfoFromServer);

  return pipe(
    state,
    AsyncStateN.match({
      NotInitiated: () => <div>
        <button onClick={execute}>Load User!</button>
      </div>
      Error: ({message}) => <>
        <p>Sorry, we couldn't load user info. Message: {message}</p>,
        <button onClick={retry}>Try Again</button>
      </>
      Loading: () => <p>Loading...</p>,
      Success: ({name}) => <>
        <p>Hello {name}!</p>
        <button onClick={reset}>Reset</button>
      </>,
    })
  )

}

```
