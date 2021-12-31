/*
 * Whoosh - minimalistic react state manager that allows for shared state between components
 * Version: 1.0.0 alpha
 * Author: github.com/AlexIII
 * URL: https://github.com/AlexIII/whoosh
 * License: MIT
*/

// @ts-ignore
import * as React from 'react';

export interface SharedState<S, A = S> {
    get(): S;                                   // Getter
    set(a: A | ((s: S) => A)): void;            // Setter / Dispatcher
    on(cb: (state: S) => void): () => void;     // Subscribe on change, returns unsubscribe function
    off(cb: (state: S) => void): void;          // Unsubscribe off change
    use(): S;                                   // React Hook
}

export function createShared<S>(initialState: S): SharedState<S, S>;
export function createShared<S, A>(initialState: S, reducer: (previousState: S, input: A) => S): SharedState<S, A>;
export function createShared(initialState: any, reducer?: (previousState: any, input: any) => any): SharedState<any, any> {
    let curState = initialState;               // Current state
    const q: ((s: any) => void)[] = [];     // Subscription queue

    // Call subscribers
    let updateRequested = false;
    const requestUpdate = () => {
        if(updateRequested) return;
        updateRequested = true;
        (globalThis.requestAnimationFrame? globalThis.requestAnimationFrame : globalThis.setTimeout)(() => {
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
            const newState = reducer? reducer(curState, input) : input;
            if(curState !== newState) {
                curState = newState;
                requestUpdate();
            }
        },
        use: () => {
            const [ hookState, hookSetState ] = React.useState(curState);
            React.useEffect(() => shared.on(hookSetState), []);
            return hookState;
        }

    };
    return shared;
}
