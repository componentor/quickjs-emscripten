[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@jitl/quickjs-ffi-types](../README.md) / EmscriptenModule

# Interface: EmscriptenModule

Defined in: [emscripten-types.ts:130](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L130)

Typings for the features we use to interface with our Emscripten build of
QuickJS.

## Extends

- [`EmscriptenModuleLoaderOptions`](EmscriptenModuleLoaderOptions.md)

## Extended by

- [`QuickJSEmscriptenModule`](QuickJSEmscriptenModule.md)
- [`QuickJSAsyncEmscriptenModule`](QuickJSAsyncEmscriptenModule.md)

## Properties

### FAST\_MEMORY

> **FAST\_MEMORY**: `number`

Defined in: [emscripten-types.ts:168](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L168)

***

### HEAP16

> **HEAP16**: `Int16Array`

Defined in: [emscripten-types.ts:158](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L158)

***

### HEAP32

> **HEAP32**: `Int32Array`

Defined in: [emscripten-types.ts:159](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L159)

***

### HEAP8

> **HEAP8**: `Int8Array`

Defined in: [emscripten-types.ts:157](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L157)

***

### HEAPF32

> **HEAPF32**: `Float32Array`

Defined in: [emscripten-types.ts:163](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L163)

***

### HEAPF64

> **HEAPF64**: `Float64Array`

Defined in: [emscripten-types.ts:164](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L164)

***

### HEAPU16

> **HEAPU16**: `Uint16Array`

Defined in: [emscripten-types.ts:161](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L161)

***

### HEAPU32

> **HEAPU32**: `Uint32Array`

Defined in: [emscripten-types.ts:162](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L162)

***

### HEAPU8

> **HEAPU8**: `Uint8Array`

Defined in: [emscripten-types.ts:160](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L160)

***

### TOTAL\_MEMORY

> **TOTAL\_MEMORY**: `number`

Defined in: [emscripten-types.ts:167](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L167)

***

### TOTAL\_STACK

> **TOTAL\_STACK**: `number`

Defined in: [emscripten-types.ts:166](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L166)

***

### wasmBinary?

> `optional` **wasmBinary**: `ArrayBuffer`

Defined in: [emscripten-types.ts:104](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L104)

Compile this to WebAssembly.Module

#### Inherited from

[`EmscriptenModuleLoaderOptions`](EmscriptenModuleLoaderOptions.md).[`wasmBinary`](EmscriptenModuleLoaderOptions.md#wasmbinary)

***

### wasmMemory?

> `optional` **wasmMemory**: `Memory`

Defined in: [emscripten-types.ts:107](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L107)

If provided, use this WebAssembly.Memory instead of an automatically created one.

#### Inherited from

[`EmscriptenModuleLoaderOptions`](EmscriptenModuleLoaderOptions.md).[`wasmMemory`](EmscriptenModuleLoaderOptions.md#wasmmemory)

## Methods

### \_free()

> **\_free**(`ptr`): `void`

Defined in: [emscripten-types.ts:148](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L148)

#### Parameters

##### ptr

`number`

#### Returns

`void`

***

### \_malloc()

> **\_malloc**(`size`): `number`

Defined in: [emscripten-types.ts:147](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L147)

#### Parameters

##### size

`number`

#### Returns

`number`

***

### cwrap()

> **cwrap**(`ident`, `returnType`, `argTypes`, `opts?`): (...`args`) => `any`

Defined in: [emscripten-types.ts:149](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L149)

#### Parameters

##### ident

`string`

##### returnType

`ValueType` | `null`

##### argTypes

`ValueType`[]

##### opts?

`CCallOpts`

#### Returns

> (...`args`): `any`

##### Parameters

###### args

...`any`[]

##### Returns

`any`

***

### instantiateWasm()?

> `optional` **instantiateWasm**(`imports`, `onSuccess`): `Exports` \| `Promise`\<`Exports`\>

Defined in: [emscripten-types.ts:110](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L110)

Create an instance of the WASM module, call onSuccess(instance), then return instance.exports

#### Parameters

##### imports

`WebAssembly.Imports`

##### onSuccess

(`instance`) => `void`

#### Returns

`Exports` \| `Promise`\<`Exports`\>

#### Inherited from

[`EmscriptenModuleLoaderOptions`](EmscriptenModuleLoaderOptions.md).[`instantiateWasm`](EmscriptenModuleLoaderOptions.md#instantiatewasm)

***

### lengthBytesUTF8()

> **lengthBytesUTF8**(`str`): `number`

Defined in: [emscripten-types.ts:145](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L145)

#### Parameters

##### str

`string`

#### Returns

`number`

***

### locateFile()?

> `optional` **locateFile**(`fileName`, `prefix`): `string`

Defined in: [emscripten-types.ts:97](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L97)

If set, this method will be called when the runtime needs to load a file,
such as a .wasm WebAssembly file, .mem memory init file, or a file
generated by the file packager.

The function receives two parameters:

- `fileName`, the relative path to the file as configured in build
process, eg `"emscripten-module.wasm"`.
- `prefix` (path to the main JavaScript file’s directory). This may be `''`
(empty string) in some cases if the Emscripten Javascript code can't locate
itself. Try logging it in your environment.

It should return the actual URI or path to the requested file.

This lets you host file packages on a different location than the directory
of the JavaScript file (which is the default expectation), for example if
you want to host them on a CDN.

#### Parameters

##### fileName

`string`

##### prefix

`string`

Often `''` (empty string)

#### Returns

`string`

#### Inherited from

[`EmscriptenModuleLoaderOptions`](EmscriptenModuleLoaderOptions.md).[`locateFile`](EmscriptenModuleLoaderOptions.md#locatefile)

***

### monitorRunDependencies()?

> `optional` **monitorRunDependencies**(`left`): `void`

Defined in: [emscripten-types.ts:116](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L116)

Called by emscripten as dependencies blocking initialization are added or fulfilled. May only be called in debug builds.

#### Parameters

##### left

`number`

#### Returns

`void`

#### Inherited from

[`EmscriptenModuleLoaderOptions`](EmscriptenModuleLoaderOptions.md).[`monitorRunDependencies`](EmscriptenModuleLoaderOptions.md#monitorrundependencies)

***

### stringToUTF8()

> **stringToUTF8**(`str`, `outPtr`, `maxBytesToRead?`): `void`

Defined in: [emscripten-types.ts:139](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L139)

Write JS `str` to HeapChar pointer.
https://emscripten.org/docs/api_reference/preamble.js.html#stringToUTF8

#### Parameters

##### str

`string`

##### outPtr

[`OwnedHeapCharPointer`](../README.md#ownedheapcharpointer)

##### maxBytesToRead?

`number`

#### Returns

`void`

***

### UTF8ToString()

> **UTF8ToString**(`ptr`, `maxBytesToRead?`): `string`

Defined in: [emscripten-types.ts:144](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L144)

HeapChar to JS string.
https://emscripten.org/docs/api_reference/preamble.js.html#UTF8ToString

#### Parameters

##### ptr

[`BorrowedHeapCharPointer`](../README.md#borrowedheapcharpointer)

##### maxBytesToRead?

`number`

#### Returns

`string`
