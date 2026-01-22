[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten](../README.md) / WorkerCrashError

# Class: WorkerCrashError

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:936

Thrown when a worker crashes unexpectedly.

## Extends

- `Error`

## Constructors

### Constructor

> **new WorkerCrashError**(`taskId`, `originalError?`): `WorkerCrashError`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:941

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

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:940

***

### name

> `readonly` **name**: `"WorkerCrashError"` = `"WorkerCrashError"`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:939

#### Overrides

`Error.name`

***

### originalError?

> `readonly` `optional` **originalError**: `Error`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:938

***

### taskId

> `readonly` **taskId**: `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:937
