/*
 * Whoosh - minimalistic react state manager that allows for shared state between components
 * Author: github.com/AlexIII
 * URL: https://github.com/AlexIII/whoosh
 * License: MIT
*/

import * as React from 'react';

export interface SharedState<S, A = S> {
    get(): S;                                   // Getter
    set(a: A | ((s: S) => A)): void;            // Setter / Dispatcher
    setRaw(s: S): void;                         // Sets state bypassing reducer
    on(cb: (state: S) => void): () => void;     // Subscribe on change, returns unsubscribe function
    off(cb: (state: S) => void): void;          // Unsubscribe off change
    use(): S;                                   // React Hook
}

type Reducer<S, A> = (previousState: S, input: A) => S;
type ReducerAndInit<S, A, I> = [ Reducer<S, A>, (initArg: I) => S ];
type ReducerOrReducerWithInit<S, A> = Reducer<S, A> | ReducerAndInit<S, A, S>;

export function createShared<S>(): SharedState<S | undefined, S | undefined>;
export function createShared<S>(initValue: S, reducer?: ReducerOrReducerWithInit<S, S>): SharedState<S, S>;
export function createShared<S, A>(initValue: S, reducer: ReducerOrReducerWithInit<S, A>): SharedState<S, A>;
export function createShared<S, A, I>(initValue: I, reducer: ReducerAndInit<S, A, I>): SharedState<S, A>;

export function createShared(initValue?: any, reducer?: ReducerOrReducerWithInit<any,any>): SharedState<any, any> {
    const [_reducer, _initializer] = reducer instanceof Array? reducer : [reducer, (v: any) => v];

    let curState = _initializer(initValue);     // Current state
    const q: ((s: any) => void)[] = [];         // Subscription queue

    // Call subscribers
    let updateRequested = false;
    const requestUpdate = () => {
        if(updateRequested) return;
        updateRequested = true;
        (globalThis.requestAnimationFrame ?? globalThis.setTimeout)(() => {
            updateRequested = false;
            q.forEach(cb => cb(curState));
        });
    };

    const shared: SharedState<any, any> = {
        off: cb => {
            const idx = q.indexOf(cb);
            if(idx < 0) return;
            q.splice(idx, 1);
        },
        on: cb => {
            q.push(cb);
            return () => shared.off(cb);
        },
        get: () => curState,
        set: s => {
            const input = s instanceof Function? s(curState) : s;
            shared.setRaw(_reducer? _reducer(curState, input) : input);
        },
        setRaw: s => {
            if(curState === s) return;
            curState = s;
            requestUpdate();
        },
        use: () => {
            const [ hookState, hookSetState ] = React.useState(curState);
            React.useEffect(() => {
                hookSetState(curState); // Update state, in case there were changes of `curState` between component render and this effect call
                return shared.on(hookSetState);
            }, []);
            return hookState;
        }

    };
    return shared;
}
