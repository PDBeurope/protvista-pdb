// vite.config.ts
import { defineConfig } from 'vite';
import pkg from './package.json';

export default defineConfig({
  build: {
    sourcemap: true,
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: true,
      mangle: true,
      format: {
        comments: false,
      },
    },
    lib: {
      entry: 'src/index.js',
      name: 'ProtvistaPdb',
      fileName: (format) => `protvista-pdb-${pkg.version}.${format}.min.js`,
      formats: ['es', 'umd'],
    }
  },
});