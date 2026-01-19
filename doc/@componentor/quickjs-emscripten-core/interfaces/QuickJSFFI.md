[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten-core](../README.md) / QuickJSFFI

# Interface: QuickJSFFI

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:36](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L36)

Low-level FFI bindings to QuickJS's Emscripten module.
See instead [QuickJSContext](../classes/QuickJSContext.md), the public Javascript interface exposed by this
library.

## Unstable

The FFI interface is considered private and may change.

## Properties

### DEBUG

> `readonly` **DEBUG**: `boolean`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:38](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L38)

Set at compile time.

***

### QTS\_ArgvGetJSValueConstPointer()

> **QTS\_ArgvGetJSValueConstPointer**: (`argv`, `index`) => [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:199](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L199)

#### Parameters

##### argv

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

##### index

`number`

#### Returns

[`JSValueConstPointer`](../README.md#jsvalueconstpointer)

***

### QTS\_bjson\_decode()

> **QTS\_bjson\_decode**: (`ctx`, `data`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:211](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L211)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### data

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_bjson\_encode()

> **QTS\_bjson\_encode**: (`ctx`, `val`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:207](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L207)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### val

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_BuildIsAsyncify()

> **QTS\_BuildIsAsyncify**: () => `number`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:197](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L197)

#### Returns

`number`

***

### QTS\_BuildIsDebug()

> **QTS\_BuildIsDebug**: () => `number`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:196](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L196)

#### Returns

`number`

***

### QTS\_BuildIsSanitizeLeak()

> **QTS\_BuildIsSanitizeLeak**: () => `number`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:46](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L46)

#### Returns

`number`

***

### QTS\_Call()

> **QTS\_Call**: (`ctx`, `func_obj`, `this_obj`, `argc`, `argv_ptrs`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:140](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L140)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### func\_obj

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

##### this\_obj

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

##### argc

`number`

##### argv\_ptrs

[`JSValueConstPointerPointer`](../README.md#jsvalueconstpointerpointer)

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_DecodeBytecode()

> **QTS\_DecodeBytecode**: (`ctx`, `data`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:223](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L223)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### data

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_DefineProp()

> **QTS\_DefineProp**: (`ctx`, `this_val`, `prop_name`, `prop_value`, `get`, `set`, `configurable`, `enumerable`, `has_value`) => `void`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:122](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L122)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### this\_val

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

##### prop\_name

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

##### prop\_value

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

##### get

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

##### set

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

##### configurable

`boolean`

##### enumerable

`boolean`

##### has\_value

`boolean`

#### Returns

`void`

***

### QTS\_Dump()

> **QTS\_Dump**: (`ctx`, `obj`) => [`JSBorrowedCharPointer`](../README.md#jsborrowedcharpointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:149](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L149)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### obj

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

#### Returns

[`JSBorrowedCharPointer`](../README.md#jsborrowedcharpointer)

***

### QTS\_DupValuePointer()

> **QTS\_DupValuePointer**: (`ctx`, `val`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:60](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L60)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### val

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_EncodeBytecode()

> **QTS\_EncodeBytecode**: (`ctx`, `val`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:219](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L219)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### val

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_Eval()

> **QTS\_Eval**: (`ctx`, `js_code`, `js_code_length`, `filename`, `detectModule`, `evalFlags`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:153](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L153)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### js\_code

[`BorrowedHeapCharPointer`](../README.md#borrowedheapcharpointer)

##### js\_code\_length

`number`

##### filename

`string`

##### detectModule

`EvalDetectModule`

##### evalFlags

[`EvalFlags`](../README.md#evalflags)

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_EvalFunction()

> **QTS\_EvalFunction**: (`ctx`, `fun_obj`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:215](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L215)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### fun\_obj

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_ExecutePendingJob()

> **QTS\_ExecutePendingJob**: (`rt`, `maxJobsToExecute`, `lastJobContext`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:101](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L101)

#### Parameters

##### rt

[`JSRuntimePointer`](../README.md#jsruntimepointer)

##### maxJobsToExecute

`number`

##### lastJobContext

[`JSContextPointerPointer`](../README.md#jscontextpointerpointer)

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_FreeContext()

> **QTS\_FreeContext**: (`ctx`) => `void`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:55](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L55)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

#### Returns

`void`

***

### QTS\_FreeCString()

> **QTS\_FreeCString**: (`ctx`, `str`) => `void`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:59](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L59)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### str

[`JSBorrowedCharPointer`](../README.md#jsborrowedcharpointer)

#### Returns

`void`

***

### QTS\_FreeRuntime()

> **QTS\_FreeRuntime**: (`rt`) => `void`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:53](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L53)

#### Parameters

##### rt

[`JSRuntimePointer`](../README.md#jsruntimepointer)

#### Returns

`void`

***

### QTS\_FreeValuePointer()

> **QTS\_FreeValuePointer**: (`ctx`, `value`) => `void`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:56](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L56)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### value

[`JSValuePointer`](../README.md#jsvaluepointer)

#### Returns

`void`

***

### QTS\_FreeValuePointerRuntime()

> **QTS\_FreeValuePointerRuntime**: (`rt`, `value`) => `void`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:57](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L57)

#### Parameters

##### rt

[`JSRuntimePointer`](../README.md#jsruntimepointer)

##### value

[`JSValuePointer`](../README.md#jsvaluepointer)

#### Returns

`void`

***

### QTS\_FreeVoidPointer()

> **QTS\_FreeVoidPointer**: (`ctx`, `ptr`) => `void`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:58](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L58)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### ptr

[`JSVoidPointer`](../README.md#jsvoidpointer)

#### Returns

`void`

***

### QTS\_GetArrayBuffer()

> **QTS\_GetArrayBuffer**: (`ctx`, `data`) => [`JSVoidPointer`](../README.md#jsvoidpointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:82](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L82)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### data

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

#### Returns

[`JSVoidPointer`](../README.md#jsvoidpointer)

***

### QTS\_GetArrayBufferLength()

> **QTS\_GetArrayBufferLength**: (`ctx`, `data`) => `number`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:86](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L86)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### data

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

#### Returns

`number`

***

### QTS\_GetDebugLogEnabled()

> **QTS\_GetDebugLogEnabled**: (`rt`) => `number`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:194](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L194)

#### Parameters

##### rt

[`JSRuntimePointer`](../README.md#jsruntimepointer)

#### Returns

`number`

***

### QTS\_GetException()

> **QTS\_GetException**: (`ctx`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:148](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L148)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_GetFalse()

> **QTS\_GetFalse**: () => [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:50](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L50)

#### Returns

[`JSValueConstPointer`](../README.md#jsvalueconstpointer)

***

### QTS\_GetFloat64()

> **QTS\_GetFloat64**: (`ctx`, `value`) => `number`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:76](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L76)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### value

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

#### Returns

`number`

***

### QTS\_GetGlobalObject()

> **QTS\_GetGlobalObject**: (`ctx`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:180](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L180)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_GetLength()

> **QTS\_GetLength**: (`ctx`, `out_len`, `value`) => `number`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:169](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L169)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### out\_len

[`UInt32Pointer`](../README.md#uint32pointer)

##### value

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

#### Returns

`number`

***

### QTS\_GetModuleNamespace()

> **QTS\_GetModuleNamespace**: (`ctx`, `module_func_obj`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:161](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L161)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### module\_func\_obj

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_GetNull()

> **QTS\_GetNull**: () => [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:49](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L49)

#### Returns

[`JSValueConstPointer`](../README.md#jsvalueconstpointer)

***

### QTS\_GetOwnPropertyNames()

> **QTS\_GetOwnPropertyNames**: (`ctx`, `out_ptrs`, `out_len`, `obj`, `flags`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:133](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L133)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### out\_ptrs

[`JSValuePointerPointerPointer`](../README.md#jsvaluepointerpointerpointer)

##### out\_len

[`UInt32Pointer`](../README.md#uint32pointer)

##### obj

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

##### flags

`number`

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_GetProp()

> **QTS\_GetProp**: (`ctx`, `this_val`, `prop_name`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:106](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L106)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### this\_val

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

##### prop\_name

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_GetPropNumber()

> **QTS\_GetPropNumber**: (`ctx`, `this_val`, `prop_name`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:111](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L111)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### this\_val

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

##### prop\_name

`number`

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_GetString()

> **QTS\_GetString**: (`ctx`, `value`) => [`JSBorrowedCharPointer`](../README.md#jsborrowedcharpointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:78](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L78)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### value

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

#### Returns

[`JSBorrowedCharPointer`](../README.md#jsborrowedcharpointer)

***

### QTS\_GetSymbolDescriptionOrKey()

> **QTS\_GetSymbolDescriptionOrKey**: (`ctx`, `value`) => [`JSBorrowedCharPointer`](../README.md#jsborrowedcharpointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:95](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L95)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### value

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

#### Returns

[`JSBorrowedCharPointer`](../README.md#jsborrowedcharpointer)

***

### QTS\_GetTrue()

> **QTS\_GetTrue**: () => [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:51](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L51)

#### Returns

[`JSValueConstPointer`](../README.md#jsvalueconstpointer)

***

### QTS\_GetUndefined()

> **QTS\_GetUndefined**: () => [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:48](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L48)

#### Returns

[`JSValueConstPointer`](../README.md#jsvalueconstpointer)

***

### QTS\_IsEqual()

> **QTS\_IsEqual**: (`ctx`, `a`, `b`, `op`) => `number`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:174](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L174)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### a

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

##### b

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

##### op

[`IsEqualOp`](../README.md#isequalop)

#### Returns

`number`

***

### QTS\_IsGlobalSymbol()

> **QTS\_IsGlobalSymbol**: (`ctx`, `value`) => `number`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:99](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L99)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### value

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

#### Returns

`number`

***

### QTS\_IsJobPending()

> **QTS\_IsJobPending**: (`rt`) => `number`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:100](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L100)

#### Parameters

##### rt

[`JSRuntimePointer`](../README.md#jsruntimepointer)

#### Returns

`number`

***

### QTS\_NewArray()

> **QTS\_NewArray**: (`ctx`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:69](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L69)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_NewArrayBuffer()

> **QTS\_NewArrayBuffer**: (`ctx`, `buffer`, `length`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:70](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L70)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### buffer

[`JSVoidPointer`](../README.md#jsvoidpointer)

##### length

`number`

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_NewContext()

> **QTS\_NewContext**: (`rt`, `intrinsics`) => [`JSContextPointer`](../README.md#jscontextpointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:54](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L54)

#### Parameters

##### rt

[`JSRuntimePointer`](../README.md#jsruntimepointer)

##### intrinsics

[`IntrinsicsFlags`](../README.md#intrinsicsflags)

#### Returns

[`JSContextPointer`](../README.md#jscontextpointer)

***

### QTS\_NewError()

> **QTS\_NewError**: (`ctx`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:41](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L41)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_NewFloat64()

> **QTS\_NewFloat64**: (`ctx`, `num`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:75](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L75)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### num

`number`

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_NewFunction()

> **QTS\_NewFunction**: (`ctx`, `func_id`, `name`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:198](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L198)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### func\_id

`number`

##### name

`string`

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_NewObject()

> **QTS\_NewObject**: (`ctx`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:64](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L64)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_NewObjectProto()

> **QTS\_NewObjectProto**: (`ctx`, `proto`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:65](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L65)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### proto

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_NewPromiseCapability()

> **QTS\_NewPromiseCapability**: (`ctx`, `resolve_funcs_out`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:181](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L181)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### resolve\_funcs\_out

[`JSValuePointerPointer`](../README.md#jsvaluepointerpointer)

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_NewRuntime()

> **QTS\_NewRuntime**: () => [`JSRuntimePointer`](../README.md#jsruntimepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:52](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L52)

#### Returns

[`JSRuntimePointer`](../README.md#jsruntimepointer)

***

### QTS\_NewString()

> **QTS\_NewString**: (`ctx`, `string`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:77](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L77)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### string

[`BorrowedHeapCharPointer`](../README.md#borrowedheapcharpointer)

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_NewSymbol()

> **QTS\_NewSymbol**: (`ctx`, `description`, `isGlobal`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:90](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L90)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### description

[`BorrowedHeapCharPointer`](../README.md#borrowedheapcharpointer)

##### isGlobal

`number`

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_PromiseResult()

> **QTS\_PromiseResult**: (`ctx`, `promise`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:189](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L189)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### promise

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_PromiseState()

> **QTS\_PromiseState**: (`ctx`, `promise`) => [`JSPromiseStateEnum`](../README.md#jspromisestateenum)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:185](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L185)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### promise

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

#### Returns

[`JSPromiseStateEnum`](../README.md#jspromisestateenum)

***

### QTS\_RecoverableLeakCheck()

> **QTS\_RecoverableLeakCheck**: () => `number`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:45](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L45)

#### Returns

`number`

***

### QTS\_ResolveException()

> **QTS\_ResolveException**: (`ctx`, `maybe_exception`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:147](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L147)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### maybe\_exception

[`JSValuePointer`](../README.md#jsvaluepointer)

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_ResolveModule()

> **QTS\_ResolveModule**: (`ctx`, `obj`) => `number`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:227](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L227)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### obj

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

#### Returns

`number`

***

### QTS\_RuntimeComputeMemoryUsage()

> **QTS\_RuntimeComputeMemoryUsage**: (`rt`, `ctx`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:43](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L43)

#### Parameters

##### rt

[`JSRuntimePointer`](../README.md#jsruntimepointer)

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_RuntimeDisableInterruptHandler()

> **QTS\_RuntimeDisableInterruptHandler**: (`rt`) => `void`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:204](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L204)

#### Parameters

##### rt

[`JSRuntimePointer`](../README.md#jsruntimepointer)

#### Returns

`void`

***

### QTS\_RuntimeDisableModuleLoader()

> **QTS\_RuntimeDisableModuleLoader**: (`rt`) => `void`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:206](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L206)

#### Parameters

##### rt

[`JSRuntimePointer`](../README.md#jsruntimepointer)

#### Returns

`void`

***

### QTS\_RuntimeDumpMemoryUsage()

> **QTS\_RuntimeDumpMemoryUsage**: (`rt`) => [`OwnedHeapCharPointer`](../README.md#ownedheapcharpointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:44](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L44)

#### Parameters

##### rt

[`JSRuntimePointer`](../README.md#jsruntimepointer)

#### Returns

[`OwnedHeapCharPointer`](../README.md#ownedheapcharpointer)

***

### QTS\_RuntimeEnableInterruptHandler()

> **QTS\_RuntimeEnableInterruptHandler**: (`rt`) => `void`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:203](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L203)

#### Parameters

##### rt

[`JSRuntimePointer`](../README.md#jsruntimepointer)

#### Returns

`void`

***

### QTS\_RuntimeEnableModuleLoader()

> **QTS\_RuntimeEnableModuleLoader**: (`rt`, `use_custom_normalize`) => `void`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:205](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L205)

#### Parameters

##### rt

[`JSRuntimePointer`](../README.md#jsruntimepointer)

##### use\_custom\_normalize

`number`

#### Returns

`void`

***

### QTS\_RuntimeSetMaxStackSize()

> **QTS\_RuntimeSetMaxStackSize**: (`rt`, `stack_size`) => `void`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:47](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L47)

#### Parameters

##### rt

[`JSRuntimePointer`](../README.md#jsruntimepointer)

##### stack\_size

`number`

#### Returns

`void`

***

### QTS\_RuntimeSetMemoryLimit()

> **QTS\_RuntimeSetMemoryLimit**: (`rt`, `limit`) => `void`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:42](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L42)

#### Parameters

##### rt

[`JSRuntimePointer`](../README.md#jsruntimepointer)

##### limit

`number`

#### Returns

`void`

***

### QTS\_SetDebugLogEnabled()

> **QTS\_SetDebugLogEnabled**: (`rt`, `is_enabled`) => `void`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:195](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L195)

#### Parameters

##### rt

[`JSRuntimePointer`](../README.md#jsruntimepointer)

##### is\_enabled

`number`

#### Returns

`void`

***

### QTS\_SetProp()

> **QTS\_SetProp**: (`ctx`, `this_val`, `prop_name`, `prop_value`) => `void`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:116](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L116)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### this\_val

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

##### prop\_name

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

##### prop\_value

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

#### Returns

`void`

***

### QTS\_TestStringArg()

> **QTS\_TestStringArg**: (`string`) => `void`

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:193](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L193)

#### Parameters

##### string

`string`

#### Returns

`void`

***

### QTS\_Throw()

> **QTS\_Throw**: (`ctx`, `error`) => [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:40](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L40)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### error

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

***

### QTS\_Typeof()

> **QTS\_Typeof**: (`ctx`, `value`) => [`OwnedHeapCharPointer`](../README.md#ownedheapcharpointer)

Defined in: [packages/quickjs-ffi-types/src/ffi.ts:165](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-ffi-types/src/ffi.ts#L165)

#### Parameters

##### ctx

[`JSContextPointer`](../README.md#jscontextpointer)

##### value

[`JSValuePointer`](../README.md#jsvaluepointer) | [`JSValueConstPointer`](../README.md#jsvalueconstpointer)

#### Returns

[`OwnedHeapCharPointer`](../README.md#ownedheapcharpointer)
