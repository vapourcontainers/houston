import typescript from '@rollup/plugin-typescript';
import run from '@rollup/plugin-run';

import { readFile } from 'fs/promises';
const { dependencies } = JSON.parse(await readFile('./package.json', 'utf-8'));

const dev = process.env.ROLLUP_WATCH === 'true';

export default {
  input: 'src/main.ts',
  output: {
    dir: 'dist',
    format: 'es',
  },
  plugins: [
    typescript(),
    dev && run(),
  ],
  external: [
    ...Object.keys(dependencies || {}),
    'querystring',
    '@vapourcontainers-houston/types',
    '@alicloud/tea-util',
    '@alicloud/tea-typescript',
  ],
};
