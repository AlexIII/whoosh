/* Whoosh setOp reducer */

export type SetElement<A> = A extends Set<infer E>? E : never;

export type SetOps<E> = {
    add?: E;
    remove?: E;
};

export type SetOpInput<S> = S | Array<SetElement<S>> | SetOps<SetElement<S>>;

export function setOp<S extends Set<SetElement<S>> | null | undefined>(prev: S, input: SetOpInput<S>): S {
    if(input === undefined || input === null) return input;         // eslint-disable-line @typescript-eslint/tslint/config
    if(input instanceof Set) return input as S;
    if(input instanceof Array) return new Set(input) as S;
    if(!(input instanceof Object) || Object.keys(input).length === 0) return prev;

    const result = new Set(prev);

    if('remove' in input) result.delete(input.remove!);
    if('add' in input) result.add(input.add!);

    return result as S;
}
