[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten-core](../README.md) / QuickJSAsyncContext

# Class: QuickJSAsyncContext

Defined in: [packages/quickjs-emscripten-core/src/context-asyncify.ts:30](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context-asyncify.ts#L30)

Asyncified version of [QuickJSContext](QuickJSContext.md).

*Asyncify* allows normally synchronous code to wait for asynchronous Promises
or callbacks. The asyncified version of QuickJSContext can wait for async
host functions as though they were synchronous.

## Extends

- [`QuickJSContext`](QuickJSContext.md)

## Constructors

### Constructor

> **new QuickJSAsyncContext**(`args`): `QuickJSAsyncContext`

Defined in: [packages/quickjs-emscripten-core/src/context.ts:224](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L224)

Use [QuickJSRuntime#newContext](QuickJSRuntime.md#newcontext) or [QuickJSWASMModule#newContext](QuickJSWASMModule.md#newcontext)
to create a new QuickJSContext.

#### Parameters

##### args

###### callbacks

`QuickJSModuleCallbacks`

###### ctx

[`Lifetime`](Lifetime.md)\<[`JSContextPointer`](../README.md#jscontextpointer)\>

###### ffi

[`EitherFFI`](../README.md#eitherffi)

###### module

[`EitherModule`](../README.md#eithermodule)

###### ownedLifetimes?

[`Disposable`](../interfaces/Disposable.md)[]

###### rt

[`Lifetime`](Lifetime.md)\<[`JSRuntimePointer`](../README.md#jsruntimepointer)\>

###### runtime

[`QuickJSRuntime`](QuickJSRuntime.md)

#### Returns

`QuickJSAsyncContext`

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`constructor`](QuickJSContext.md#constructor)

## Properties

### runtime

> **runtime**: [`QuickJSAsyncRuntime`](QuickJSAsyncRuntime.md)

Defined in: [packages/quickjs-emscripten-core/src/context-asyncify.ts:31](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context-asyncify.ts#L31)

The runtime that created this context.

#### Overrides

[`QuickJSContext`](QuickJSContext.md).[`runtime`](QuickJSContext.md#runtime)

## Accessors

### alive

#### Get Signature

> **get** **alive**(): `boolean`

Defined in: [packages/quickjs-emscripten-core/src/context.ts:255](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L255)

##### Returns

`boolean`

true if the object is alive

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`alive`](QuickJSContext.md#alive)

***

### false

#### Get Signature

> **get** **false**(): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:313](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L313)

[`false`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/false).

##### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`false`](QuickJSContext.md#false)

***

### global

#### Get Signature

> **get** **global**(): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:328](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L328)

[`global`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects).
A handle to the global object inside the interpreter.
You can set properties to create global variables.

##### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`global`](QuickJSContext.md#global)

***

### null

#### Get Signature

> **get** **null**(): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:287](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L287)

[`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null).

##### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`null`](QuickJSContext.md#null)

***

### true

#### Get Signature

> **get** **true**(): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:300](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L300)

[`true`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/true).

##### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`true`](QuickJSContext.md#true)

***

### undefined

#### Get Signature

> **get** **undefined**(): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:274](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L274)

[`undefined`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined).

##### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`undefined`](QuickJSContext.md#undefined)

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: [packages/quickjs-emscripten-core/src/lifetime.ts:47](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/lifetime.ts#L47)

Just calls the standard .dispose() method of this class.

#### Returns

`void`

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`[dispose]`](QuickJSContext.md#dispose)

***

### callFunction()

#### Call Signature

> **callFunction**(`func`, `thisVal`, `args?`): `QuickJSContextResult`\<[`QuickJSHandle`](../README.md#quickjshandle)\>

Defined in: [packages/quickjs-emscripten-core/src/context.ts:1059](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L1059)

[`func.call(thisVal, ...args)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call) or
[`func.apply(thisVal, args)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply).
Call a JSValue as a function.

See [unwrapResult](QuickJSContext.md#unwrapresult), which will throw if the function returned an error, or
return the result handle directly. If evaluation returned a handle containing
a promise, use [resolvePromise](QuickJSContext.md#resolvepromise) to convert it to a native promise and
[runtime](QuickJSContext.md#runtime).[QuickJSRuntime#executePendingJobs](QuickJSRuntime.md#executependingjobs) to finish evaluating the promise.

##### Parameters

###### func

[`QuickJSHandle`](../README.md#quickjshandle)

###### thisVal

[`QuickJSHandle`](../README.md#quickjshandle)

###### args?

[`QuickJSHandle`](../README.md#quickjshandle)[]

##### Returns

`QuickJSContextResult`\<[`QuickJSHandle`](../README.md#quickjshandle)\>

A result. If the function threw synchronously, `result.error` be a
handle to the exception. Otherwise `result.value` will be a handle to the
value.

Example:

```typescript
using parseIntHandle = context.getProp(global, "parseInt")
using stringHandle = context.newString("42")
using resultHandle = context.callFunction(parseIntHandle, context.undefined, stringHandle).unwrap()
console.log(context.dump(resultHandle)) // 42
```

##### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`callFunction`](QuickJSContext.md#callfunction)

#### Call Signature

> **callFunction**(`func`, `thisVal`, ...`args`): `QuickJSContextResult`\<[`QuickJSHandle`](../README.md#quickjshandle)\>

Defined in: [packages/quickjs-emscripten-core/src/context.ts:1064](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L1064)

[`func.call(thisVal, ...args)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call) or
[`func.apply(thisVal, args)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply).
Call a JSValue as a function.

See [unwrapResult](QuickJSContext.md#unwrapresult), which will throw if the function returned an error, or
return the result handle directly. If evaluation returned a handle containing
a promise, use [resolvePromise](QuickJSContext.md#resolvepromise) to convert it to a native promise and
[runtime](QuickJSContext.md#runtime).[QuickJSRuntime#executePendingJobs](QuickJSRuntime.md#executependingjobs) to finish evaluating the promise.

##### Parameters

###### func

[`QuickJSHandle`](../README.md#quickjshandle)

###### thisVal

[`QuickJSHandle`](../README.md#quickjshandle)

###### args

...[`QuickJSHandle`](../README.md#quickjshandle)[]

##### Returns

`QuickJSContextResult`\<[`QuickJSHandle`](../README.md#quickjshandle)\>

A result. If the function threw synchronously, `result.error` be a
handle to the exception. Otherwise `result.value` will be a handle to the
value.

Example:

```typescript
using parseIntHandle = context.getProp(global, "parseInt")
using stringHandle = context.newString("42")
using resultHandle = context.callFunction(parseIntHandle, context.undefined, stringHandle).unwrap()
console.log(context.dump(resultHandle)) // 42
```

##### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`callFunction`](QuickJSContext.md#callfunction)

***

### callMethod()

> **callMethod**(`thisHandle`, `key`, `args`): `QuickJSContextResult`\<[`QuickJSHandle`](../README.md#quickjshandle)\>

Defined in: [packages/quickjs-emscripten-core/src/context.ts:1113](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L1113)

`handle[key](...args)`

Call a method on a JSValue. This is a convenience method that calls [getProp](QuickJSContext.md#getprop) and [callFunction](QuickJSContext.md#callfunction).

#### Parameters

##### thisHandle

[`QuickJSHandle`](../README.md#quickjshandle)

##### key

[`QuickJSPropertyKey`](../README.md#quickjspropertykey)

##### args

[`QuickJSHandle`](../README.md#quickjshandle)[] = `[]`

#### Returns

`QuickJSContextResult`\<[`QuickJSHandle`](../README.md#quickjshandle)\>

A result. If the function threw synchronously, `result.error` be a
handle to the exception. Otherwise `result.value` will be a handle to the
value.

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`callMethod`](QuickJSContext.md#callmethod)

***

### compileCode()

> **compileCode**(`code`, `filename`, `options?`): `QuickJSContextResult`\<[`QuickJSHandle`](../README.md#quickjshandle)\>

Defined in: [packages/quickjs-emscripten-core/src/context.ts:1462](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L1462)

Compile code to bytecode without executing it.
The bytecode can be serialized with [encodeBytecode](QuickJSContext.md#encodebytecode) and later
restored with [decodeBytecode](QuickJSContext.md#decodebytecode) and executed with [evalBytecode](QuickJSContext.md#evalbytecode).

This enables bytecode caching for faster startup (~2x improvement).

```ts
// Compile code to bytecode
const bytecodeHandle = context.compileCode(`
  function hello() { return "world"; }
  hello();
`, "example.js").unwrap()

// Serialize to ArrayBuffer for caching
const serialized = context.encodeBytecode(bytecodeHandle)
  .consume(handle => context.getArrayBuffer(handle))

// Later: restore and execute
const restored = context.newArrayBuffer(serialized.value)
  .consume(handle => context.decodeBytecode(handle))
const result = context.evalBytecode(restored).unwrap()
```

#### Parameters

##### code

`string`

##### filename

`string` = `"eval.js"`

##### options?

`Omit`\<[`ContextEvalOptions`](../interfaces/ContextEvalOptions.md), `"compileOnly"`\>

#### Returns

`QuickJSContextResult`\<[`QuickJSHandle`](../README.md#quickjshandle)\>

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`compileCode`](QuickJSContext.md#compilecode)

***

### decodeBinaryJSON()

> **decodeBinaryJSON**(`handle`): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:1431](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L1431)

Outputs Handle of the given QuickJS Object in binary form

```ts
// imagine receiving data from another via IPC
socket.on("data", chunk => {
 context.newArrayBuffer(chunk)
   ?.consume(handle => context.decodeBinaryJSON(handle))
   ?.consume(handle => console.log(context.dump(handle)))
})
```

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`decodeBinaryJSON`](QuickJSContext.md#decodebinaryjson)

***

### decodeBytecode()

> **decodeBytecode**(`handle`): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:1522](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L1522)

Deserialize bytecode from binary format.
The bytecode must have been serialized with [encodeBytecode](QuickJSContext.md#encodebytecode).

After decoding, use [evalBytecode](QuickJSContext.md#evalbytecode) to execute the bytecode.

**WARNING**: The bytecode format is not standardized and may change between
QuickJS versions.

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

A handle to an ArrayBuffer containing serialized bytecode

#### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

A handle to the deserialized bytecode function

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`decodeBytecode`](QuickJSContext.md#decodebytecode)

***

### defineProp()

> **defineProp**(`handle`, `key`, `descriptor`): `void`

Defined in: [packages/quickjs-emscripten-core/src/context.ts:1000](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L1000)

[`Object.defineProperty(handle, key, descriptor)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty).

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

##### key

[`QuickJSPropertyKey`](../README.md#quickjspropertykey)

The property may be specified as a JSValue handle, or as a
Javascript string or number (which will be converted automatically to a JSValue).

##### descriptor

[`VmPropertyDescriptor`](../interfaces/VmPropertyDescriptor.md)\<[`QuickJSHandle`](../README.md#quickjshandle)\>

#### Returns

`void`

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`defineProp`](QuickJSContext.md#defineprop)

***

### dispose()

> **dispose**(): `void`

Defined in: [packages/quickjs-emscripten-core/src/context.ts:265](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L265)

Dispose of this VM's underlying resources.

#### Returns

`void`

#### Throws

Calling this method without disposing of all created handles
will result in an error.

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`dispose`](QuickJSContext.md#dispose-2)

***

### dump()

> **dump**(`handle`): `any`

Defined in: [packages/quickjs-emscripten-core/src/context.ts:1234](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L1234)

Dump a JSValue to Javascript in a best-effort fashion.
If the value is a promise, dumps the promise's state.
Returns `handle.toString()` if it cannot be serialized to JSON.

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

`any`

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`dump`](QuickJSContext.md#dump)

***

### encodeBinaryJSON()

> **encodeBinaryJSON**(`handle`): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:1414](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L1414)

Outputs QuickJS Objects in binary form

**WARNING**: QuickJS's binary JSON doesn't have a standard so expect it to change between version

```ts
// imagine sending data to another via IPC
let dataLifetime = context.newString("This is an example")
 ?.consume(handle => context.encodeBinaryJSON(handle))
 ?.consume(handle => context.getArrayBuffer(handle))
socket.write(dataLifetime?.value)
```

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`encodeBinaryJSON`](QuickJSContext.md#encodebinaryjson)

***

### encodeBytecode()

> **encodeBytecode**(`handle`): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:1504](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L1504)

Serialize a bytecode function to binary format.
The bytecode can be stored/cached and later restored with [decodeBytecode](QuickJSContext.md#decodebytecode).

This is more efficient than [encodeBinaryJSON](QuickJSContext.md#encodebinaryjson) for bytecode because it
uses the `JS_WRITE_OBJ_BYTECODE` flag optimized for function serialization.

**WARNING**: The bytecode format is not standardized and may change between
QuickJS versions.

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

A handle to a bytecode function (from [compileCode](QuickJSContext.md#compilecode) or
  `evalCode({ compileOnly: true })`)

#### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

A handle to an ArrayBuffer containing the serialized bytecode

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`encodeBytecode`](QuickJSContext.md#encodebytecode)

***

### eq()

> **eq**(`handle`, `other`): `boolean`

Defined in: [packages/quickjs-emscripten-core/src/context.ts:811](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L811)

`handle === other` - IsStrictlyEqual.
See [Equality comparisons and sameness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness).

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

##### other

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

`boolean`

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`eq`](QuickJSContext.md#eq)

***

### evalBytecode()

> **evalBytecode**(`handle`): `QuickJSContextResult`\<[`QuickJSHandle`](../README.md#quickjshandle)\>

Defined in: [packages/quickjs-emscripten-core/src/context.ts:1479](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L1479)

Execute a bytecode function that was previously compiled with
[compileCode](QuickJSContext.md#compilecode) or `evalCode({ compileOnly: true })`, or restored
from serialized bytecode via [decodeBytecode](QuickJSContext.md#decodebytecode).

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

`QuickJSContextResult`\<[`QuickJSHandle`](../README.md#quickjshandle)\>

A result. If execution threw synchronously, `result.error` will be
a handle to the exception. Otherwise `result.value` will be a handle to the
return value.

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`evalBytecode`](QuickJSContext.md#evalbytecode)

***

### evalCode()

> **evalCode**(`code`, `filename`, `options?`): `QuickJSContextResult`\<[`QuickJSHandle`](../README.md#quickjshandle)\>

Defined in: [packages/quickjs-emscripten-core/src/context.ts:1156](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L1156)

Like [`eval(code)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#Description).

Evaluates `code`, as though it's in a file named `filename`, with options `options`.

- When `options.type` is `"global"`, the code is evaluated in the global
  scope of the QuickJSContext, and the return value is the result of the last
  expression.
- When `options.type` is `"module"`, the code is evaluated is a module scope.
  It may use `import` and `export` if [runtime](QuickJSContext.md#runtime).[QuickJSRuntime#setModuleLoader](QuickJSRuntime.md#setmoduleloader) was called.
  It may use top-level await if supported by the underlying QuickJS library.
  The return value is the module's exports, or a promise for the module's exports.
- When `options.type` is unset, the code is evaluated as a module if it
  contains an `import` or `export` statement, otherwise it is evaluated in
  the global scope.

When working with async code, you many need to call [runtime](QuickJSContext.md#runtime).[QuickJSRuntime#executePendingJobs](QuickJSRuntime.md#executependingjobs)
to execute callbacks pending after synchronous evaluation returns.

See [unwrapResult](QuickJSContext.md#unwrapresult), which will throw if the function returned an error, or
return the result handle directly. If evaluation returned a handle containing
a promise, use [resolvePromise](QuickJSContext.md#resolvepromise) to convert it to a native promise and
[QuickJSRuntime#executePendingJobs](QuickJSRuntime.md#executependingjobs) to finish evaluating the promise.

*Note*: to protect against infinite loops, provide an interrupt handler to
[QuickJSRuntime#setInterruptHandler](QuickJSRuntime.md#setinterrupthandler). You can use [shouldInterruptAfterDeadline](../README.md#shouldinterruptafterdeadline) to
create a time-based deadline.

#### Parameters

##### code

`string`

##### filename

`string` = `"eval.js"`

##### options?

If no options are passed, a heuristic will be used to detect if `code` is
an ES module.

See [EvalFlags](../README.md#evalflags) for number semantics.

`number` | [`ContextEvalOptions`](../interfaces/ContextEvalOptions.md)

#### Returns

`QuickJSContextResult`\<[`QuickJSHandle`](../README.md#quickjshandle)\>

The last statement's value. If the code threw synchronously,
`result.error` will be a handle to the exception. If execution was
interrupted, the error will have name `InternalError` and message
`interrupted`.

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`evalCode`](QuickJSContext.md#evalcode)

***

### evalCodeAsync()

> **evalCodeAsync**(`code`, `filename`, `options?`): `Promise`\<`QuickJSContextResult`\<[`QuickJSHandle`](../README.md#quickjshandle)\>\>

Defined in: [packages/quickjs-emscripten-core/src/context-asyncify.ts:44](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context-asyncify.ts#L44)

Asyncified version of [evalCode](#evalcode).

#### Parameters

##### code

`string`

##### filename

`string` = `"eval.js"`

##### options?

See [EvalFlags](../README.md#evalflags) for number semantics

`number` | [`ContextEvalOptions`](../interfaces/ContextEvalOptions.md)

#### Returns

`Promise`\<`QuickJSContextResult`\<[`QuickJSHandle`](../README.md#quickjshandle)\>\>

***

### fail()

> `protected` **fail**(`error`): [`DisposableFail`](DisposableFail.md)\<[`QuickJSHandle`](../README.md#quickjshandle)\>

Defined in: [packages/quickjs-emscripten-core/src/context.ts:1556](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L1556)

#### Parameters

##### error

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

[`DisposableFail`](DisposableFail.md)\<[`QuickJSHandle`](../README.md#quickjshandle)\>

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`fail`](QuickJSContext.md#fail)

***

### getArrayBuffer()

> **getArrayBuffer**(`handle`): [`Lifetime`](Lifetime.md)\<`Uint8Array`\<`ArrayBufferLike`\>\>

Defined in: [packages/quickjs-emscripten-core/src/context.ts:690](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L690)

Coverts `handle` to a JavaScript ArrayBuffer

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

[`Lifetime`](Lifetime.md)\<`Uint8Array`\<`ArrayBufferLike`\>\>

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`getArrayBuffer`](QuickJSContext.md#getarraybuffer)

***

### getBigInt()

> **getBigInt**(`handle`): `bigint`

Defined in: [packages/quickjs-emscripten-core/src/context.ts:681](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L681)

Converts `handle` to a Javascript bigint.

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

`bigint`

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`getBigInt`](QuickJSContext.md#getbigint)

***

### getIterator()

> **getIterator**(`iterableHandle`): `QuickJSContextResult`\<`QuickJSIterator`\>

Defined in: [packages/quickjs-emscripten-core/src/context.ts:960](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L960)

`handle[Symbol.iterator]()`. See QuickJSIterator.
Returns a host iterator that wraps and proxies calls to a guest iterator handle.
Each step of the iteration returns a result, either an error or a handle to the next value.
Once the iterator is done, the handle is automatically disposed, and the iterator
is considered done if the handle is disposed.

```typescript
for (using entriesHandle of context.getIterator(mapHandle).unwrap()) {
  using keyHandle = context.getProp(entriesHandle, 0)
  using valueHandle = context.getProp(entriesHandle, 1)
  console.log(context.dump(keyHandle), '->', context.dump(valueHandle))
}
```

#### Parameters

##### iterableHandle

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

`QuickJSContextResult`\<`QuickJSIterator`\>

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`getIterator`](QuickJSContext.md#getiterator)

***

### getLength()

> **getLength**(`handle`): `number` \| `undefined`

Defined in: [packages/quickjs-emscripten-core/src/context.ts:870](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L870)

`handle.length` as a host number.

Example use:
```typescript
const length = context.getLength(arrayHandle) ?? 0
for (let i = 0; i < length; i++) {
  using value = context.getProp(arrayHandle, i)
  console.log(`array[${i}] =`, context.dump(value))
}
```

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

`number` \| `undefined`

a number if the handle has a numeric length property, otherwise `undefined`.

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`getLength`](QuickJSContext.md#getlength)

***

### getNumber()

> **getNumber**(`handle`): `number`

Defined in: [packages/quickjs-emscripten-core/src/context.ts:652](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L652)

Converts `handle` into a Javascript number.

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

`number`

`NaN` on error, otherwise a `number`.

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`getNumber`](QuickJSContext.md#getnumber)

***

### getOwnPropertyNames()

> **getOwnPropertyNames**(`handle`, `options`): `QuickJSContextResult`\<[`DisposableArray`](../README.md#disposablearray)\<[`QuickJSHandle`](../README.md#quickjshandle)\>\>

Defined in: [packages/quickjs-emscripten-core/src/context.ts:907](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L907)

`Object.getOwnPropertyNames(handle)`.
Similar to the [standard semantics](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames),
but with extra, non-standard options for:

- fetching array indexes as numbers (`numbers: true`)
- including symbols (`symbols: true`)
- only iterating over enumerable properties (`onlyEnumerable: true`)

The default behavior is to emulate the standard:
```typescript
context.getOwnPropertyNames(handle, { strings: true, numbersAsStrings: true })
```

Note when passing an explicit options object, you must set at least one
option, and `strings` are not included unless specified.

Example use:
```typescript
for (using prop of context.getOwnPropertyNames(objectHandle).unwrap()) {
  using value = context.getProp(handle, prop)
  console.log(context.dump(prop), '->', context.dump(value))
}
```

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

##### options

`GetOwnPropertyNamesOptions` = `...`

#### Returns

`QuickJSContextResult`\<[`DisposableArray`](../README.md#disposablearray)\<[`QuickJSHandle`](../README.md#quickjshandle)\>\>

an an array of handles of the property names. The array itself is disposable for your convenience.

#### Throws

QuickJSEmptyGetOwnPropertyNames if no options are set.

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`getOwnPropertyNames`](QuickJSContext.md#getownpropertynames)

***

### getPromiseState()

> **getPromiseState**(`handle`): [`JSPromiseState`](../README.md#jspromisestate)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:715](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L715)

Get the current state of a QuickJS promise, see [JSPromiseState](../README.md#jspromisestate) for the possible states.
This can be used to expect a promise to be fulfilled when combined with [unwrapResult](QuickJSContext.md#unwrapresult):

```typescript
const promiseHandle = context.evalCode(`Promise.resolve(42)`);
const resultHandle = context.unwrapResult(
 context.getPromiseState(promiseHandle)
);
context.getNumber(resultHandle) === 42; // true
resultHandle.dispose();
```

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

[`JSPromiseState`](../README.md#jspromisestate)

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`getPromiseState`](QuickJSContext.md#getpromisestate)

***

### getProp()

> **getProp**(`handle`, `key`): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:840](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L840)

`handle[key]`.
Get a property from a JSValue.

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

##### key

[`QuickJSPropertyKey`](../README.md#quickjspropertykey)

The property may be specified as a JSValue handle, or as a
Javascript string (which will be converted automatically).

#### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`getProp`](QuickJSContext.md#getprop)

***

### getString()

> **getString**(`handle`): `string`

Defined in: [packages/quickjs-emscripten-core/src/context.ts:660](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L660)

Converts `handle` to a Javascript string.

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

`string`

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`getString`](QuickJSContext.md#getstring)

***

### getSymbol()

> **getSymbol**(`handle`): `symbol`

Defined in: [packages/quickjs-emscripten-core/src/context.ts:669](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L669)

Converts `handle` into a Javascript symbol. If the symbol is in the global
registry in the guest, it will be created with Symbol.for on the host.

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

`symbol`

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`getSymbol`](QuickJSContext.md#getsymbol)

***

### getWellKnownSymbol()

> **getWellKnownSymbol**(`name`): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:388](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L388)

Access a well-known symbol that is a property of the global Symbol object, like `Symbol.iterator`.

#### Parameters

##### name

`string`

#### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`getWellKnownSymbol`](QuickJSContext.md#getwellknownsymbol)

***

### newArray()

> **newArray**(): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:430](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L430)

`[]`.
Create a new QuickJS [array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array).

#### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`newArray`](QuickJSContext.md#newarray)

***

### newArrayBuffer()

> **newArrayBuffer**(`buffer`): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:438](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L438)

Create a new QuickJS [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).

#### Parameters

##### buffer

`ArrayBufferLike`

#### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`newArrayBuffer`](QuickJSContext.md#newarraybuffer)

***

### newAsyncifiedFunction()

> **newAsyncifiedFunction**(`name`, `fn`): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/context-asyncify.ts:91](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context-asyncify.ts#L91)

Similar to [newFunction](QuickJSContext.md#newfunction).
Convert an async host Javascript function into a synchronous QuickJS function value.

Whenever QuickJS calls this function, the VM's stack will be unwound while
waiting the async function to complete, and then restored when the returned
promise resolves.

Asyncified functions must never call other asyncified functions or
`import`, even indirectly, because the stack cannot be unwound twice.

See [Emscripten's docs on Asyncify](https://emscripten.org/docs/porting/asyncify.html).

#### Parameters

##### name

`string`

##### fn

[`AsyncFunctionImplementation`](../README.md#asyncfunctionimplementation)

#### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

***

### newBigInt()

> **newBigInt**(`num`): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:396](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L396)

Create a QuickJS [bigint](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) value.

#### Parameters

##### num

`bigint`

#### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`newBigInt`](QuickJSContext.md#newbigint)

***

### newError()

#### Call Signature

> **newError**(`error`): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:607](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L607)

##### Parameters

###### error

###### message

`string`

###### name

`string`

##### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

##### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`newError`](QuickJSContext.md#newerror)

#### Call Signature

> **newError**(`message`): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:608](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L608)

##### Parameters

###### message

`string`

##### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

##### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`newError`](QuickJSContext.md#newerror)

#### Call Signature

> **newError**(): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:609](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L609)

##### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

##### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`newError`](QuickJSContext.md#newerror)

***

### newFunction()

> **newFunction**(`name`, `fn`): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:601](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L601)

Convert a Javascript function into a QuickJS function value.
See [VmFunctionImplementation](../README.md#vmfunctionimplementation) for more details.

A [VmFunctionImplementation](../README.md#vmfunctionimplementation) should not free its arguments or its return
value. A VmFunctionImplementation should also not retain any references to
its return value.

The function argument handles are automatically disposed when the function
returns. If you want to retain a handle beyond the end of the function, you
can call [Lifetime#dup](Lifetime.md#dup) to create a copy of the handle that you own
and must dispose manually. For example, you need to use this API and do some
extra book keeping to implement `setInterval`:

```typescript
// This won't work because `callbackHandle` expires when the function returns,
// so when the interval fires, the callback handle is already disposed.
const WRONG_setIntervalHandle = context.newFunction("setInterval", (callbackHandle, delayHandle) => {
  const delayMs = context.getNumber(delayHandle)
  const intervalId = globalThis.setInterval(() => {
    // ERROR: callbackHandle is already disposed here.
    context.callFunction(callbackHandle)
  }, intervalId)
  return context.newNumber(intervalId)
})

// This works since we dup the callbackHandle.
// We just need to make sure we clean it up manually when the interval is cleared --
// so we need to keep track of those interval IDs, and make sure we clean all
// of them up when we dispose the owning context.

const setIntervalHandle = context.newFunction("setInterval", (callbackHandle, delayHandle) => {
  // Ensure the guest can't overload us by scheduling too many intervals.
  if (QuickJSInterval.INTERVALS.size > 100) {
    throw new Error(`Too many intervals scheduled already`)
  }

  const delayMs = context.getNumber(delayHandle)
  const longLivedCallbackHandle = callbackHandle.dup()
  const intervalId = globalThis.setInterval(() => {
    context.callFunction(longLivedCallbackHandle)
  }, intervalId)
  const disposable = new QuickJSInterval(longLivedCallbackHandle, context, intervalId)
  QuickJSInterval.INTERVALS.set(intervalId, disposable)
  return context.newNumber(intervalId)
})

const clearIntervalHandle = context.newFunction("clearInterval", (intervalIdHandle) => {
  const intervalId = context.getNumber(intervalIdHandle)
  const disposable = QuickJSInterval.INTERVALS.get(intervalId)
  disposable?.dispose()
})

class QuickJSInterval extends UsingDisposable {
  static INTERVALS = new Map<number, QuickJSInterval>()

  static disposeContext(context: QuickJSContext) {
    for (const interval of QuickJSInterval.INTERVALS.values()) {
      if (interval.context === context) {
        interval.dispose()
      }
    }
  }

  constructor(
    public fnHandle: QuickJSHandle,
    public context: QuickJSContext,
    public intervalId: number,
  ) {
    super()
  }

  dispose() {
    globalThis.clearInterval(this.intervalId)
    this.fnHandle.dispose()
    QuickJSInterval.INTERVALS.delete(this.fnHandle.value)
  }

  get alive() {
    return this.fnHandle.alive
  }
}
```

To implement an async function, create a promise with [newPromise](QuickJSContext.md#newpromise), then
return the deferred promise handle from `deferred.handle` from your
function implementation:

```typescript
const deferred = vm.newPromise()
someNativeAsyncFunction().then(deferred.resolve)
return deferred.handle
```

#### Parameters

##### name

`string`

##### fn

[`VmFunctionImplementation`](../README.md#vmfunctionimplementation)\<[`QuickJSHandle`](../README.md#quickjshandle)\>

#### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`newFunction`](QuickJSContext.md#newfunction)

***

### newNumber()

> **newNumber**(`num`): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:347](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L347)

Converts a Javascript number into a QuickJS value.

#### Parameters

##### num

`number`

#### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`newNumber`](QuickJSContext.md#newnumber)

***

### newObject()

> **newObject**(`prototype?`): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:416](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L416)

`{}`.
Create a new QuickJS [object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer).

#### Parameters

##### prototype?

[`QuickJSHandle`](../README.md#quickjshandle)

Like [`Object.create`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create).

#### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`newObject`](QuickJSContext.md#newobject)

***

### newPromise()

#### Call Signature

> **newPromise**(): [`QuickJSDeferredPromise`](QuickJSDeferredPromise.md)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:451](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L451)

Create a new [QuickJSDeferredPromise](QuickJSDeferredPromise.md). Use `deferred.resolve(handle)` and
`deferred.reject(handle)` to fulfill the promise handle available at `deferred.handle`.
Note that you are responsible for calling `deferred.dispose()` to free the underlying
resources; see the documentation on [QuickJSDeferredPromise](QuickJSDeferredPromise.md) for details.

##### Returns

[`QuickJSDeferredPromise`](QuickJSDeferredPromise.md)

##### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`newPromise`](QuickJSContext.md#newpromise)

#### Call Signature

> **newPromise**(`promise`): [`QuickJSDeferredPromise`](QuickJSDeferredPromise.md)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:459](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L459)

Create a new [QuickJSDeferredPromise](QuickJSDeferredPromise.md) that resolves when the
given native Promise<QuickJSHandle> resolves. Rejections will be coerced
to a QuickJS error.

You can still resolve/reject the created promise "early" using its methods.

##### Parameters

###### promise

`Promise`\<[`QuickJSHandle`](../README.md#quickjshandle)\>

##### Returns

[`QuickJSDeferredPromise`](QuickJSDeferredPromise.md)

##### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`newPromise`](QuickJSContext.md#newpromise)

#### Call Signature

> **newPromise**(`newPromiseFn`): [`QuickJSDeferredPromise`](QuickJSDeferredPromise.md)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:466](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L466)

Construct a new native Promise<QuickJSHandle>, and then convert it into a
[QuickJSDeferredPromise](QuickJSDeferredPromise.md).

You can still resolve/reject the created promise "early" using its methods.

##### Parameters

###### newPromiseFn

[`PromiseExecutor`](../README.md#promiseexecutor)\<[`QuickJSHandle`](../README.md#quickjshandle), `Error` \| [`QuickJSHandle`](../README.md#quickjshandle)\>

##### Returns

[`QuickJSDeferredPromise`](QuickJSDeferredPromise.md)

##### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`newPromise`](QuickJSContext.md#newpromise)

***

### newString()

> **newString**(`str`): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:354](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L354)

Create a QuickJS [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) value.

#### Parameters

##### str

`string`

#### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`newString`](QuickJSContext.md#newstring)

***

### newSymbolFor()

> **newSymbolFor**(`key`): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:377](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L377)

Get a symbol from the [global registry](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#shared_symbols_in_the_global_symbol_registry) for the given key.
All symbols created with the same key will be the same value.

#### Parameters

##### key

`string` | `symbol`

#### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`newSymbolFor`](QuickJSContext.md#newsymbolfor)

***

### newUniqueSymbol()

> **newUniqueSymbol**(`description`): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:365](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L365)

Create a QuickJS [symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) value.
No two symbols created with this function will be the same value.

#### Parameters

##### description

`string` | `symbol`

#### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`newUniqueSymbol`](QuickJSContext.md#newuniquesymbol)

***

### resolveModule()

> **resolveModule**(`handle`): `QuickJSContextResult`\<`void`\>

Defined in: [packages/quickjs-emscripten-core/src/context.ts:1542](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L1542)

Resolve module dependencies after loading module bytecode.

When loading ES module bytecode via [decodeBytecode](QuickJSContext.md#decodebytecode), the module's
import dependencies are not automatically resolved. Call this method
after decoding module bytecode and before [evalBytecode](QuickJSContext.md#evalbytecode) to resolve
all imports.

For non-module bytecode (scripts), this is a no-op.

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

A handle to a module (from [decodeBytecode](QuickJSContext.md#decodebytecode))

#### Returns

`QuickJSContextResult`\<`void`\>

A result. If resolution failed, `result.error` will be a handle
  to the exception. Otherwise `result.value` will be undefined.

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`resolveModule`](QuickJSContext.md#resolvemodule)

***

### resolvePromise()

> **resolvePromise**(`promiseLikeHandle`): `Promise`\<`QuickJSContextResult`\<[`QuickJSHandle`](../README.md#quickjshandle)\>\>

Defined in: [packages/quickjs-emscripten-core/src/context.ts:754](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L754)

`Promise.resolve(value)`.
Convert a handle containing a Promise-like value inside the VM into an
actual promise on the host.

#### Parameters

##### promiseLikeHandle

[`QuickJSHandle`](../README.md#quickjshandle)

A handle to a Promise-like value with a `.then(onSuccess, onError)` method.

#### Returns

`Promise`\<`QuickJSContextResult`\<[`QuickJSHandle`](../README.md#quickjshandle)\>\>

#### Remarks

You may need to call [runtime](QuickJSContext.md#runtime).[QuickJSRuntime#executePendingJobs](QuickJSRuntime.md#executependingjobs) to ensure that the promise is resolved.

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`resolvePromise`](QuickJSContext.md#resolvepromise)

***

### sameValue()

> **sameValue**(`handle`, `other`): `boolean`

Defined in: [packages/quickjs-emscripten-core/src/context.ts:819](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L819)

`Object.is(a, b)`
See [Equality comparisons and sameness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness).

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

##### other

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

`boolean`

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`sameValue`](QuickJSContext.md#samevalue)

***

### sameValueZero()

> **sameValueZero**(`handle`, `other`): `boolean`

Defined in: [packages/quickjs-emscripten-core/src/context.ts:827](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L827)

SameValueZero comparison.
See [Equality comparisons and sameness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness).

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

##### other

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

`boolean`

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`sameValueZero`](QuickJSContext.md#samevaluezero)

***

### setProp()

> **setProp**(`handle`, `key`, `value`): `void`

Defined in: [packages/quickjs-emscripten-core/src/context.ts:985](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L985)

`handle[key] = value`.
Set a property on a JSValue.

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

##### key

[`QuickJSPropertyKey`](../README.md#quickjspropertykey)

The property may be specified as a JSValue handle, or as a
Javascript string or number (which will be converted automatically to a JSValue).

##### value

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

`void`

#### Remarks

Note that the QuickJS authors recommend using [defineProp](QuickJSContext.md#defineprop) to define new
properties.

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`setProp`](QuickJSContext.md#setprop)

***

### success()

> `protected` **success**\<`S`\>(`value`): [`DisposableSuccess`](DisposableSuccess.md)\<`S`\>

Defined in: [packages/quickjs-emscripten-core/src/context.ts:1552](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L1552)

#### Type Parameters

##### S

`S`

#### Parameters

##### value

`S`

#### Returns

[`DisposableSuccess`](DisposableSuccess.md)\<`S`\>

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`success`](QuickJSContext.md#success)

***

### throw()

> **throw**(`error`): [`JSValuePointer`](../README.md#jsvaluepointer)

Defined in: [packages/quickjs-emscripten-core/src/context.ts:1193](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L1193)

**`Experimental`**

Throw an error in the VM, interrupted whatever current execution is in progress when execution resumes.

#### Parameters

##### error

`Error` | [`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

[`JSValuePointer`](../README.md#jsvaluepointer)

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`throw`](QuickJSContext.md#throw)

***

### typeof()

> **typeof**(`handle`): `string`

Defined in: [packages/quickjs-emscripten-core/src/context.ts:643](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L643)

`typeof` operator. **Not** [standards compliant](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof).

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

`string`

#### Remarks

Does not support BigInt values correctly.

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`typeof`](QuickJSContext.md#typeof)

***

### unwrapResult()

> **unwrapResult**\<`T`\>(`result`): `T`

Defined in: [packages/quickjs-emscripten-core/src/context.ts:1277](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/context.ts#L1277)

Unwrap a SuccessOrFail result such as a [VmCallResult](../README.md#vmcallresult) or a
[ExecutePendingJobsResult](../README.md#executependingjobsresult), where the fail branch contains a handle to a QuickJS error value.
If the result is a success, returns the value.
If the result is an error, converts the error to a native object and throws the error.

#### Type Parameters

##### T

`T`

#### Parameters

##### result

[`SuccessOrFail`](../README.md#successorfail)\<`T`, [`QuickJSHandle`](../README.md#quickjshandle)\>

#### Returns

`T`

#### Inherited from

[`QuickJSContext`](QuickJSContext.md).[`unwrapResult`](QuickJSContext.md#unwrapresult)
