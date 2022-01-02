# Whoosh tutorials

## Reducer advanced usage

[This example on codesandbox.io](https://codesandbox.io/s/reducer-music-genres-dpwv3?file=/src/App.tsx)
*Note. Chrome blocks access to the localStorage for the iframe in incognito mode. You may need to change your Chrome settings or try it via Firefox*

The optional reducer parameter of the `createShared()` function is the main source of Whoosh versatility and extendability.
It allows for gradual build-up of complexity without breaking the existing code. In this example we'll try to demonstrate it.

Say, you need a Shared State that represents user's music preferences that can be selected via checkboxes:

🗹 Pop

☐ Jazz

🗹 Rock

One can start with a simple Array state.

```tsx
const userGenres = createShared<Array<string>>([]);

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

Then, in another component, you need a bin 🗑️ icon near every genre.
Clicking on that icon should delete the genre from the `userGenres`.

The `onClick` callback for the icon may look like this

```ts
const onClickBin = (genre: string) => 
    userGenres.set(prev => prev.filter(g => g !== genre));
```

You notice how `onChangeCheckbox` and `onClickBin` share the same piece of code.
Let's refactor the logic of adding/removing one element to/from the array out off the components.

For that we can write a reducer like this, and then apply it to the existing Shared State:

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

Cool! But wait, we completely forgot that the project already has a component that resets `userGenres` to some default value.

```tsx
const SetDefaultGenres = () => {
    return <button onClick={ () => userGenres.set(['Pop', 'Rock']) }> Set default </button>;
};
```

Our new fancy reducer will break this code. No good! Who knows how many more places use the 'old' `userGenres.set()` API for the parameter.
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

But we're not done here.

Say, now we want our `userGenres` to be persistent between the page refreshes or app restarts.
Storing `userGenres` serialized array in the [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) is one way to do that.
Of course, we could simply add store/load functionality in the existing reducer.
But it is not unreasonable to think, we may want to reuse it with some other Shared State besides `userGenres`.

Indeed, this is very common functionality and as such, it is is implemented in the Whoosh [reducer library](reducer-lib.md)
as the `toLocalStorage()` reducer. We can combine it with our custom `arrayAddRemoveReducer` using `compose()`
function from the same library.

```ts
import { compose } from 'whoosh-react/reducers';
const userGenres = createShared<string[], string[] | { add?: string; remove?: string; }>(
    [], compose(toLocalStorage('userPreferences.genres'), arrayAddRemoveReducer)
);
```

I hope this example somewhat conveys the idea of gradual non-breaking complexity growth and its advantages.

You don't need to decide right there and now if you require a reducer or a plain state will do. Always start with the simplest solution.
Later, if needed, a reducer can be added or extended without breaking the existing code.
