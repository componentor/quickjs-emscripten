[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten](../README.md) / WorkerPoolOptions

# Interface: WorkerPoolOptions

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:18

Configuration options for creating a worker pool.

## Extended by

- [`WorkerEnabledContextOptions`](WorkerEnabledContextOptions.md)

## Properties

### bootstrapCode?

> `optional` **bootstrapCode**: `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:98

JavaScript code to run when initializing each worker's QuickJS context.
Use this to set up polyfills, globals, or other initialization code
that should be available in all worker evaluations.

The code runs once per worker when the worker is initialized.
It has access to the bare QuickJS context (no Node.js APIs by default).

#### Example

```typescript
const pool = await newWorkerPool({
  bootstrapCode: `
    globalThis.myHelper = function(x) { return x * 2; };
    globalThis.Buffer = // ... Buffer polyfill
  `
})
```

***

### contextOptions?

> `optional` **contextOptions**: [`ContextOptions`](ContextOptions.md)

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:44

Context options applied to each worker's QuickJS context.

***

### defaultTimeout?

> `optional` **defaultTimeout**: `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:55

Default timeout in milliseconds for task execution.
0 means no timeout. Default is 0.

***

### forceMultiThreaded?

> `optional` **forceMultiThreaded**: `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:67

If true, throws an error if multi-threading is not supported.
Use this when parallel execution is required for your use case.
Default is false (gracefully falls back to single-threaded mode).

***

### forceSingleThreaded?

> `optional` **forceSingleThreaded**: `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:73

If true, forces single-threaded mode even if multi-threading is supported.
Useful for Node.js ESM environments where worker spawning may be complex.
Default is false.

***

### maxQueueSize?

> `optional` **maxQueueSize**: `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:61

Maximum number of tasks that can be queued.
When exceeded, new tasks are rejected.
0 means unlimited. Default is 0.

***

### opfsMountPath?

> `optional` **opfsMountPath**: `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:40

OPFS mount path when using the "wasmfs" variant.
All workers will mount the same OPFS directory at this path.
Default is "/data".

Only used when `variant` is `"wasmfs"`.

***

### poolSize?

> `optional` **poolSize**: `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:23

Number of workers in the pool.
Defaults to `navigator.hardwareConcurrency` in browsers, or 4 in Node.js.

***

### preWarm?

> `optional` **preWarm**: `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:50

Whether to pre-warm workers on pool creation.
When true, all workers are initialized immediately.
When false (default), workers are initialized lazily on first task.

***

### variant?

> `optional` **variant**: [`WorkerPoolVariant`](../README.md#workerpoolvariant)

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:32

QuickJS variant to use in workers.

- `"singlefile"` (default): Isolated workers, no shared filesystem.
- `"wasmfs"`: Workers share an OPFS-backed filesystem.

When using `"wasmfs"`, you can configure the mount path with `opfsMountPath`.

***

### verbose?

> `optional` **verbose**: `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:79

If true, enables verbose logging to console for debugging.
Logs worker creation, task dispatch, completion, and timing information.
Default is false.

***

### wasmLocation?

> `optional` **wasmLocation**: `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:106

URL or path to the WASM file for workers to load.
Required when workers can't resolve the WASM file from their context.

For browser environments, this should be an absolute URL accessible
from the worker (e.g., "/wasm/quickjs-wasmfs.wasm").

***

### workerUrl?

> `optional` **workerUrl**: `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:124

URL or path to the worker script.
Use this when bundlers break the default import.meta.url resolution.

For browser environments, this should be an absolute URL or path
(e.g., "/workers/worker-entry.mjs").

When not provided, the library resolves the worker script using
`new URL("./worker/worker-entry.mjs", import.meta.url)`.

#### Example

```typescript
const pool = await newWorkerPool({
  workerUrl: "/workers/worker-entry.mjs"
})
```
