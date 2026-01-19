[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten](../README.md) / QuickJSSyncVariant

# Interface: QuickJSSyncVariant

Defined in: packages/quickjs-ffi-types/dist/index.d.ts:529

A standard (sync) build variant.

quickjs-emscripten provides multiple build variants of the core WebAssembly
module. These variants are each intended for a different use case.

To create an instance of the library using a specific build variant, pass the
build variant to [newQuickJSWASMModule](../README.md#newquickjswasmmodule) or [newQuickJSAsyncWASMModule](../README.md#newquickjsasyncwasmmodule).

## Properties

### importFFI()

> `readonly` **importFFI**: () => `Promise`\<(`module`) => [`QuickJSFFI`](QuickJSFFI.md)\>

Defined in: packages/quickjs-ffi-types/dist/index.d.ts:531

#### Returns

`Promise`\<(`module`) => [`QuickJSFFI`](QuickJSFFI.md)\>

***

### importModuleLoader()

> `readonly` **importModuleLoader**: () => `Promise`\<`EmscriptenImport`\<[`QuickJSEmscriptenModule`](QuickJSEmscriptenModule.md)\>\>

Defined in: packages/quickjs-ffi-types/dist/index.d.ts:532

#### Returns

`Promise`\<`EmscriptenImport`\<[`QuickJSEmscriptenModule`](QuickJSEmscriptenModule.md)\>\>

***

### type

> `readonly` **type**: `"sync"`

Defined in: packages/quickjs-ffi-types/dist/index.d.ts:530
