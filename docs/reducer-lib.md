# Whoosh reducer library

Whoosh comes with an optional reducer library that offers commonly used generic reducers and reducer-associated utils.

The library is planned to be extended over time.

### Navigation
- [Reducer `toLocalStorage()`](#reducer-tolocalstorage)
- [Reducer composition](#reducer-composition)

## Reducer `toLocalStorage()`

`toLocalStorage()` reducer stores Shared State value in the [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
and retrieves it on the startup.

```ts
import { toLocalStorage } from 'whoosh-react/reducers';
import { createShared } from 'whoosh-react';

const appCounter = createShared<number>(0, toLocalStorage('app.my.options.counter'));
```

If no value was saves to the `localStorage` previously, the Shared State will be initialized 
with `defaultValue` (which is `0` in this example).

Underlying state type should be a `JSONable` type:
```ts
type JSONable = boolean | null | undefined | number | string | Array<JSONable> | {[key: string]: JSONable};
```

In order to save other objects, such as a class instance, a converter to/from `JSONable`
should be provided as the second parameter to `toLocalStorage()`:

```ts
class Counter {
    constructor(public value: number = 0) {}
}

const appCounter = createShared<Counter>(
    new Counter(),
    toLocalStorage(
        'app.my.options.counter',
        {
            toJSONable: counter => counter.value,
            fromJSONable: obj => new Counter(obj as number)
        }
    )
);
```

## Reducer composition

`compose()` function allows for simple composition of two reducers.

In this example we compose custom reducer and `toLocalStorage()` reducer:

```ts
import { toLocalStorage, compose } from 'whoosh-react/reducers';
import { createShared } from 'whoosh-react';

// Custom reducer
const counterReducer = (previousValue: number, { operation, arg }: { operation: 'add' | 'subtract' | 'set'; arg: number; }) => {
    switch(operation) {
        case 'add': return previousValue + arg;
        case 'subtract': return previousValue - arg;
        case 'set': return arg;
    }
    throw new Error(`appCounter Reducer: operation ${operation} is not supported!`)
}

const appCounter = createShared<number, { operation: 'add' | 'subtract' | 'set'; arg: number; }>(
    0, compose(
        toLocalStorage('app.my.options.counter'),
        counterReducer
    )
);
```
