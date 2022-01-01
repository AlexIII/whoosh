import * as React from 'react';
import * as ReactDOM from 'react-dom';

/* Create Counter */

import { createShared } from 'whoosh-react';

export const appCounter = createShared<number, { operation: 'add' | 'subtract' | 'set'; arg: number; }>(
    0,
    (previousValue, { operation, arg }) => {
        switch(operation) {
            case 'add': return previousValue + arg;
            case 'subtract': return previousValue - arg;
            case 'set': return arg;
        }
        throw new Error(`appCounter Reducer: operation ${operation} is not supported!`)
    }
);

/* Use Counter */

const CounterValue = () => {
    const counter = appCounter.use();
    return <p> { counter } </p>;
};

const CounterControls = () => {
    const reset = () => appCounter.set({operation: 'set', arg: 0});
    const addOne = () => appCounter.set({operation: 'add', arg: 1});

    const toggleBetween0and1 = () => appCounter.set(
        previousValue => ({
            operation: (previousValue > 0? 'subtract' : 'add'),
            arg: 1
        })
    );
    
    return (<>
        <button onClick={reset} > Reset </button>
        <button onClick={addOne} > Add 1 </button>
        <button onClick={toggleBetween0and1} > toggle 0 - 1 </button>
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
