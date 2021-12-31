import * as React from 'react';
import * as ReactDOM from 'react-dom';

/* Create Counter */

import { createShared } from '../dist/whoosh';
const appCounter = createShared<number>(0);

/* Use Counter */

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

const A = ({children} : React.PropsWithChildren<{}>) => <>{ children }</>;
const B = A;

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

/* Render Root */

ReactDOM.render(
    React.createElement(RootComponent),
    document.getElementById('root')
);
