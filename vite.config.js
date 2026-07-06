import { defineConfig } from "vite";
import pkg from "./package.json" assert { type: "json" };

const version = pkg.version;

export default defineConfig({
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