// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    sourcemap: true,
    emptyOutDir: true,
    lib: {
      entry: 'src/index.js',
      name: 'ProtvistaPdb',
      fileName: (format) => `protvista-pdb.${format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['rxjs', 'd3'],
      output: {
        globals: {
          rxjs: 'rxjs',
          d3: 'd3',
        },
      },
    },
  },
});