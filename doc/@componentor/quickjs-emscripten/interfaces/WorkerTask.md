[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten](../README.md) / WorkerTask

# Interface: WorkerTask

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:111

A task to execute in a worker.

## Properties

### code

> **code**: `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:113

JavaScript code to evaluate

***

### filename?

> `optional` **filename**: `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:115

Optional filename for error stack traces

***

### priority?

> `optional` **priority**: `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:119

Priority: higher numbers execute first. Default is 0.

***

### timeout?

> `optional` **timeout**: `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:117

Timeout in milliseconds for this specific task (overrides pool default)
