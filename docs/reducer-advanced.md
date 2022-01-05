# Whoosh tutorials

## Reducer advanced usage

[Improved version of this example on codesandbox.io](https://codesandbox.io/s/music-genres-use-set-and-lib-reducer-6jn93?file=/src/App.tsx) [using `Set` to model the state and `setOp` reducer from the reducer library]

[This example (as described in this tutorial) on codesandbox.io](https://codesandbox.io/s/reducer-music-genres-dpwv3?file=/src/App.tsx)

*Note. Chrome blocks access to the localStorage for the iframe in incognito mode. You may need to change your Chrome settings or try it via Firefox*

-----

The optional reducer parameter of the `createShared()` function is the main source of Whoosh versatility and extendability.
It allows for gradual build-up of complexity without breaking the existing code. In this example we'll try to demonstrate it.

Say, you need a Shared State that represents user's music preferences. The state is controlled via checkboxes:

🗹 Pop

☐ Jazz

🗹 Rock

One can start with a simple Array state.

```ts
const userGenres = createShared<Array<string>>([]);
```

And a component for the checkboxes.

```tsx
const GenreSelector = () => {
    const genres = ['Pop', 'Jazz', 'Rock'];
    const selected = userGenres.use();

    const onChangeCheckbox = (isChecked: boolean, genre: string) => 
        userGenres.set(prev => {
            // Just like in `useState` hook we cannot simply modify `prev`. 
            // We MUST return a different instance or no update will happen.
            return isChecked? [...prev, genre] : prev.filter(g => g !== genre);
        });

    return (<div> {
        genres.map(genre => (
            <div key={genre}>
                <input 
                    type="checkbox"
                    id={genre}
                    checked={selected.includes(genre)} 
                    onChange={evt => onChangeCheckbox(evt.target.checked, genre) } 
                />
                <label htmlFor={genre}>{ genre }</label>
            </div>
        ))
    } </div>);
};
```

Looks ok, but suppose, in another component, you need a bin 🗑️ icon near every genre.
Clicking on that icon should delete the genre from the `userGenres`.

The `onClick` callback for the icon may look like this

```ts
const onClickBin = (genre: string) => 
    userGenres.set(prev => prev.filter(g => g !== genre));
```

Notice how `onChangeCheckbox` and `onClickBin` share the same piece of code.
Let's refactor the logic of adding/removing one element to/from the array out off the components.

It can be achieved with a Reducer applied to the existing Shared State:

```ts
const arrayAddRemoveReducer = (prev: string[], input: { add?: string; remove?: string; }): string[] => {
    let copy = [...prev];
    if(input.add) copy.push(input.add);
    if(input.remove) copy = copy.filter(g => g !== input.remove);
    return copy;
};

const userGenres = createShared([], arrayAddRemoveReducer);
```

Now `onChangeCheckbox` and `onClickBin` can be rewritten in much more verbose fashion.

```ts
const onChangeCheckbox = (isChecked: boolean, genre: string) => 
    userGenres.set({ [isChecked? 'add' : 'remove']: genre });

const onClickBin = (remove: string) =>
    userGenres.set({ remove });
```

Ok. But wait, we completely forgot that the project already has another component that resets `userGenres` to some default value.

```tsx
const SetDefaultGenres = () => {
    return <button onClick={ () => userGenres.set(['Pop', 'Rock']) }> Set default </button>;
};
```

Our new fancy reducer will break this code. No good! Who knows how many more places use the 'old' `userGenres.set()` parameter.
We cannot afford to refactor every usage of `userGenres.set()` in the project in one go. And, luckily, we don't have to.
We can simply support the 'old' API in the reducer.

```ts
const arrayAddRemoveReducer = (prev: string[], input: (string[] | { add?: string; remove?: string; })): string[] => {
    if(input instanceof Array) return input;
    let copy = [...prev];
    if(input.add) copy.push(input.add);
    if(input.remove) copy = copy.filter(g => g !== input.remove);
    return copy;
};
```

Now the old and the new code can coexist with no compromise.

In fact, this is a common reducer, so we already have it in the Whoosh reducer library.
See [Reducer `arrayOp` and `setOp`](./reducer-lib.md#reducer-arrayop-and-setop).
It is highly encouraged to prefer a reducer from the library over a custom reducer whenever possible.

Ok, let's continue.

Say, now we want our `userGenres` to be persistent between the page refreshes or app restarts.
Storing `userGenres` serialized array in the [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) is one way to do that.
Of course, we could simply add store/load functionality in the existing reducer.
But it is not unreasonable to think, we may want to reuse it with some other Shared State besides `userGenres`.

Indeed, it is, again, very common functionality and as such, implemented in the Whoosh reducer library
as the [`toLocalStorage()` reducer](./reducer-lib.md#reducer-tolocalstorage). 
We can combine it with our custom `arrayAddRemoveReducer` using `compose()` function from the same library.

```ts
import { compose } from 'whoosh-react/reducers';
const userGenres = createShared<string[], string[] | { add?: string; remove?: string; }>(
    [], compose(toLocalStorage('userPreferences.genres'), arrayAddRemoveReducer)
);
```

Or better yet, we just use `arrayOp` reducer instead of our custom `arrayAddRemoveReducer`.

```ts
import { toLocalStorage, arrayOp, ArrayOpInput, compose } from 'whoosh-react/reducers';

const userGenres = createShared<string[], ArrayOpInput< string[]> >(
    [], compose(toLocalStorage('userPreferences.genres'), arrayOp)
);
```

Now let's do an optimization. We can notice that the `userGenres` can only have unique entries, the order of the entries doesn't matter to us
and we require frequent lookups to the `userGenres` when rendering checkboxes in `GenreSelector` component.

Things considered, a `Set` would better model `userGenres` state then an `Array`.

```ts
import { toLocalStorage, setOp, SetOpInput, compose } from 'whoosh-react/reducers';

// Oops, this is NOT going to work
const userGenres = createShared<Set<string>, SetOpInput< Set<string> >>(
    [], compose(toLocalStorage('userPreferences.genres'), setOp)
);
```

But there's a problem: `toLocalStorage()` can only work with objects that can be serialized/deserialized via `JSON.stringify()`/`JSON.parse()`
and a `Set` is not one of them. Luckily, it is easy to convert a `Set` to an `Array` and back.
`toLocalStorage()` has an optional parameter that allows to specify the conversion functions.

```ts
import { toLocalStorage, setOp, SetOpInput, compose } from 'whoosh-react/reducers';

const userGenres = createShared<Set<string>, SetOpInput<Set<string>>>(
  new Set(),
  compose(
    toLocalStorage("userPreferences.genres", {
      toJSONable: (set: Set<string>) => [...set],
      fromJSONable: (obj: JSONable) => new Set(obj as string[])
    }),
    setOp
  )
);
```

One other change we'll have to make is to replace `selected.includes()` with `selected.has()` in `GenreSelector`.


I hope this example somewhat conveys the idea of gradual non-breaking complexity growth and its advantages.

You don't need to decide right there and now if you require a reducer or a plain state will do. Always start with the simplest solution.
Later, if needed, a reducer can be added or extended without breaking the existing code.
