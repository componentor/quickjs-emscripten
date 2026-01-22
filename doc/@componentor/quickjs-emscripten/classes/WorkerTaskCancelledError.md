[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten](../README.md) / WorkerTaskCancelledError

# Class: WorkerTaskCancelledError

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:927

Thrown when a task is cancelled.

## Extends

- `Error`

## Constructors

### Constructor

> **new WorkerTaskCancelledError**(`taskId`): `WorkerTaskCancelledError`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:931

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

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:930

***

### name

> `readonly` **name**: `"WorkerTaskCancelledError"` = `"WorkerTaskCancelledError"`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:929

#### Overrides

`Error.name`

***

### taskId

> `readonly` **taskId**: `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:928
