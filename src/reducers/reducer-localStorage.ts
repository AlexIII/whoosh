/* Whoosh localStorage reducer */

const LocalStorageKeyPrefix = 'whoosh.';

export type JSONable = boolean | null | undefined | number | string | Array<JSONable> | {[key: string]: JSONable};

const localStorageSet = <T extends JSONable>(key: string, value: T): void => {
    if(value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
};

const localStorageGet = <T extends JSONable>(key: string, defaultValue: T): T => {
    const str = localStorage.getItem(key);
    if(str) try { return JSON.parse(str); } catch {}
    return defaultValue;
};

export function toLocalStorage<T extends JSONable>(key: string): [(prv: T, val: T) => T, (init: T) => T];

export function toLocalStorage<T>(
    key: string,
    serial: {
        toJSONable: (value: T) => JSONable;
        fromJSONable: (obj: JSONable) => T;
    }
): [(prv: T, val: T) => T, (init: T) => T];

export function toLocalStorage<T>(
    key: string,
    serial?: {
        toJSONable: (value: T) => JSONable;
        fromJSONable: (obj: JSONable) => T;
    }
): [(prv: T, val: T) => T, (init: T) => T] {
    serial ??= { toJSONable: v => v as unknown as JSONable, fromJSONable: v => v as unknown as T };
    return [
        (_: T, val: T): T => (localStorageSet(LocalStorageKeyPrefix + key, serial!.toJSONable(val)), val),
        (initVal: T): T => serial!.fromJSONable(localStorageGet(LocalStorageKeyPrefix + key, serial!.toJSONable(initVal)))
    ];
}
