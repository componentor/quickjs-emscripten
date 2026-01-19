import type { QuickJSAsyncVariant } from "@componentor/quickjs-ffi-types"

/**
 * ### @componentor/quickjs-wasmfs-release-sync
 *
 * QuickJS variant with WasmFS and OPFS support for native filesystem access
 * in browsers. Uses ASYNCIFY for non-blocking OPFS backend creation.
 *
 * | Variable            |    Setting                     |    Description    |
 * | --                  | --                             | --                |
 * | library             | quickjs             | The original [bellard/quickjs](https://github.com/bellard/quickjs) library. |
 * | releaseMode         | release         | Optimized for performance. |
 * | syncMode            | asyncify        | Uses ASYNCIFY for OPFS backend (required for non-blocking OPFS operations). |
 * | emscriptenInclusion | wasm | Has a separate .wasm file with WasmFS + OPFS support. |
 * | exports             | browser                  | Browser-only (OPFS is a browser API) |
 *
 */
const variant: QuickJSAsyncVariant = {
  type: "async",
  importFFI: () => import("./ffi.js").then((mod) => mod.QuickJSAsyncFFI),
  importModuleLoader: () =>
    import("@componentor/quickjs-wasmfs-release-sync/emscripten-module").then((mod) => mod.default),
} as const

export default variant
