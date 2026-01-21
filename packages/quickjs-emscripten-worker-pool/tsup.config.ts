import { defineConfig } from "tsup"

export default defineConfig([
  // Main library bundle
  {
    entry: ["src/index.ts"],
    sourcemap: true,
    dts: true,
    clean: true,
    format: ["cjs", "esm"],
    minifySyntax: true,
    minifyWhitespace: true,
    tsconfig: "./tsconfig.build.json",
    // Mark QuickJS variants as external - they are loaded dynamically at runtime
    external: [
      "@componentor/quickjs-wasmfs-release-sync",
      "@componentor/quickjs-singlefile-cjs-release-sync",
      "@componentor/quickjs-singlefile-cjs-release-asyncify",
    ],
  },
  // Worker script - bundle for browser Web Workers
  // QuickJS variants are dynamically imported at runtime based on configuration
  {
    entry: ["src/worker-scripts/worker-entry.ts"],
    outDir: "dist/worker",
    sourcemap: true,
    dts: false, // Workers don't need types
    format: ["esm"], // Browsers use ESM workers
    minifySyntax: true,
    minifyWhitespace: true,
    tsconfig: "./tsconfig.build.json",
    // Mark QuickJS variants as external - they are loaded dynamically at runtime
    external: [
      "@componentor/quickjs-wasmfs-release-sync",
      "@componentor/quickjs-singlefile-cjs-release-sync",
      "@componentor/quickjs-singlefile-cjs-release-asyncify",
      "@componentor/quickjs-emscripten-core",
    ],
    // Don't split into chunks - single file
    splitting: false,
  },
])
