import { defineConfig } from "vite";
import minifyHTMLLiterals from "rollup-plugin-minify-html-literals";
import pkg from "./package.json";

const minifyHTML =
  minifyHTMLLiterals.default ||
  minifyHTMLLiterals.minifyHTMLLiterals ||
  minifyHTMLLiterals;

const version = pkg.version;

export default defineConfig({
  plugins: [
    minifyHTML({
      options: {
        minifyCSS: true,
        minifyJS: true,
        removeComments: true,
        collapseWhitespace: true,
      },
    }),
  ],
  build: {
    lib: {
      entry: "src/index.js",
      name: "ProtvistaPDB",
      formats: ["es", "umd"],
      fileName: (format) => {
        if (format === "es") {
          return `protvista-pdb-${version}.min.mjs`;
        }

        if (format === "umd") {
          return `protvista-pdb-${version}.min.js`;
        }

        return `protvista-pdb-${version}.min.${format}.js`;
      },
    },
    minify: "terser",
    terserOptions: {
      compress: {
        passes: 3,
        drop_console: true,
        drop_debugger: true,
      },
      mangle: true,
      format: {
        comments: false,
      },
    },
    sourcemap: false,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return `protvista-pdb-${version}.min.css`;
          }

          return `protvista-pdb-${version}.[ext]`;
        },
      },
    },
  },
});