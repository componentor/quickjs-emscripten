[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten](../README.md) / WorkerTask

# Interface: WorkerTask

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:129

A task to execute in a worker.

## Properties

### code

> **code**: `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:131

JavaScript code to evaluate

***

### filename?

> `optional` **filename**: `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:133

Optional filename for error stack traces

***

### priority?

> `optional` **priority**: `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:137

Priority: higher numbers execute first. Default is 0.

***

### timeout?

> `optional` **timeout**: `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:135

Timeout in milliseconds for this specific task (overrides pool default)
