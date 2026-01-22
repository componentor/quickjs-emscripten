[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten](../README.md) / WorkerTaskError

# Interface: WorkerTaskError

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:142

Error information from a failed worker task.

## Properties

### isCancelled?

> `optional` **isCancelled**: `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:154

True if the task was cancelled

***

### isTimeout?

> `optional` **isTimeout**: `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:150

True if the error was caused by a timeout

***

### isWorkerCrash?

> `optional` **isWorkerCrash**: `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:152

True if the worker crashed unexpectedly

***

### message

> **message**: `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:146

Error message

***

### name

> **name**: `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:144

Error name (e.g., "Error", "TypeError")

***

### stack?

> `optional` **stack**: `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:148

Stack trace if available
