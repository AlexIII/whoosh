import typescript from 'rollup-plugin-typescript2';
import { terser } from "rollup-plugin-terser";

const config = input => ({
    input,
    output: {
        file: 'dist/' + input.replace(".ts", ".js"),
        format: 'cjs'
    },
    plugins: [
        typescript({tsconfigOverride: { include: [input] }}),
        terser({ compress: true, format: { comments: false } })
    ]
});

export default [
    config('whoosh.ts'),
    config('reducers/index.ts'),
];