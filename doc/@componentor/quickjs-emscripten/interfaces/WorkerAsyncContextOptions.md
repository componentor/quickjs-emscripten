[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten](../README.md) / WorkerAsyncContextOptions

# Interface: WorkerAsyncContextOptions

Defined in: [packages/quickjs-emscripten/src/mod.ts:208](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten/src/mod.ts#L208)

Options for creating a worker-enabled async context.

## Extends

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

#### Inherited from

[`WorkerEnabledContextOptions`](WorkerEnabledContextOptions.md).[`bootstrapCode`](WorkerEnabledContextOptions.md#bootstrapcode)

***

### contextOptions?

> `optional` **contextOptions**: [`ContextOptions`](ContextOptions.md)

Defined in: [packages/quickjs-emscripten/src/mod.ts:212](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten/src/mod.ts#L212)

Context options for the local QuickJS context.

#### Overrides

[`WorkerEnabledContextOptions`](WorkerEnabledContextOptions.md).[`contextOptions`](WorkerEnabledContextOptions.md#contextoptions)

***

### defaultTimeout?

> `optional` **defaultTimeout**: `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:55

Default timeout in milliseconds for task execution.
0 means no timeout. Default is 0.

#### Inherited from

[`WorkerEnabledContextOptions`](WorkerEnabledContextOptions.md).[`defaultTimeout`](WorkerEnabledContextOptions.md#defaulttimeout)

***

### evalStrategy?

> `optional` **evalStrategy**: `"workers"` \| `"local"` \| `"auto"`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:581

Strategy for routing evalCodeAsync calls.
- "workers": Always route to workers (default when pool available)
- "local": Always use local context
- "auto": Use workers for standalone evals, local for code that needs handles

#### Default

```ts
"workers"
```

#### Inherited from

[`WorkerEnabledContextOptions`](WorkerEnabledContextOptions.md).[`evalStrategy`](WorkerEnabledContextOptions.md#evalstrategy)

***

### forceMultiThreaded?

> `optional` **forceMultiThreaded**: `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:67

If true, throws an error if multi-threading is not supported.
Use this when parallel execution is required for your use case.
Default is false (gracefully falls back to single-threaded mode).

#### Inherited from

[`WorkerEnabledContextOptions`](WorkerEnabledContextOptions.md).[`forceMultiThreaded`](WorkerEnabledContextOptions.md#forcemultithreaded)

***

### forceSingleThreaded?

> `optional` **forceSingleThreaded**: `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:73

If true, forces single-threaded mode even if multi-threading is supported.
Useful for Node.js ESM environments where worker spawning may be complex.
Default is false.

#### Inherited from

[`WorkerEnabledContextOptions`](WorkerEnabledContextOptions.md).[`forceSingleThreaded`](WorkerEnabledContextOptions.md#forcesinglethreaded)

***

### maxQueueSize?

> `optional` **maxQueueSize**: `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:61

Maximum number of tasks that can be queued.
When exceeded, new tasks are rejected.
0 means unlimited. Default is 0.

#### Inherited from

[`WorkerEnabledContextOptions`](WorkerEnabledContextOptions.md).[`maxQueueSize`](WorkerEnabledContextOptions.md#maxqueuesize)

***

### opfsMountPath?

> `optional` **opfsMountPath**: `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:40

OPFS mount path when using the "wasmfs" variant.
All workers will mount the same OPFS directory at this path.
Default is "/data".

Only used when `variant` is `"wasmfs"`.

#### Inherited from

[`WorkerEnabledContextOptions`](WorkerEnabledContextOptions.md).[`opfsMountPath`](WorkerEnabledContextOptions.md#opfsmountpath)

***

### poolSize?

> `optional` **poolSize**: `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:23

Number of workers in the pool.
Defaults to `navigator.hardwareConcurrency` in browsers, or 4 in Node.js.

#### Inherited from

[`WorkerEnabledContextOptions`](WorkerEnabledContextOptions.md).[`poolSize`](WorkerEnabledContextOptions.md#poolsize)

***

### preWarm?

> `optional` **preWarm**: `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:50

Whether to pre-warm workers on pool creation.
When true, all workers are initialized immediately.
When false (default), workers are initialized lazily on first task.

#### Inherited from

[`WorkerEnabledContextOptions`](WorkerEnabledContextOptions.md).[`preWarm`](WorkerEnabledContextOptions.md#prewarm)

***

### useSession?

> `optional` **useSession**: `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:573

Whether to use a session for sequential evalCodeAsync calls.
When true, all evalCodeAsync calls go to the same worker,
preserving state (variables, functions) across calls.
When false (default), each eval may go to a different worker (parallel execution).

For shared state across parallel workers, use `bootstrapCode` instead.

#### Default

```ts
false
```

#### Inherited from

[`WorkerEnabledContextOptions`](WorkerEnabledContextOptions.md).[`useSession`](WorkerEnabledContextOptions.md#usesession)

***

### variant?

> `optional` **variant**: [`WorkerPoolVariant`](../README.md#workerpoolvariant)

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:32

QuickJS variant to use in workers.

- `"singlefile"` (default): Isolated workers, no shared filesystem.
- `"wasmfs"`: Workers share an OPFS-backed filesystem.

When using `"wasmfs"`, you can configure the mount path with `opfsMountPath`.

#### Inherited from

[`WorkerEnabledContextOptions`](WorkerEnabledContextOptions.md).[`variant`](WorkerEnabledContextOptions.md#variant)

***

### verbose?

> `optional` **verbose**: `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:79

If true, enables verbose logging to console for debugging.
Logs worker creation, task dispatch, completion, and timing information.
Default is false.

#### Inherited from

[`WorkerEnabledContextOptions`](WorkerEnabledContextOptions.md).[`verbose`](WorkerEnabledContextOptions.md#verbose)

***

### wasmLocation?

> `optional` **wasmLocation**: `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:106

URL or path to the WASM file for workers to load.
Required when workers can't resolve the WASM file from their context.

For browser environments, this should be an absolute URL accessible
from the worker (e.g., "/wasm/quickjs-wasmfs.wasm").

#### Inherited from

[`WorkerEnabledContextOptions`](WorkerEnabledContextOptions.md).[`wasmLocation`](WorkerEnabledContextOptions.md#wasmlocation)

***

### workerOnly?

> `optional` **workerOnly**: `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:562

If true, only use workers for evalCodeAsync (no local context).
Useful when you only need code evaluation without handle operations.

#### Default

```ts
false
```

#### Inherited from

[`WorkerEnabledContextOptions`](WorkerEnabledContextOptions.md).[`workerOnly`](WorkerEnabledContextOptions.md#workeronly)
