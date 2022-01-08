/* Whoosh partialUpdate reducer */

export function partialUpdate<S extends {}>(prev: S, input: Partial<S>): S {
    if(Object.keys(input).every(k => prev[k as keyof S] === input[k as keyof S])) return prev;
    return {...prev, ...input};
}
