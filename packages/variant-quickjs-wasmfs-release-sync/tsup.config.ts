import { extendConfig } from "@componentor/tsconfig/tsup.base.config.js"
export default extendConfig({
  entry: ["src/index.ts", "src/ffi.ts"],
  external: ["@componentor/quickjs-wasmfs-release-sync/emscripten-module"],
  format: ["esm", "cjs"],
  clean: false,
})
