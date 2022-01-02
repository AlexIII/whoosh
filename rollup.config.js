import typescript from 'rollup-plugin-typescript2';
import { terser } from "rollup-plugin-terser";

const config = (input, output) => ({
    input,
    output: {
        file: output,
        format: 'cjs'
    },
    plugins: [
        typescript({tsconfigOverride: { include: [input] }}),
        terser({ compress: true, format: { comments: false } })
    ]
});

export default [
    config('src/whoosh.ts', 'whoosh.js'),
    config('src/reducers/index.ts', 'reducers/index.js'),
];