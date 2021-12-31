import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import replace from '@rollup/plugin-replace';

export default {
    input: 'main.ts',
    output: {
        file: 'bundle.js',
        format: 'cjs'
    },
    plugins: [
        typescript(),
        replace({
            preventAssignment: true,
            'process.env.NODE_ENV': JSON.stringify('development')
        }),
        commonjs({
            sourceMap: false
        }),
        resolve({
            browser: true,
            preferBuiltins: true
        })
    ]
};
