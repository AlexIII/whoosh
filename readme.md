<img align="right" width="110" src="./whoosh-logo.png" />

# Whoosh - minimalistic React state manager

**Whoosh** is a React state manager which entire API consists of exactly _one_ function - `createShared()`.

[TL;DR version of the docs](tldr.md)

### Navigation

- [Mindset](#mindset)
- [Installation](#installation)
- [Examples](#examples)
  - [Counter](#counter)
  - [Counter with Reducer](#counter-with-reducer)
  - [Reducer advanced usage](docs/reducer-advanced.md) [separate file]
  - [Shared State Interaction](docs/shared-state-interaction.md) [separate file]
- [Reducer library](docs/reducer-lib.md) [separate file]
  - [Reducer `toLocalStorage()`](docs/reducer-lib.md#reducer-tolocalstorage)
  - [Reducer `arrayOp` and `setOp`](docs/reducer-lib.md#reducer-arrayop-and-setop)
  - [Reducer `partialUpdate`](docs/reducer-lib.md#reducer-partialUpdate)
  - [Reducer composition](docs/reducer-lib.md#reducer-composition)
- [Shared State object API](#shared-state-object-api)
- [`createShared()` function API](#createshared-function-api)
- [Usage with class components](#usage-with-class-components)
- [Changelog](#changelog)
- [License](#license)

## Mindset

Whoosh aims to be

- easy to use and reason about,
- general and extendable,
- compact*.

*Whoosh is _very_ small. Its entire source code is under 80 lines (code readability is not sacrificed)
and it takes less than 1 Kbyte in minimized form.

## Installation

`npm install --save whoosh-react`

## Examples

### Counter

[This example on codesandbox.io](https://codesandbox.io/s/whoosh-counter-simple-yejzt?file=/src/App.tsx)

1. Create Shared State

```tsx
// AppState.ts
import { createShared } from 'whoosh-react';

export const appCounter = createShared<number>(0);
```
`createShared()` accepts an initial value and returns an object that represents Shared State.

2. Use Shared State in React components

```tsx
// Counter.tsx
import { appCounter } from './AppState.ts';

const CounterValue = () => {
    const counter = appCounter.use();
    return <p> { counter } </p>;
};

const CounterControls = () => {
    const reset = () => appCounter.set(0);
    const addOne = () => appCounter.set(previousValue => previousValue + 1);
    return (<>
        <button onClick={reset} > Reset </button>
        <button onClick={addOne} > Add 1 </button>
    </>);
};
```

In this example we call two function from the `appCounter`:

- `use()` returns current value of the Shared State.
 It is a React Hook that will trigger component re-render every time Shared State changes.

- `set()` is a plain JS function that updates Shared State.
 It accepts either a new value or a function that returns the new value.

3. Render the components. They can be anywhere in the tree.

```tsx
const RootComponent = () => (
    <>
        <A>
            <CounterValue/>
        </A>
        <B>
            <CounterControls/>
        </B>
    </>
);
```

### Counter with Reducer

[This example on codesandbox.io](https://codesandbox.io/s/whoosh-counter-reducer-4kwrn?file=/src/App.tsx)

`createShared()` has the second optional parameter which is a Reducer function.

Reducer is a function of type `(previousValue: S, input: A) => S`. 
It describes how Shared State of type `S` should be modified based on the `previousValue` and the `input`.
`input` is the value that was passed to the `appCounter.set()`.
Notice, that if an invalid input is passed to `set()` a `Error` will be thrown to the caller of `set()`.

```tsx
// AppState.ts
export const appCounter = createShared<number, { operation: 'add' | 'subtract' | 'set'; arg: number; }>(
    0,
    (previousValue, { operation, arg }) => {
        switch(operation) {
            case 'add': return previousValue + arg;
            case 'subtract': return previousValue - arg;
            case 'set': return arg;
        }
        // This Error will be thrown to the caller of `appCounter.set(__invalid_parameter__)`
        throw new Error(`appCounter Reducer: operation ${operation} is not supported!`)
    }
);
```

```tsx
// Counter.tsx
const CounterControls = () => {
    const reset = () => appCounter.set({operation: 'set', arg: 0});
    const addOne = () => appCounter.set({operation: 'add', arg: 1});
    return (<>
        <button onClick={reset} > Reset </button>
        <button onClick={addOne} > Add 1 </button>
    </>);
};
```

Passing a function to `appCounter.set()` is still possible:

```tsx
const toggleBetween0and1 = () => appCounter.set(
    previousValue => ({
        operation: (previousValue > 0? 'subtract' : 'add'),
        arg: 1
    })
);
```

Refer to [this tutorial](docs/reducer-advanced.md) on advanced reducer usage in Whoosh.

Most common reducers are available (but completely optional) in the [Reducer library](docs/reducer-lib.md)

## Shared State object API

`createShared()` returns a Shared State object with the next interface

```ts
// S - State type
// A - Reducer input type (if Reducer is present)

interface SharedState<S, A = S> {
    use(): S;                                   // React Hook that returns current state value
    get(): S;                                   // Getter
    set(a: A | ((s: S) => A)): void;            // Setter / Dispatcher
    on(cb: (state: S) => void): () => void;     // Subscribe on the state change, returns unsubscribe function
    off(cb: (state: S) => void): void;          // Unsubscribe off the state change
}
```

- `use()` is a React Hook that will trigger component re-render when the Shared State changes.
 It is subject to React Hook usage rules, just like any other Hook.
 It can only be called from the inside of a functional component.

All other functions are plain js functions. They can be called from anywhere.

- `get()` gets current Shared State value. Mutation of the returned value will modify the underlying Shared State value,
 but won't trigger re-renders or calls of the subscribers.

- `set()` updates Shared State value. Accepts either a new value or a function that accepts previous value and returns the new value. 
 The new value should be of type `S` if no reducer is passed to `createShared()` or of type `A` if there is.
 (Of course, nothing prevents you having `S === A` which is a very useful case by itself.)
 The call of the function will trigger re-render of the components that are mounted and `use()` this Shared State.

- `on()` and `off()` allow to manually subscribe and unsubscribe to/from Shared State changes.
 See [Shared State Interaction](docs/shared-state-interaction.md) for usage example.

All `SharedState` functions are guaranteed to be _stable_. It’s safe to omit them from the `useEffect` or other hooks dependency lists.

All `SharedState` functions do NOT require bind. They are really just _functions_ and NOT class _methods_.

## `createShared()` function API

```ts
// S - State type
// A - Reducer input type (if Reducer is present)
// I - Initializer input type (if Reducer and Initializer are both present)

type Reducer<S, A> = (previousState: S, input: A) => S;
type ReducerAndInit<S, A, I> = [ Reducer<S, A>, (initArg: I) => S ];
type ReducerOrReducerWithInit<S, A> = Reducer<S, A> | ReducerAndInit<S, A, S>;

function createShared<S>(initValue: S, reducer?: ReducerOrReducerWithInit<S, S>): SharedState<S, S>;
function createShared<S, A>(initValue: S, reducer: ReducerOrReducerWithInit<S, A>): SharedState<S, A>;
function createShared<S, A, I>(initValue: I, reducer: ReducerAndInit<S, A, I>): SharedState<S, A>;
```

`createShared()` takes two arguments: an `initialValue` (required) and a `reducer` (optional).

The `reducer` is either a Reducer function or a tuple (an array) of two functions,
first of which is a Reducer and second is an Initializer.

## Usage with class components

Whoosh primarily targets the "new way" of doing thins in React.
That is, when the entire application is build using only functional components.
But, if you have to support a class component, you can manually subscribe `on()` the Shared State change in `componentWillMount()` 
and unsubscribe `off()` the Shared State change in `componentWillUnmount()`.

## Changelog

`1.0.10`

- Remove freeze for the underlying state object. That was a bad idea...

`1.0.9`

- Improve `createShared()` typing

`1.0.8`

- Improve `toLocalStorage()` typing

`1.0.8`

- Update docs
- Add reducer partialUpdate

`1.0.6`

- Improve reducer-compose typing

`1.0.5`

- Add reducers `arrayOp` and `setOp` to the reducer library and update docs accordingly
- Underlying state object is now freezed in order to prevent modifications

`1.0.4`

- Add initializer function to the reducer argument of `createShared()`
- Add reducer library:
  - `toLocalStorage()` reducer
  - `compose()` - a function for reducer composition
- Build with rollup

`1.0.1`

- Initial release

## License

© github.com/AlexIII

MIT
