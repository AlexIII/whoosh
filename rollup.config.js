import typescript from 'rollup-plugin-typescript2';
import { terser } from "rollup-plugin-terser";
const path = require('path');

const config = input => ({
    input,
    output: {
        file: path.join('dist', path.dirname(input), input.replace(".ts", ".js")),
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