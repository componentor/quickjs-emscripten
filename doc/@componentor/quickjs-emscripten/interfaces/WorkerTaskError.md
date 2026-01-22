[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten](../README.md) / WorkerTaskError

# Interface: WorkerTaskError

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:124

Error information from a failed worker task.

## Properties

### isCancelled?

> `optional` **isCancelled**: `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:136

True if the task was cancelled

***

### isTimeout?

> `optional` **isTimeout**: `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:132

True if the error was caused by a timeout

***

### isWorkerCrash?

> `optional` **isWorkerCrash**: `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:134

True if the worker crashed unexpectedly

***

### message

> **message**: `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:128

Error message

***

### name

> **name**: `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:126

Error name (e.g., "Error", "TypeError")

***

### stack?

> `optional` **stack**: `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:130

Stack trace if available
