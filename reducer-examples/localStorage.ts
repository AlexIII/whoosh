import { createShared, SharedState } from '../whoosh';

const LocalStorageWhooshKeyPrefix = 'app.';

const localStorageSet = <S>(key: string, value: S) => {
    if(value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
};

const localStorageGet = <S>(key: string, defaultValue?: S) => {
    const str = localStorage.getItem(key);
    if(str) try { return JSON.parse(str); } catch {}
    return defaultValue;
};


export function createSharedInLocalStorage<S>(key: string, initialState: S): SharedState<S, S>;
export function createSharedInLocalStorage<S, A = S>(key: string, initialState: S, reducer: (previousState: S, input: A) => S): SharedState<S, A>;
export function createSharedInLocalStorage(key: string, initialState: any, reducer?: (previousState: any, input: any) => any): SharedState<any, any> {
    return createShared<any, any>(
        localStorageGet(LocalStorageWhooshKeyPrefix + key, initialState),
        (previousState, input) => {
            const result = reducer? reducer(previousState, input) : input;
            localStorageSet(LocalStorageWhooshKeyPrefix + key, result);
            return result;
        }
    );
}
