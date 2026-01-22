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
  // MUST be fully self-contained because browser workers can't resolve bare imports
  {
    entry: ["src/worker-scripts/worker-entry.ts"],
    outDir: "dist/worker",
    sourcemap: true,
    dts: false, // Workers don't need types
    format: ["esm"], // Browsers use ESM workers
    minifySyntax: true,
    minifyWhitespace: true,
    tsconfig: "./tsconfig.build.json",
    // NO external packages - browser workers can't resolve bare specifiers
    // Everything must be bundled into the worker script
    external: [],
    // Explicitly include all quickjs packages in the bundle
    noExternal: [
      "@componentor/quickjs-emscripten-core",
      "@componentor/quickjs-wasmfs-release-sync",
      "@componentor/quickjs-singlefile-cjs-release-sync",
      "@componentor/quickjs-singlefile-cjs-release-asyncify",
    ],
    // Don't split into chunks - single file
    splitting: false,
    // Disable tree shaking to preserve all exports
    treeshake: false,
  },
])
