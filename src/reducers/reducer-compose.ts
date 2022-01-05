/* Whoosh composition of two reducers */

type F2 = (a: any, b: any) => any;
type F1 = (a: any) => any;
type F2orF2andF1 = F2 | [F2, F1];

export function compose<S, A, I, RO, IO>(
    outer: [reducer: (previousState: S, input: RO) => S, initializer: (initArg: IO) => S],
    inner: [reducer: (previousState: S, input: A) => RO, initializer: (initArg: I) => IO]
) : [reducer: (previousState: S, input: A) => S, initializer: (initArg: I) => S];
export function compose<S, A, I, RO>(
    outer: [reducer: (previousState: S, input: RO) => S, initializer: (initArg: I) => S],
    inner: (previousState: S, input: A) => RO
) : [reducer: (previousState: S, input: A) => S, initializer: (initArg: I) => S];
export function compose<S, A, I, RO>(
    outer: (previousState: S, input: RO) => S,
    inner: [reducer: (previousState: S, input: A) => RO, initializer: (initArg: I) => S]
) : [reducer: (previousState: S, input: A) => S, initializer: (initArg: I) => S];
export function compose<S, A, RO>(
    outer: (previousState: S, input: RO) => S,
    inner: (previousState: S, input: A) => RO
) : [reducer: (previousState: S, input: A) => S, initializer: (initArg: S) => S];

export function compose(outer: F2orF2andF1, inner: F2orF2andF1): [F2, F1] {
    const id = (x: any) => x;
    const _outer: [F2, F1] = outer instanceof Array? outer : [outer, id];
    const _inner: [F2, F1] = inner instanceof Array? inner : [inner, id];
    return [ 
        (previousState, input) => _outer[0](previousState, _inner[0](previousState, input)),
        initArg => _outer[1](_inner[1](initArg))
    ];
}
