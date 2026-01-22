[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten](../README.md) / WorkerEnabledContext

# Class: WorkerEnabledContext

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:650

A hybrid context that combines local QuickJSAsyncContext with worker pool execution.

This allows you to use the familiar QuickJS API while automatically benefiting
from parallel worker execution.

**How it works:**
- By default, uses parallel execution across workers (useSession: false)
- Use `bootstrapCode` to set up shared state (like mocks) on all workers
- Handle operations (newFunction, newObject, etc.) use the local context
- Falls back to local context when workers unavailable

**Use cases:**
- Parallel execution of independent tasks across workers
- Shared initial state via `bootstrapCode` (e.g., HTTP client mocks)
- Use `useSession: true` if you need state to persist across calls

## Example

```typescript
// Create with automatic worker pool and parallel execution (default)
const ctx = await newWorkerEnabledContext({
  poolSize: 4,
  // Bootstrap code runs on each worker - great for mocks!
  bootstrapCode: `
    globalThis.mockFetch = (url) => ({ status: 200, data: 'mocked' })
  `
})

// Parallel execution - each call may hit a different worker
// But all workers have mockFetch available from bootstrap!
const results = await Promise.all([
  ctx.evalCodeAsync('mockFetch("/api/1")'),  // Worker 1
  ctx.evalCodeAsync('mockFetch("/api/2")'),  // Worker 2
  ctx.evalCodeAsync('mockFetch("/api/3")'),  // Worker 3
])

ctx.dispose()
```

## Implements

- [`Disposable`](../interfaces/Disposable.md)

## Accessors

### alive

#### Get Signature

> **get** **alive**(): `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:672

Whether the context is still alive.

##### Returns

`boolean`

#### Implementation of

[`Disposable`](../interfaces/Disposable.md).[`alive`](../interfaces/Disposable.md#alive)

***

### false

#### Get Signature

> **get** **false**(): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:788

Get the false value.

##### Throws

Error if in worker-only mode

##### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

***

### global

#### Get Signature

> **get** **global**(): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:702

The global object of the local context.

##### Throws

Error if in worker-only mode

##### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

***

### hasWorkerPool

#### Get Signature

> **get** **hasWorkerPool**(): `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:676

Whether workers are available for parallel execution.

##### Returns

`boolean`

***

### isMultiThreaded

#### Get Signature

> **get** **isMultiThreaded**(): `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:680

Whether the worker pool is using real multi-threading.

##### Returns

`boolean`

***

### localContext

#### Get Signature

> **get** **localContext**(): [`QuickJSAsyncContext`](QuickJSAsyncContext.md) \| `null`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:685

The underlying local context (null if worker-only mode).
Use this for advanced handle operations.

##### Returns

[`QuickJSAsyncContext`](QuickJSAsyncContext.md) \| `null`

***

### null

#### Get Signature

> **get** **null**(): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:778

Get the null value.

##### Throws

Error if in worker-only mode

##### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

***

### pool

#### Get Signature

> **get** **pool**(): [`QuickJSWorkerPool`](QuickJSWorkerPool.md) \| `null`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:689

The underlying worker pool (null if not available).

##### Returns

[`QuickJSWorkerPool`](QuickJSWorkerPool.md) \| `null`

***

### runtime

#### Get Signature

> **get** **runtime**(): [`QuickJSAsyncRuntime`](QuickJSAsyncRuntime.md)

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:707

The runtime of the local context.

##### Throws

Error if in worker-only mode

##### Returns

[`QuickJSAsyncRuntime`](QuickJSAsyncRuntime.md)

***

### session

#### Get Signature

> **get** **session**(): [`WorkerSession`](../interfaces/WorkerSession.md) \| `null`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:693

The underlying worker session (null if not using sessions or unavailable).

##### Returns

[`WorkerSession`](../interfaces/WorkerSession.md) \| `null`

***

### true

#### Get Signature

> **get** **true**(): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:783

Get the true value.

##### Throws

Error if in worker-only mode

##### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

***

### undefined

#### Get Signature

> **get** **undefined**(): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:773

Get the undefined value.

##### Throws

Error if in worker-only mode

##### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

***

### usesSession

#### Get Signature

> **get** **usesSession**(): `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:697

Whether this context uses a session for persistent state.

##### Returns

`boolean`

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:842

A method that is used to release resources held by an object. Called by the semantics of the `using` statement.

#### Returns

`void`

#### Implementation of

[`Disposable`](../interfaces/Disposable.md).[`[dispose]`](../interfaces/Disposable.md#dispose)

***

### callFunction()

> **callFunction**(`func`, `thisVal`, ...`args`): [`VmCallResult`](../README.md#vmcallresult)\<[`QuickJSHandle`](../README.md#quickjshandle)\>

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:818

Call a function.

#### Parameters

##### func

[`QuickJSHandle`](../README.md#quickjshandle)

##### thisVal

[`QuickJSHandle`](../README.md#quickjshandle)

##### args

...[`QuickJSHandle`](../README.md#quickjshandle)[]

#### Returns

[`VmCallResult`](../README.md#vmcallresult)\<[`QuickJSHandle`](../README.md#quickjshandle)\>

#### Throws

Error if in worker-only mode

***

### dispose()

> **dispose**(): `void`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:841

Dispose of the context and all resources.

#### Returns

`void`

#### Implementation of

[`Disposable`](../interfaces/Disposable.md).[`dispose`](../interfaces/Disposable.md#dispose-2)

***

### dump()

> **dump**(`handle`): `unknown`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:823

Dump a handle to a JavaScript value.

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

`unknown`

#### Throws

Error if in worker-only mode

***

### evalCodeAsync()

> **evalCodeAsync**(`code`, `filename?`, `options?`): `Promise`\<[`VmCallResult`](../README.md#vmcallresult)\<[`QuickJSHandle`](../README.md#quickjshandle)\>\>

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:722

Evaluate JavaScript code asynchronously.

By default (useSession: false), this routes to any available worker for parallel execution.
Use `bootstrapCode` to set up shared state across all workers.

When useSession is true, all calls go to the same worker (state persists).

Falls back to the local context when workers are unavailable.

#### Parameters

##### code

`string`

JavaScript code to evaluate

##### filename?

`string`

Optional filename for error messages

##### options?

Optional evaluation options

`number` | [`ContextEvalOptions`](../interfaces/ContextEvalOptions.md)

#### Returns

`Promise`\<[`VmCallResult`](../README.md#vmcallresult)\<[`QuickJSHandle`](../README.md#quickjshandle)\>\>

***

### evalCodeBatch()

> **evalCodeBatch**(`tasks`): `Promise`\<[`WorkerTaskResult`](../README.md#workertaskresult)\<`unknown`\>[]\>

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:734

Evaluate multiple code snippets in parallel across workers.

#### Parameters

##### tasks

(`string` \| \{ `code`: `string`; `filename?`: `string`; `timeout?`: `number`; \})[]

#### Returns

`Promise`\<[`WorkerTaskResult`](../README.md#workertaskresult)\<`unknown`\>[]\>

***

### evalCodeOnWorkers()

> **evalCodeOnWorkers**(`code`, `options?`): `Promise`\<[`WorkerTaskResult`](../README.md#workertaskresult)\<`unknown`\>\>

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:727

Evaluate code on workers and return the raw worker result.
Use this when you don't need QuickJS handles.

#### Parameters

##### code

`string`

##### options?

###### filename?

`string`

###### timeout?

`number`

#### Returns

`Promise`\<[`WorkerTaskResult`](../README.md#workertaskresult)\<`unknown`\>\>

***

### getBigInt()

> **getBigInt**(`handle`): `bigint`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:803

Get a BigInt from a handle.

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

`bigint`

#### Throws

Error if in worker-only mode

***

### getNumber()

> **getNumber**(`handle`): `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:798

Get a number from a handle.

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

`number`

#### Throws

Error if in worker-only mode

***

### getProp()

> **getProp**(`handle`, `key`): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:808

Get a property from an object.

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

##### key

`string` | [`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Throws

Error if in worker-only mode

***

### getString()

> **getString**(`handle`): `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:793

Get a string from a handle.

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

`string`

#### Throws

Error if in worker-only mode

***

### newArray()

> **newArray**(): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:753

Create a new QuickJS array.

#### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Throws

Error if in worker-only mode

***

### newBigInt()

> **newBigInt**(`num`): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:768

Create a new QuickJS BigInt.

#### Parameters

##### num

`bigint`

#### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Throws

Error if in worker-only mode

***

### newFunction()

> **newFunction**(`name`, `fn`): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:743

Create a new QuickJS function.

#### Parameters

##### name

`string`

##### fn

(`this`, ...`args`) => [`QuickJSHandle`](../README.md#quickjshandle) \| `undefined`

#### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Throws

Error if in worker-only mode

***

### newNumber()

> **newNumber**(`num`): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:763

Create a new QuickJS number.

#### Parameters

##### num

`number`

#### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Throws

Error if in worker-only mode

***

### newObject()

> **newObject**(`prototype?`): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:748

Create a new QuickJS object.

#### Parameters

##### prototype?

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Throws

Error if in worker-only mode

***

### newString()

> **newString**(`str`): [`QuickJSHandle`](../README.md#quickjshandle)

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:758

Create a new QuickJS string.

#### Parameters

##### str

`string`

#### Returns

[`QuickJSHandle`](../README.md#quickjshandle)

#### Throws

Error if in worker-only mode

***

### setProp()

> **setProp**(`handle`, `key`, `value`): `void`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:813

Set a property on an object.

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

##### key

`string` | [`QuickJSHandle`](../README.md#quickjshandle)

##### value

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

`void`

#### Throws

Error if in worker-only mode

***

### typeof()

> **typeof**(`handle`): `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:828

Get the type of a handle.

#### Parameters

##### handle

[`QuickJSHandle`](../README.md#quickjshandle)

#### Returns

`string`

#### Throws

Error if in worker-only mode

***

### create()

> `static` **create**(`options?`): `Promise`\<`WorkerEnabledContext`\>

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:668

Create a new WorkerEnabledContext.

Automatically creates a worker pool when SharedArrayBuffer is available,
falling back to local-only execution otherwise.

By default, uses parallel execution (useSession: false). Use `bootstrapCode`
to set up shared state across all workers.

#### Parameters

##### options?

[`WorkerEnabledContextOptions`](../interfaces/WorkerEnabledContextOptions.md)

#### Returns

`Promise`\<`WorkerEnabledContext`\>
