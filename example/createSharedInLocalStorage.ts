/* Whoosh createShared wrapper that saves/restores the Shared State to/from the `localStorage` */

import { createShared, SharedState } from 'whoosh-react';

const localStorageSet = <T>(key: string, value: T) => {
    if(value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
};

const localStorageGet = <T>(key: string, defaultValue?: T) => {
    const str = localStorage.getItem(key);
    if(str) try { return JSON.parse(str); } catch {}
    return defaultValue;
};

const LocalStorageAppStateKeyPrefix = 'app.';

export function createSharedInLocalStorage<S>(key: string, initialState: S): SharedState<S, S>;
export function createSharedInLocalStorage<S, A>(key: string, initialState: S, reducer: (previousState: S, input: A) => S): SharedState<S, A>;
export function createSharedInLocalStorage(key: string, initialState: any, reducer?: (previousState: any, input: any) => any): SharedState<any, any> {
    return createShared<any, any>(
        localStorageGet(LocalStorageAppStateKeyPrefix + key, initialState),
        (previousState, input) => {
            const result = reducer? reducer(previousState, input) : input;
            localStorageSet(LocalStorageAppStateKeyPrefix + key, result);
            return result;
        }
    );
}
