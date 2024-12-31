import typescript from '@rollup/plugin-typescript';
import { resolve } from 'path';

export default {
  input: './src/Main.ts',
  output: {
    file: './dist/bundle.js',
    format: 'esm'
  },
  plugins: [
    typescript({
      tsconfig: resolve(__dirname, 'tsconfig.json')
    })
  ]
};