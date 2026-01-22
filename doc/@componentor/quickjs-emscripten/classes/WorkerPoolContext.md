[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten](../README.md) / WorkerPoolContext

# Class: WorkerPoolContext

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:468

A context-like wrapper around QuickJSWorkerPool that provides an API
similar to QuickJSAsyncContext for seamless integration.

This allows clients to use a familiar interface while automatically
benefiting from parallel worker execution when available.

Key differences from QuickJSAsyncContext:
- No handle-based operations (newFunction, newObject, etc.)
- Values are automatically serialized/deserialized across worker boundaries
- Multiple concurrent evalCodeAsync calls are distributed across workers
- State is isolated per-worker (use sessions for persistent state)

## Example

```typescript
// Create a pool-backed context
const pool = await newWorkerPool({ poolSize: 4 })
const context = new WorkerPoolContext(pool)

// Use like QuickJSAsyncContext
const result = await context.evalCodeAsync('1 + 1')
if (result.value !== undefined) {
  console.log('Result:', result.value) // 2
}

// Parallel execution - multiple calls are distributed across workers
const results = await Promise.all([
  context.evalCodeAsync('Math.sqrt(16)'),
  context.evalCodeAsync('Math.pow(2, 10)'),
  context.evalCodeAsync('[1,2,3].map(x => x * 2)'),
])

context.dispose()
```

## Implements

- [`Disposable`](../interfaces/Disposable.md)

## Constructors

### Constructor

> **new WorkerPoolContext**(`pool`): `WorkerPoolContext`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:476

Create a new WorkerPoolContext wrapping the given pool.

#### Parameters

##### pool

[`QuickJSWorkerPool`](QuickJSWorkerPool.md)

The worker pool to use for code execution

#### Returns

`WorkerPoolContext`

## Accessors

### alive

#### Get Signature

> **get** **alive**(): `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:480

Whether the context is still alive (not disposed).

##### Returns

`boolean`

#### Implementation of

[`Disposable`](../interfaces/Disposable.md).[`alive`](../interfaces/Disposable.md#alive)

***

### isMultiThreaded

#### Get Signature

> **get** **isMultiThreaded**(): `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:484

Whether the underlying pool is using multi-threading.

##### Returns

`boolean`

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:558

A method that is used to release resources held by an object. Called by the semantics of the `using` statement.

#### Returns

`void`

#### Implementation of

[`Disposable`](../interfaces/Disposable.md).[`[dispose]`](../interfaces/Disposable.md#dispose)

***

### dispose()

> **dispose**(): `void`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:557

Dispose of the context.

Note: This does NOT dispose the underlying pool. The pool should be
disposed separately when no longer needed.

#### Returns

`void`

#### Implementation of

[`Disposable`](../interfaces/Disposable.md).[`dispose`](../interfaces/Disposable.md#dispose-2)

***

### evalCodeAsync()

> **evalCodeAsync**(`code`, `filenameOrOptions?`): `Promise`\<[`WorkerPoolContextResult`](../README.md#workerpoolcontextresult)\<`unknown`\>\>

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:510

Evaluate JavaScript code asynchronously.

This method mirrors QuickJSAsyncContext.evalCodeAsync() but routes
execution to a worker pool for parallel processing.

#### Parameters

##### code

`string`

JavaScript code to evaluate

##### filenameOrOptions?

Filename string or evaluation options

`string` | [`WorkerPoolEvalOptions`](../interfaces/WorkerPoolEvalOptions.md)

#### Returns

`Promise`\<[`WorkerPoolContextResult`](../README.md#workerpoolcontextresult)\<`unknown`\>\>

Promise resolving to the evaluation result

#### Example

```typescript
// Simple usage
const result = await context.evalCodeAsync('1 + 1')

// With filename
const result = await context.evalCodeAsync('throw new Error("oops")', 'test.js')

// With options
const result = await context.evalCodeAsync('while(true){}', {
  filename: 'infinite.js',
  timeout: 1000,
})
```

***

### evalCodeBatch()

> **evalCodeBatch**(`tasks`): `Promise`\<[`WorkerPoolContextResult`](../README.md#workerpoolcontextresult)\<`unknown`\>[]\>

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:536

Evaluate multiple code snippets in parallel.

This takes advantage of the worker pool to execute all tasks
concurrently across available workers.

#### Parameters

##### tasks

(`string` \| \{ `code`: `string`; `filename?`: `string`; `timeout?`: `number`; \})[]

Array of code snippets or task objects

#### Returns

`Promise`\<[`WorkerPoolContextResult`](../README.md#workerpoolcontextresult)\<`unknown`\>[]\>

Promise resolving to array of results in the same order

#### Example

```typescript
const results = await context.evalCodeBatch([
  '1 + 1',
  '2 * 2',
  'Math.sqrt(16)',
])
console.log(results.map(r => r.value)) // [2, 4, 4]

// With options
const results = await context.evalCodeBatch([
  { code: 'compute()', timeout: 5000 },
  { code: 'process()', timeout: 10000 },
])
```

***

### unwrapResult()

> **unwrapResult**\<`T`\>(`result`): `T`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:550

Unwrap a result, throwing if it's an error.

This is a convenience method that mirrors QuickJSContext.unwrapResult().

#### Type Parameters

##### T

`T`

#### Parameters

##### result

[`WorkerPoolContextResult`](../README.md#workerpoolcontextresult)\<`T`\>

The result to unwrap

#### Returns

`T`

The value if successful

#### Throws

Error if the result contains an error
