[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten](../README.md) / TaskHandle

# Interface: TaskHandle\<T\>

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:152

Handle to a pending task, allowing cancellation and status checking.

## Type Parameters

### T

`T` = `unknown`

## Properties

### pending

> `readonly` **pending**: `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:158

Whether the task is still pending (queued or executing)

***

### promise

> `readonly` **promise**: `Promise`\<[`WorkerTaskResult`](../README.md#workertaskresult)\<`T`\>\>

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:154

Promise that resolves when the task completes

***

### taskId

> `readonly` **taskId**: `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:160

Unique identifier for this task

## Methods

### cancel()

> **cancel**(): `void`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:156

Cancel the task. If queued, removes from queue. If executing, attempts to abort.

#### Returns

`void`
