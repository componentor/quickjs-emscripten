[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten](../README.md) / WorkerTaskCancelledError

# Class: WorkerTaskCancelledError

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:909

Thrown when a task is cancelled.

## Extends

- `Error`

## Constructors

### Constructor

> **new WorkerTaskCancelledError**(`taskId`): `WorkerTaskCancelledError`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:913

#### Parameters

##### taskId

`string`

#### Returns

`WorkerTaskCancelledError`

#### Overrides

`Error.constructor`

## Properties

### isCancelled

> `readonly` **isCancelled**: `true` = `true`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:912

***

### name

> `readonly` **name**: `"WorkerTaskCancelledError"` = `"WorkerTaskCancelledError"`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:911

#### Overrides

`Error.name`

***

### taskId

> `readonly` **taskId**: `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:910
