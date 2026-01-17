[**quickjs-emscripten**](../../README.md)

***

[quickjs-emscripten](../../packages.md) / [quickjs-emscripten-core](../README.md) / QuickJSAsyncEmscriptenModule

# Interface: QuickJSAsyncEmscriptenModule

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:240](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L240)

Typings for the features we use to interface with our Emscripten build of
QuickJS.

## Extends

- [`EmscriptenModule`](EmscriptenModule.md)

## Properties

### callbacks

> **callbacks**: `EmscriptenModuleCallbacks`

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:243](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L243)

***

### FAST\_MEMORY

> **FAST\_MEMORY**: `number`

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:168](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L168)

#### Inherited from

[`EmscriptenModule`](EmscriptenModule.md).[`FAST_MEMORY`](EmscriptenModule.md#fast_memory)

***

### HEAP16

> **HEAP16**: `Int16Array`

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:158](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L158)

#### Inherited from

[`EmscriptenModule`](EmscriptenModule.md).[`HEAP16`](EmscriptenModule.md#heap16)

***

### HEAP32

> **HEAP32**: `Int32Array`

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:159](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L159)

#### Inherited from

[`EmscriptenModule`](EmscriptenModule.md).[`HEAP32`](EmscriptenModule.md#heap32)

***

### HEAP8

> **HEAP8**: `Int8Array`

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:157](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L157)

#### Inherited from

[`EmscriptenModule`](EmscriptenModule.md).[`HEAP8`](EmscriptenModule.md#heap8)

***

### HEAPF32

> **HEAPF32**: `Float32Array`

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:163](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L163)

#### Inherited from

[`EmscriptenModule`](EmscriptenModule.md).[`HEAPF32`](EmscriptenModule.md#heapf32)

***

### HEAPF64

> **HEAPF64**: `Float64Array`

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:164](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L164)

#### Inherited from

[`EmscriptenModule`](EmscriptenModule.md).[`HEAPF64`](EmscriptenModule.md#heapf64)

***

### HEAPU16

> **HEAPU16**: `Uint16Array`

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:161](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L161)

#### Inherited from

[`EmscriptenModule`](EmscriptenModule.md).[`HEAPU16`](EmscriptenModule.md#heapu16)

***

### HEAPU32

> **HEAPU32**: `Uint32Array`

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:162](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L162)

#### Inherited from

[`EmscriptenModule`](EmscriptenModule.md).[`HEAPU32`](EmscriptenModule.md#heapu32)

***

### HEAPU8

> **HEAPU8**: `Uint8Array`

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:160](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L160)

#### Inherited from

[`EmscriptenModule`](EmscriptenModule.md).[`HEAPU8`](EmscriptenModule.md#heapu8)

***

### TOTAL\_MEMORY

> **TOTAL\_MEMORY**: `number`

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:167](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L167)

#### Inherited from

[`EmscriptenModule`](EmscriptenModule.md).[`TOTAL_MEMORY`](EmscriptenModule.md#total_memory)

***

### TOTAL\_STACK

> **TOTAL\_STACK**: `number`

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:166](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L166)

#### Inherited from

[`EmscriptenModule`](EmscriptenModule.md).[`TOTAL_STACK`](EmscriptenModule.md#total_stack)

***

### type

> **type**: `"async"`

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:242](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L242)

#### Todo

Implement this field

***

### wasmBinary?

> `optional` **wasmBinary**: `ArrayBuffer`

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:104](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L104)

Compile this to WebAssembly.Module

#### Inherited from

[`EmscriptenModule`](EmscriptenModule.md).[`wasmBinary`](EmscriptenModule.md#wasmbinary)

***

### wasmMemory?

> `optional` **wasmMemory**: `Memory`

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:107](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L107)

If provided, use this WebAssembly.Memory instead of an automatically created one.

#### Inherited from

[`EmscriptenModule`](EmscriptenModule.md).[`wasmMemory`](EmscriptenModule.md#wasmmemory)

## Methods

### \_free()

> **\_free**(`ptr`): `void`

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:148](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L148)

#### Parameters

##### ptr

`number`

#### Returns

`void`

#### Inherited from

[`EmscriptenModule`](EmscriptenModule.md).[`_free`](EmscriptenModule.md#_free)

***

### \_malloc()

> **\_malloc**(`size`): `number`

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:147](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L147)

#### Parameters

##### size

`number`

#### Returns

`number`

#### Inherited from

[`EmscriptenModule`](EmscriptenModule.md).[`_malloc`](EmscriptenModule.md#_malloc)

***

### cwrap()

> **cwrap**(`ident`, `returnType`, `argTypes`, `opts?`): (...`args`) => `any`

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:149](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L149)

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

#### Inherited from

[`EmscriptenModule`](EmscriptenModule.md).[`cwrap`](EmscriptenModule.md#cwrap)

***

### instantiateWasm()?

> `optional` **instantiateWasm**(`imports`, `onSuccess`): `Exports` \| `Promise`\<`Exports`\>

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:110](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L110)

Create an instance of the WASM module, call onSuccess(instance), then return instance.exports

#### Parameters

##### imports

`WebAssembly.Imports`

##### onSuccess

(`instance`) => `void`

#### Returns

`Exports` \| `Promise`\<`Exports`\>

#### Inherited from

[`EmscriptenModule`](EmscriptenModule.md).[`instantiateWasm`](EmscriptenModule.md#instantiatewasm)

***

### lengthBytesUTF8()

> **lengthBytesUTF8**(`str`): `number`

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:145](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L145)

#### Parameters

##### str

`string`

#### Returns

`number`

#### Inherited from

[`EmscriptenModule`](EmscriptenModule.md).[`lengthBytesUTF8`](EmscriptenModule.md#lengthbytesutf8)

***

### locateFile()?

> `optional` **locateFile**(`fileName`, `prefix`): `string`

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:97](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L97)

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

[`EmscriptenModule`](EmscriptenModule.md).[`locateFile`](EmscriptenModule.md#locatefile)

***

### monitorRunDependencies()?

> `optional` **monitorRunDependencies**(`left`): `void`

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:116](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L116)

Called by emscripten as dependencies blocking initialization are added or fulfilled. May only be called in debug builds.

#### Parameters

##### left

`number`

#### Returns

`void`

#### Inherited from

[`EmscriptenModule`](EmscriptenModule.md).[`monitorRunDependencies`](EmscriptenModule.md#monitorrundependencies)

***

### stringToUTF8()

> **stringToUTF8**(`str`, `outPtr`, `maxBytesToRead?`): `void`

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:139](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L139)

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

#### Inherited from

[`EmscriptenModule`](EmscriptenModule.md).[`stringToUTF8`](EmscriptenModule.md#stringtoutf8)

***

### UTF8ToString()

> **UTF8ToString**(`ptr`, `maxBytesToRead?`): `string`

Defined in: [packages/quickjs-ffi-types/src/emscripten-types.ts:144](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/emscripten-types.ts#L144)

HeapChar to JS string.
https://emscripten.org/docs/api_reference/preamble.js.html#UTF8ToString

#### Parameters

##### ptr

[`BorrowedHeapCharPointer`](../README.md#borrowedheapcharpointer)

##### maxBytesToRead?

`number`

#### Returns

`string`

#### Inherited from

[`EmscriptenModule`](EmscriptenModule.md).[`UTF8ToString`](EmscriptenModule.md#utf8tostring)
