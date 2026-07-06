import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.js",
      name: "ProtvistaPDB",
      fileName: "protvista-pdb",
      formats: ["es", "umd"]
    }
  }
});