import * as React from 'react';
import * as ReactDOM from 'react-dom';

/* Create Shared State */

import { createSharedInLocalStorage } from './createSharedInLocalStorage';

const ArrayAddRemoveReducer = (prev: string[], input: string[] | { add?: string; remove?: string; }): string[] => {
    if(input instanceof Array) return input;
    let copy = [...prev];
    if(input.add) copy.push(input.add);
    if(input.remove) copy = copy.filter(g => g !== input.remove);
    return copy;
};

const userGenres = createSharedInLocalStorage('userPreferences.genres', [], ArrayAddRemoveReducer);

/* Use Shared State */

const GenreSelector = () => {
    const genres = ['Pop', 'Jazz', 'Rock'];
    const selected = userGenres.use();

    const onChangeCheckbox = (isChecked: boolean, genre: string) => 
        userGenres.set({ [isChecked? 'add' : 'remove']: genre });


    return (<div> {
        genres.map(genre => (
            <div key={genre}>
                <input type="checkbox" id={genre} checked={selected.includes(genre)} onChange={evt => onChangeCheckbox(evt.target.checked, genre) } />
                <label htmlFor={genre}>{ genre }</label>
            </div>
        ))
    } </div>);
};

const GenreBin = () => {
    const selected = userGenres.use();

    const onClickBin = (remove: string) =>
        userGenres.set({ remove });

    return (<div> {
        selected.map(genre => (
            <div key={genre} onClick={() => onClickBin(genre)}>{ genre }🗑️</div>
        ))
    } </div>);
};

const SetDefaultGenres = () => {
    return <button onClick={ () => userGenres.set(['Pop', 'Rock']) }> Set default </button>;
};

const RootComponent = () => (
    <>
        <GenreSelector/>
        <p/>
        <GenreBin/>
        <p/>
        <SetDefaultGenres/>
    </>
);

/* Render Root */

ReactDOM.render(
    React.createElement(RootComponent),
    document.getElementById('root')
);
