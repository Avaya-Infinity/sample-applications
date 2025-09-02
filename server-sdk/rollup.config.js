// rollup.config.js - ES Module format
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default [
  // ESM version
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/avaya-infinity-server-sdk.js',
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [
      resolve({
        preferBuiltins: true,
        browser: false
      }),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' })
    ],
    external: ['crypto']
  },
  // CommonJS version
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/avaya-infinity-server-sdk.cjs',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      }
    ],
    plugins: [
      resolve({
        preferBuiltins: true,
        browser: false
      }),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' })
    ],
    external: ['crypto']
  }
];
