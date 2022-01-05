/* Whoosh arrayOp reducer */

export type ArrayElement<A> = A extends Array<infer E>? E : never;

export type ArrayOps<E> = {
    add?: E;
    remove?: E;
    map?: (value: E, index: number, array: Array<E>) => E;
    filter?: (value: E, index: number, array: Array<E>) => boolean;
};

export type ArrayOpInput<S> = S | ArrayOps<ArrayElement<S>>;

export function arrayOp<S extends Array<ArrayElement<S>> | null | undefined>(prev: S, input: ArrayOpInput<S>): S {
    if(input === undefined || input === null) return input;         // eslint-disable-line @typescript-eslint/tslint/config
    if(input instanceof Array) return input as S;
    if(!(input instanceof Object) || Object.keys(input).length === 0) return prev;

    let result: Array<ArrayElement<S>> = prev? prev.slice() : [];

    if('remove' in input)
        result = result.filter(val => val !== input.remove);
    if('filter' in input)
        result = result.filter(input.filter!);
    if('add' in input)
        result.push(input.add!);
    if('map' in input)
        result = result.map(input.map!);

    return result as S;
}
