[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten](../README.md) / WorkerTaskTimeoutError

# Class: WorkerTaskTimeoutError

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:917

Thrown when a task times out.

## Extends

- `Error`

## Constructors

### Constructor

> **new WorkerTaskTimeoutError**(`taskId`, `timeoutMs`): `WorkerTaskTimeoutError`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:922

#### Parameters

##### taskId

`string`

##### timeoutMs

`number`

#### Returns

`WorkerTaskTimeoutError`

#### Overrides

`Error.constructor`

## Properties

### isTimeout

> `readonly` **isTimeout**: `true` = `true`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:921

***

### name

> `readonly` **name**: `"WorkerTaskTimeoutError"` = `"WorkerTaskTimeoutError"`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:920

#### Overrides

`Error.name`

***

### taskId

> `readonly` **taskId**: `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:918

***

### timeoutMs

> `readonly` **timeoutMs**: `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:919
