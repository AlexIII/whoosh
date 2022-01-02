# Whoosh TL;DR

`npm install --save whoosh-react`

[FULL version of the docs](readme.md)

## Why?

Simple. Small.

## Examples

### Counter

[This example on codesandbox.io](https://codesandbox.io/s/whoosh-counter-simple-yejzt?file=/src/App.tsx)

```jsx
import { createShared } from 'whoosh-react';
const appCounter = createShared(0); // 0 - initial value

const CounterValue = () => {
    const counter = appCounter.use(); // Hook returns current counter value
    return <p> { counter } </p>;
};

const CounterControls = () => {
    // Functions update counter state
    const reset = () => appCounter.set(0);
    const addOne = () => appCounter.set(val => val + 1);
    return (<>
        <button onClick={reset} > Reset </button>
        <button onClick={addOne} > Add 1 </button>
    </>);
};

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

```jsx
const appCounter = createShare(
    // Initial value
    0,
    // Reducer
    (previousValue, { operation, arg }) => {
        switch(operation) {
            case 'add': return previousValue + arg;
            case 'subtract': return previousValue - arg;
        }
        throw new Error(`Operation ${operation} is not supported!`)
    }
);

// ...

const addOne = () => appCounter.set({operation: 'add', arg: 1});
<button onClick={addOne} > Add 1 </button>

```

## API

```ts
// S - State type
// A - Reducer input type (if Reducer is present)
// I - Initializer input type (if Reducer and Initializer are both present)

interface SharedState<S, A = S> {
    use(): S;                                   // React Hook that returns current state value
    get(): S;                                   // Getter
    set(a: A | ((s: S) => A)): void;            // Setter / Dispatcher
    on(cb: (state: S) => void): () => void;     // Subscribe on the state change, returns unsubscribe function
    off(cb: (state: S) => void): void;          // Unsubscribe off the state change
}

type Reducer<S, A> = (previousState: S, input: A) => S;
type ReducerAndInit<S, A, I> = [ Reducer<S, A>, (initArg: I) => S ];
type ReducerOrReducerWithInit<S, A> = Reducer<S, A> | ReducerAndInit<S, A, S>;

function createShared<S>(initValue: S, reducer?: ReducerOrReducerWithInit<S, S>): SharedState<S, S>;
function createShared<S, A>(initValue: S, reducer: ReducerOrReducerWithInit<S, A>): SharedState<S, A>;
function createShared<S, A, I>(initValue: I, reducer: ReducerAndInit<S, A, I>): SharedState<S, A>;
```

## License

© github.com/AlexIII

MIT
