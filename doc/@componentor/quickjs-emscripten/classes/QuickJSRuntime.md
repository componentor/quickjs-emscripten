[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten](../README.md) / QuickJSRuntime

# Class: QuickJSRuntime

Defined in: [packages/quickjs-emscripten-core/src/runtime.ts:70](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/runtime.ts#L70)

A runtime represents a Javascript runtime corresponding to an object heap.
Several runtimes can exist at the same time but they cannot exchange objects.
Inside a given runtime, no multi-threading is supported.

You can think of separate runtimes like different domains in a browser, and
the contexts within a runtime like the different windows open to the same
domain.

Create a runtime via [QuickJSWASMModule.newRuntime](QuickJSWASMModule.md#newruntime).

You should create separate runtime instances for untrusted code from
different sources for isolation. However, stronger isolation is also
available (at the cost of memory usage), by creating separate WebAssembly
modules to further isolate untrusted code.
See [newQuickJSWASMModule](../README.md#newquickjswasmmodule).

Implement memory and CPU constraints with [setInterruptHandler](#setinterrupthandler)
(called regularly while the interpreter runs), [setMemoryLimit](#setmemorylimit), and
[setMaxStackSize](#setmaxstacksize).
Use [computeMemoryUsage](#computememoryusage) or [dumpMemoryUsage](#dumpmemoryusage) to guide memory limit
tuning.

Configure ES module loading with [setModuleLoader](#setmoduleloader).

## Extends

- [`UsingDisposable`](UsingDisposable.md)

## Extended by

- [`QuickJSAsyncRuntime`](QuickJSAsyncRuntime.md)

## Implements

- [`Disposable`](../interfaces/Disposable.md)

## Properties

### context

> **context**: [`QuickJSContext`](QuickJSContext.md) \| `undefined`

Defined in: [packages/quickjs-emscripten-core/src/runtime.ts:78](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/runtime.ts#L78)

If this runtime was created as as part of a context, points to the context
associated with the runtime.

If this runtime was created stand-alone, this may or may not contain a context.
A context here may be allocated if one is needed by the runtime, eg for [computeMemoryUsage](#computememoryusage).

## Accessors

### alive

#### Get Signature

> **get** **alive**(): `boolean`

Defined in: [packages/quickjs-emscripten-core/src/runtime.ts:125](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/runtime.ts#L125)

##### Returns

`boolean`

true if the object is alive

#### Implementation of

[`Disposable`](../interfaces/Disposable.md).[`alive`](../interfaces/Disposable.md#alive)

#### Overrides

[`UsingDisposable`](UsingDisposable.md).[`alive`](UsingDisposable.md#alive)

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: [packages/quickjs-emscripten-core/src/lifetime.ts:47](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/lifetime.ts#L47)

Just calls the standard .dispose() method of this class.

#### Returns

`void`

#### Implementation of

[`Disposable`](../interfaces/Disposable.md).[`[dispose]`](../interfaces/Disposable.md#dispose)

#### Inherited from

[`UsingDisposable`](UsingDisposable.md).[`[dispose]`](UsingDisposable.md#dispose)

***

### assertOwned()

> **assertOwned**(`handle`): `void`

Defined in: [packages/quickjs-emscripten-core/src/runtime.ts:327](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/runtime.ts#L327)

Assert that `handle` is owned by this runtime.

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

`void`

#### Throws

QuickJSWrongOwner if owned by a different runtime.

***

### computeMemoryUsage()

> **computeMemoryUsage**(): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: [packages/quickjs-emscripten-core/src/runtime.ts:296](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/runtime.ts#L296)

Compute memory usage for this runtime. Returns the result as a handle to a
JSValue object. Use [QuickJSContext#dump](QuickJSContext.md#dump) to convert to a native object.
Calling this method will allocate more memory inside the runtime. The information
is accurate as of just before the call to `computeMemoryUsage`.
For a human-digestible representation, see [dumpMemoryUsage](#dumpmemoryusage).

#### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

***

### debugLog()

> **debugLog**(...`msg`): `void`

Defined in: [packages/quickjs-emscripten-core/src/runtime.ts:363](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/runtime.ts#L363)

In debug mode, log the result of calling `msg()`.

We take a function instead of a log message to avoid expensive string
manipulation if debug logging is disabled.

#### Parameters

##### msg

...`unknown`[]

#### Returns

`void`

***

### dispose()

> **dispose**(): `void`

Defined in: [packages/quickjs-emscripten-core/src/runtime.ts:129](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/runtime.ts#L129)

Dispose of the underlying resources used by this object.

#### Returns

`void`

#### Implementation of

[`Disposable`](../interfaces/Disposable.md).[`dispose`](../interfaces/Disposable.md#dispose-2)

#### Overrides

[`UsingDisposable`](UsingDisposable.md).[`dispose`](UsingDisposable.md#dispose-2)

***

### dumpMemoryUsage()

> **dumpMemoryUsage**(): `string`

Defined in: [packages/quickjs-emscripten-core/src/runtime.ts:307](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/runtime.ts#L307)

#### Returns

`string`

a human-readable description of memory usage in this runtime.
For programmatic access to this information, see [computeMemoryUsage](#computememoryusage).

***

### executePendingJobs()

> **executePendingJobs**(`maxJobsToExecute`): [`ExecutePendingJobsResult`](../README.md#executependingjobsresult)

Defined in: [packages/quickjs-emscripten-core/src/runtime.ts:243](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/runtime.ts#L243)

Execute pendingJobs on the runtime until `maxJobsToExecute` jobs are
executed (default all pendingJobs), the queue is exhausted, or the runtime
encounters an exception.

In QuickJS, promises and async functions *inside the runtime* create
pendingJobs. These do not execute immediately and need to triggered to run.

#### Parameters

##### maxJobsToExecute

When negative, run all pending jobs. Otherwise execute
at most `maxJobsToExecute` before returning.

`number` | `void`

#### Returns

[`ExecutePendingJobsResult`](../README.md#executependingjobsresult)

On success, the number of executed jobs. On error, the exception
that stopped execution, and the context it occurred in. Note that
executePendingJobs will not normally return errors thrown inside async
functions or rejected promises. Those errors are available by calling
[QuickJSContext#resolvePromise](QuickJSContext.md#resolvepromise) on the promise handle returned by the async function.

***

### hasPendingJob()

> **hasPendingJob**(): `boolean`

Defined in: [packages/quickjs-emscripten-core/src/runtime.ts:194](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/runtime.ts#L194)

In QuickJS, promises and async functions create pendingJobs. These do not execute
immediately and need to be run by calling [executePendingJobs](#executependingjobs).

#### Returns

`boolean`

true if there is at least one pendingJob queued up.

***

### isDebugMode()

> **isDebugMode**(): `boolean`

Defined in: [packages/quickjs-emscripten-core/src/runtime.ts:353](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/runtime.ts#L353)

#### Returns

`boolean`

true if debug logging is enabled

***

### newContext()

> **newContext**(`options`): [`QuickJSContext`](QuickJSContext.md)

Defined in: [packages/quickjs-emscripten-core/src/runtime.ts:140](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/runtime.ts#L140)

Create a new context within this runtime. Contexts have isolated globals,
but you can explicitly share objects between contexts with the same
runtime.

You should dispose a created context before disposing this runtime.

#### Parameters

##### options

[`ContextOptions`](../interfaces/ContextOptions.md) = `{}`

#### Returns

[`QuickJSContext`](QuickJSContext.md)

***

### removeInterruptHandler()

> **removeInterruptHandler**(): `void`

Defined in: [packages/quickjs-emscripten-core/src/runtime.ts:219](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/runtime.ts#L219)

Remove the interrupt handler, if any.
See [setInterruptHandler](#setinterrupthandler).

#### Returns

`void`

***

### removeModuleLoader()

> **removeModuleLoader**(): `void`

Defined in: [packages/quickjs-emscripten-core/src/runtime.ts:181](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/runtime.ts#L181)

Remove the the loader set by [setModuleLoader](#setmoduleloader). This disables module loading.

#### Returns

`void`

***

### setDebugMode()

> **setDebugMode**(`enabled`): `void`

Defined in: [packages/quickjs-emscripten-core/src/runtime.ts:343](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/runtime.ts#L343)

Enable or disable debug logging.

If this module is a DEBUG variant, more logs will be printed from the C
code.

#### Parameters

##### enabled

`boolean`

#### Returns

`void`

***

### setInterruptHandler()

> **setInterruptHandler**(`cb`): `void`

Defined in: [packages/quickjs-emscripten-core/src/runtime.ts:207](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/runtime.ts#L207)

Set a callback which is regularly called by the QuickJS engine when it is
executing code. This callback can be used to implement an execution
timeout.

The interrupt handler can be removed with [removeInterruptHandler](#removeinterrupthandler).

#### Parameters

##### cb

[`InterruptHandler`](../README.md#interrupthandler)

#### Returns

`void`

***

### setMaxStackSize()

> **setMaxStackSize**(`stackSize`): `void`

Defined in: [packages/quickjs-emscripten-core/src/runtime.ts:315](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/runtime.ts#L315)

Set the max stack size for this runtime, in bytes.
To remove the limit, set to `0`.

#### Parameters

##### stackSize

`number`

#### Returns

`void`

***

### setMemoryLimit()

> **setMemoryLimit**(`limitBytes`): `void`

Defined in: [packages/quickjs-emscripten-core/src/runtime.ts:281](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/runtime.ts#L281)

Set the max memory this runtime can allocate.
To remove the limit, set to `-1`.

#### Parameters

##### limitBytes

`number`

#### Returns

`void`

***

### setModuleLoader()

> **setModuleLoader**(`moduleLoader`, `moduleNormalizer?`): `void`

Defined in: [packages/quickjs-emscripten-core/src/runtime.ts:172](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/runtime.ts#L172)

Set the loader for EcmaScript modules requested by any context in this
runtime.

The loader can be removed with [removeModuleLoader](#removemoduleloader).

#### Parameters

##### moduleLoader

[`JSModuleLoader`](../interfaces/JSModuleLoader.md)

##### moduleNormalizer?

[`JSModuleNormalizer`](../interfaces/JSModuleNormalizer.md)

#### Returns

`void`
