# Whoosh reducer library

Whoosh comes with an optional reducer library that offers commonly used generic reducers and reducer-associated utils.

The library is planned to be extended over time.

### Navigation
- [Reducer `toLocalStorage()`](#reducer-tolocalstorage)
- [Reducer `arrayOp` and `setOp`](#reducer-arrayop-and-setop)
- [Reducer `partialUpdate`](#reducer-partialUpdate)
- [Reducer composition](#reducer-composition)

## Reducer* `toLocalStorage()`

`toLocalStorage()` stores Shared State value in the [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
and retrieves it on the startup.

```ts
import { toLocalStorage } from 'whoosh-react/reducers';
import { createShared } from 'whoosh-react';

const appCounter = createShared<number>(0, toLocalStorage('app.options.counter'));
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
        'app.options.counter',
        {
            toJSONable: counter => counter.value,
            fromJSONable: obj => new Counter(obj as number)
        }
    )
);
```

If the typescript bugging you with the message

```
Index signature for type 'string' is missing in type '__YOUR_TYPE__'
```

but you SURE that your `__YOUR_TYPE__` is `JSONable`, you can suppress this check by passing `null` as the second parameter:

```ts
const appCounter = createShared<{ value: number; } | undefined>(
    undefined,
    toLocalStorage('app.options.counter', null)
);
```

**Note, the function returned by the `toLocalStorage()` call is NOT a pure function, as it relies on side effects in the form of the `localStorage` object access. Exercise caution when using it with anything other than `createShared()`.*

## Reducer `arrayOp` and `setOp`

Reducers `arrayOp` and `setOp` allow for easy element-wise modifications of an `Array` or a `Set` Shared State, respectively.

`arrayOp` adds operations to `remove` and `add` an element, `filter` and `map` the state Array.

`setOp` adds operations to `remove` and `add` an element.

Array example.

```ts
import { arrayOp, ArrayOpInput } from 'whoosh-react/reducers';


// Array of strings state
type StateType1 = string[];
const stateArray1 = createShared<StateType1, ArrayOpInput< StateType1 >>([], arrayOp);
// Array of strings that also can be undefined
type StateType2 = string[] | undefined;
const stateArray2 = createShared<StateType2, ArrayOpInput< StateType2 >>(undefined, arrayOp);

// Valid calls of `set()`:
stateArray1.set([]);
stateArray1.set(['abc', '123']);
stateArray1.set(prev => ['abc', '123', ...prev]);

stateArray1.set({remove: 'abc'});
stateArray1.set({add: '123'});
stateArray1.set({map: (str, idx) => `${idx}-${str}`});
stateArray1.set({filter: str => str.length > 0});

stateArray1.set({remove: '123', add: 'abc'});

stateArray2.set(undefined); // stateArray1 cannot be undefined, but stateArray2 can
```

Set example.

```ts
import { setOp, SetOpInput } from 'whoosh-react/reducers';

// Set of strings state
const stateSet1 = createShared<Set<string>, SetOpInput< Set<string> >>(new Set(), setOp);
// Set of strings that also can be null
const stateSet2 = createShared<Set<string> | null, SetOpInput< Set<string> | null >>(null, setOp);

// Valid calls of `set()`:
stateSet1.set(new Set(['abc', '123']));
stateSet1.set(['abc', '123']); // Array will be silently converted to Set
stateSet1.set(prev => prev.has('abc')? {add: 'has-abc'} : {remove: '123'});

stateSet2.set(null); // stateSet1 cannot be null, but stateSet2 can
```

Several operations can be used in the same call of `state.set()`, e.g. `state.set(filter: v => !!v, add: 'abc')`,
but the order of the operations is predefined and as follows: `remove`, `filter`, `add`, `map`.

## Reducer `partialUpdate`

Allows for partial update of Shared State.

```tsx
import { partialUpdate } from 'whoosh-react/reducers';

interface AppStyle {
    theme: 'light' | 'dark';
    fontSize: string;
}

const appStyle = createShared<AppStyle>(
    {
        theme: 'light',
        fontSize: '1rem'
    },
    partialUpdate
);

//...

appStyle.set({theme: 'dark'}); // Update `theme`. Other `appStyle` properties stay unchanged.
appStyle.set({theme: 'dark'}); // Same value as before won't trigger the update at all.

```

## Reducer composition

`compose()` function allows for simple composition of two reducers.

In this example we compose `arrayOp` reducer and `toLocalStorage()` reducer:

```ts
import { toLocalStorage, arrayOp, ArrayOpInput, compose } from 'whoosh-react/reducers';
import { createShared } from 'whoosh-react';

const userGenres = createShared<string[], ArrayOpInput<string[]>>(
    [], compose(toLocalStorage('userPreferences.genres'), arrayOp)
);
```

The `outer` reducer is passed first and the `inner` is second.
They are going to be composed like this: `newState = outer(prevState, inner(prevState, input))`.
