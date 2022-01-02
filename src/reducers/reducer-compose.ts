/* Whoosh composition of two reducers */

type F2 = (a: any, b: any) => any;
type F1 = (a: any) => any;
type F2orF2andF1 = F2 | [F2, F1];

export function compose<S, A, I, RO, IO>(
    outer: [(previousState: S, input: RO) => S, (initArg: IO) => S],
    inner: [(previousState: S, input: A) => RO, (initArg: I) => IO]
) : [(previousState: S, input: A) => S, (initArg: I) => S];
export function compose<S, A, I, RO>(
    outer: [(previousState: S, input: RO) => S, (initArg: I) => S],
    inner: (previousState: S, input: A) => RO
) : [(previousState: S, input: A) => S, (initArg: I) => S];
export function compose<S, A, I, RO>(
    outer: (previousState: S, input: RO) => S,
    inner: [(previousState: S, input: A) => RO, (initArg: I) => S]
) : [(previousState: S, input: A) => S, (initArg: I) => S];
export function compose<S, A, RO>(
    outer: (previousState: S, input: RO) => S,
    inner: (previousState: S, input: A) => RO
) : [(previousState: S, input: A) => S, (initArg: S) => S];

export function compose(outer: F2orF2andF1, inner: F2orF2andF1): [F2, F1] {
    const id = (x: any) => x;
    return [ 
        (previousState, input) => (outer instanceof Array? outer[0] : outer)(previousState, (inner instanceof Array? inner[0] : inner)(previousState, input)),
        initArg => (outer instanceof Array? outer[1] : id)((inner instanceof Array? inner[1] : id)(initArg))
    ];
}
