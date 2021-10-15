import typescript from 'rollup-plugin-typescript2';
import cleaner from 'rollup-plugin-cleaner';
import { babel } from '@rollup/plugin-babel';
import path from 'path';
const pkg = require('./package.json');

const resolve = function (...args) {
  return path.resolve(__dirname, ...args);
};

const externalDeps = [
  'commander',
  'ow',
  'hey-yoo-utils',
  'file-url',
  'chalk',
  'chalk-ex',
  'prompts',
  'ora',
  'axios',
  'decompress',
  'rimraf',
];

const externalNode = [
  'path',
  'fs',
  'process',
  'module',
  'buffer',
  'child_process',
  'zlib',
];

module.exports = {
  input: resolve('./src/index.ts'),
  output: {
    format: 'esm',
    name: pkg.name,
    file: resolve(pkg.exports),
    banner: '#!/usr/bin/env node',
  },
  external: [...externalDeps, ...externalNode],
  plugins: [
    typescript({
      tsconfig: 'tsconfig.json',
    }),
    cleaner({
      targets: ['./bin/index.js'],
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      extensions: ['.js', '.ts'],
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
            },
          },
        ],
      ],
    }),
  ],
};
