[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten](../README.md) / WorkerCrashError

# Class: WorkerCrashError

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:918

Thrown when a worker crashes unexpectedly.

## Extends

- `Error`

## Constructors

### Constructor

> **new WorkerCrashError**(`taskId`, `originalError?`): `WorkerCrashError`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:923

#### Parameters

##### taskId

`string`

##### originalError?

`Error`

#### Returns

`WorkerCrashError`

#### Overrides

`Error.constructor`

## Properties

### isWorkerCrash

> `readonly` **isWorkerCrash**: `true` = `true`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:922

***

### name

> `readonly` **name**: `"WorkerCrashError"` = `"WorkerCrashError"`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:921

#### Overrides

`Error.name`

***

### originalError?

> `readonly` `optional` **originalError**: `Error`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:920

***

### taskId

> `readonly` **taskId**: `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:919
