import * as React from 'react';
import * as ReactDOM from 'react-dom';

/* Create Shared State */

import { createShared } from '../dist/whoosh';

const userGenres = createShared<Array<string>>([]);

/* Use Shared State */

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
                <input type="checkbox" id={genre} checked={selected.includes(genre)} onChange={evt => onChangeCheckbox(evt.target.checked, genre) } />
                <label htmlFor={genre}>{ genre }</label>
            </div>
        ))
    } </div>);
};

const GenreBin = () => {
    const selected = userGenres.use();

    const onClickBin = (genre: string) => 
        userGenres.set(prev => prev.filter(g => g !== genre));

    return (<div> {
        selected.map(genre => (
            <div key={genre} onClick={() => onClickBin(genre)}>{ genre }🗑️</div>
        ))
    } </div>);
};

const RootComponent = () => (
    <>
        <GenreSelector/>
        <p/>
        <GenreBin/>
    </>
);

/* Render Root */

ReactDOM.render(
    React.createElement(RootComponent),
    document.getElementById('root')
);
