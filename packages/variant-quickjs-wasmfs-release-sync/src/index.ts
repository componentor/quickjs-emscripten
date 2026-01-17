import type { QuickJSSyncVariant } from "@jitl/quickjs-ffi-types"

/**
 * ### @componentor/quickjs-wasmfs-release-sync
 *
 * QuickJS variant with WasmFS and OPFS support for native filesystem access
 * in browsers without JS boundary crossing.
 *
 * | Variable            |    Setting                     |    Description    |
 * | --                  | --                             | --                |
 * | library             | quickjs             | The original [bellard/quickjs](https://github.com/bellard/quickjs) library. |
 * | releaseMode         | release         | Optimized for performance. |
 * | syncMode            | sync            | Synchronous execution mode. |
 * | emscriptenInclusion | wasm | Has a separate .wasm file with WasmFS + OPFS support. |
 * | exports             | browser                  | Browser-only (OPFS is a browser API) |
 *
 */
const variant: QuickJSSyncVariant = {
  type: "sync",
  importFFI: () => import("./ffi.js").then((mod) => mod.QuickJSFFI),
  importModuleLoader: () =>
    import("@componentor/quickjs-wasmfs-release-sync/emscripten-module").then((mod) => mod.default),
} as const

export default variant
