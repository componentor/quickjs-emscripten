[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten](../README.md) / QuickJSWorkerPool

# Class: QuickJSWorkerPool

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:279

A pool of workers for parallel QuickJS execution.

Each worker runs in a separate thread with its own isolated WASM module
and QuickJS context, providing true parallelism for CPU-bound tasks.

When SharedArrayBuffer is not available (no COOP/COEP headers), the pool
automatically falls back to single-threaded execution on the main thread.

## Example

```typescript
const pool = await newWorkerPool({ poolSize: 4 })

// Check if we're using real workers
console.log('Multi-threaded:', pool.isMultiThreaded)

// Execute tasks in parallel (or sequentially in fallback mode)
const results = await Promise.all([
  pool.evalCode('1 + 1'),
  pool.evalCode('2 * 2'),
  pool.evalCode('Math.sqrt(16)'),
])

// Clean up
pool.dispose()
```

## Implements

- [`Disposable`](../interfaces/Disposable.md)

## Accessors

### activeSessionCount

#### Get Signature

> **get** **activeSessionCount**(): `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:325

Number of active sessions.

##### Returns

`number`

***

### alive

#### Get Signature

> **get** **alive**(): `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:309

Whether the pool is still alive (not disposed).

##### Returns

`boolean`

#### Implementation of

[`Disposable`](../interfaces/Disposable.md).[`alive`](../interfaces/Disposable.md#alive)

***

### availableWorkers

#### Get Signature

> **get** **availableWorkers**(): `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:317

Number of workers available to accept tasks.

##### Returns

`number`

***

### busyWorkers

#### Get Signature

> **get** **busyWorkers**(): `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:313

Number of workers currently executing tasks.

##### Returns

`number`

***

### isMultiThreaded

#### Get Signature

> **get** **isMultiThreaded**(): `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:305

Whether the pool is using multi-threading (true) or single-threaded fallback (false).

##### Returns

`boolean`

***

### queuedTasks

#### Get Signature

> **get** **queuedTasks**(): `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:321

Number of tasks waiting in the queue.

##### Returns

`number`

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:388

A method that is used to release resources held by an object. Called by the semantics of the `using` statement.

#### Returns

`void`

#### Implementation of

[`Disposable`](../interfaces/Disposable.md).[`[dispose]`](../interfaces/Disposable.md#dispose)

***

### createSession()

> **createSession**(): `Promise`\<[`WorkerSession`](../interfaces/WorkerSession.md)\>

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:351

Create a session for persistent state across multiple evaluations.

A session pins all evaluations to a single worker, preserving:
- Global variables
- Defined functions
- Module state
- Filesystem state (when using wasmfs variant)

#### Returns

`Promise`\<[`WorkerSession`](../interfaces/WorkerSession.md)\>

A session object for persistent evaluations

#### Throws

If the pool has been disposed

#### Throws

If no workers are available

#### Example

```typescript
const session = await pool.createSession()

await session.evalCode('globalThis.counter = 0')
await session.evalCode('counter++')
const result = await session.evalCode('counter')
console.log(result.value) // 1

session.release() // Return worker to pool
```

***

### dispose()

> **dispose**(): `void`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:387

Dispose of the pool and all its workers.
Rejects any pending tasks and releases all sessions.

#### Returns

`void`

#### Implementation of

[`Disposable`](../interfaces/Disposable.md).[`dispose`](../interfaces/Disposable.md#dispose-2)

***

### evalCode()

> **evalCode**(`code`, `options?`): `Promise`\<[`WorkerTaskResult`](../README.md#workertaskresult)\<`unknown`\>\>

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:359

Evaluate JavaScript code in an available worker.

#### Parameters

##### code

`string`

JavaScript code to evaluate

##### options?

`Partial`\<`Omit`\<[`WorkerTask`](../interfaces/WorkerTask.md), `"code"`\>\>

Optional task options (timeout, filename, priority)

#### Returns

`Promise`\<[`WorkerTaskResult`](../README.md#workertaskresult)\<`unknown`\>\>

The result of the evaluation

***

### evalCodeBatch()

> **evalCodeBatch**(`tasks`): `Promise`\<[`WorkerTaskResult`](../README.md#workertaskresult)\<`unknown`\>[]\>

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:366

Execute multiple tasks and return when all complete.

#### Parameters

##### tasks

[`WorkerTask`](../interfaces/WorkerTask.md)[]

Array of tasks to execute

#### Returns

`Promise`\<[`WorkerTaskResult`](../README.md#workertaskresult)\<`unknown`\>[]\>

Array of results in the same order as the input tasks

***

### getStats()

> **getStats**(): [`PoolStats`](../interfaces/PoolStats.md)

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:382

Get pool statistics.

#### Returns

[`PoolStats`](../interfaces/PoolStats.md)

***

### submit()

> **submit**(`task`): [`TaskHandle`](../interfaces/TaskHandle.md)

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:376

Submit a task and get a handle for status checking and cancellation.

#### Parameters

##### task

[`WorkerTask`](../interfaces/WorkerTask.md)

The task to execute

#### Returns

[`TaskHandle`](../interfaces/TaskHandle.md)

A handle to the pending task

#### Throws

If the pool has been disposed

#### Throws

If the queue is full

***

### create()

> `static` **create**(`options?`): `Promise`\<`QuickJSWorkerPool`\>

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:301

Create a new worker pool.

#### Parameters

##### options?

[`WorkerPoolOptions`](../interfaces/WorkerPoolOptions.md)

Configuration options for the pool

#### Returns

`Promise`\<`QuickJSWorkerPool`\>

A new QuickJSWorkerPool instance

#### Throws

If forceMultiThreaded is true and
  SharedArrayBuffer is not available
