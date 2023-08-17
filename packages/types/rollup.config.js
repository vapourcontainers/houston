import typescript from '@rollup/plugin-typescript';
import run from '@rollup/plugin-run';

import { readFile } from 'fs/promises';
const { dependencies } = JSON.parse(await readFile('./package.json', 'utf-8'));

const dev = process.env.ROLLUP_WATCH === 'true';

export default {
  input: 'src/index.ts',
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
  ],
};
