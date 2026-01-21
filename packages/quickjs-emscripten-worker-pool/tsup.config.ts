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
  },
  // Worker script - FULLY self-contained bundle for browser Web Workers
  // This bundles ALL dependencies so the worker can load as a standalone file
  {
    entry: ["src/worker-scripts/worker-entry.ts"],
    outDir: "dist/worker",
    sourcemap: true,
    dts: false, // Workers don't need types
    format: ["esm"], // Browsers use ESM workers
    minifySyntax: true,
    minifyWhitespace: true,
    tsconfig: "./tsconfig.build.json",
    // Bundle EVERYTHING into the worker - make it fully self-contained
    noExternal: [/.*/],
    // Don't split into chunks - single file
    splitting: false,
  },
])
