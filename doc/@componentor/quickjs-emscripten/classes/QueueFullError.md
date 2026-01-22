[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten](../README.md) / QueueFullError

# Class: QueueFullError

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:935

Thrown when the task queue is full and cannot accept more tasks.

## Extends

- `Error`

## Constructors

### Constructor

> **new QueueFullError**(`maxSize`): `QueueFullError`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:938

#### Parameters

##### maxSize

`number`

#### Returns

`QueueFullError`

#### Overrides

`Error.constructor`

## Properties

### maxSize

> `readonly` **maxSize**: `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:936

***

### name

> `readonly` **name**: `"QueueFullError"` = `"QueueFullError"`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:937

#### Overrides

`Error.name`
