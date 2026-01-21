# @componentor/quickjs-wasmfs-release-sync

QuickJS variant with WasmFS and OPFS support for native filesystem access in browsers without JS boundary crossing.

## Features

- **WasmFS**: Filesystem operations run entirely inside Wasm, eliminating JS↔Wasm boundary overhead
- **OPFS Backend**: Persistent storage via Origin Private File System
- **File Watching**: Polling-based directory watcher for HMR support
- **Browser-Only**: Optimized for browser environments (OPFS is a browser API)

## Variant Settings

| Variable            | Setting | Description                                                        |
| ------------------- | ------- | ------------------------------------------------------------------ |
| library             | quickjs | The original [bellard/quickjs](https://github.com/bellard/quickjs) |
| releaseMode         | release | Optimized for performance                                          |
| syncMode            | sync    | Synchronous execution mode                                         |
| emscriptenInclusion | wasm    | Separate .wasm file with WasmFS + OPFS support                     |
| exports             | browser | Browser-only (OPFS is a browser API)                               |

## Usage

```typescript
import variant from "@componentor/quickjs-wasmfs-release-sync"
import { newQuickJSWASMModuleFromVariant } from "quickjs-emscripten"

const QuickJS = await newQuickJSWASMModuleFromVariant(variant)

// Mount OPFS at /opfs
await QuickJS.getWasmModule().mountOPFS("/opfs")

// Now filesystem operations inside QuickJS can access /opfs/*
// without crossing the JS↔Wasm boundary
```

## File Watching (for HMR)

```typescript
const wasm = QuickJS.getWasmModule()

// Watch a directory for changes (polling-based)
const stopWatching = wasm.watchDirectory(
  "/opfs/src",
  (changes) => {
    for (const { path, type } of changes) {
      console.log(`${type}: ${path}`)
    }
  },
  100,
) // poll every 100ms

// Stop watching when done
stopWatching()
```

## Performance Benefits

Traditional architecture (with @componentor/fs):

```
QuickJS (Wasm) ↔ JS Bridge ↔ @componentor/fs ↔ OPFS
```

WasmFS architecture:

```
QuickJS (Wasm) → WasmFS (same Wasm instance) → OPFS
```

The WasmFS approach eliminates the expensive JS↔Wasm boundary crossing for every filesystem operation, resulting in significantly faster I/O performance for file-heavy workloads.

## License

MIT
