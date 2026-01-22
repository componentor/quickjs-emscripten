[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten](../README.md) / WorkerSession

# Interface: WorkerSession

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:206

A session provides persistent state across multiple evaluations.

Unlike regular pool tasks which may execute on any available worker,
a session pins all evaluations to a single worker, preserving:
- Global variables
- Defined functions
- Module state
- Filesystem state (when using wasmfs variant)

## Example

```typescript
const session = await pool.createSession()

await session.evalCode('globalThis.counter = 0')
await session.evalCode('counter++')
await session.evalCode('counter++')
const result = await session.evalCode('counter')
console.log(result.value) // 2

session.release() // Return worker to pool
```

## Extends

- [`Disposable`](Disposable.md)

## Properties

### alive

> `readonly` **alive**: `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:212

Whether the session is still active

#### Overrides

[`Disposable`](Disposable.md).[`alive`](Disposable.md#alive)

***

### sessionId

> `readonly` **sessionId**: `string`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:208

Unique session identifier

***

### workerId

> `readonly` **workerId**: `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:210

The worker ID this session is pinned to

## Methods

### \[dispose\]()

> **\[dispose\]**(): `void`

Defined in: [packages/quickjs-emscripten-core/src/lifetime.ts:28](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/lifetime.ts#L28)

A method that is used to release resources held by an object. Called by the semantics of the `using` statement.

#### Returns

`void`

#### Inherited from

[`Disposable`](Disposable.md).[`[dispose]`](Disposable.md#dispose)

***

### dispose()

> **dispose**(): `void`

Defined in: [packages/quickjs-emscripten-core/src/lifetime.ts:17](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/lifetime.ts#L17)

Dispose of the underlying resources used by this object.

#### Returns

`void`

#### Inherited from

[`Disposable`](Disposable.md).[`dispose`](Disposable.md#dispose-2)

***

### evalCode()

> **evalCode**(`code`, `options?`): `Promise`\<[`WorkerTaskResult`](../README.md#workertaskresult)\<`unknown`\>\>

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:217

Evaluate code in this session's persistent context.
All evaluations share the same global state.

#### Parameters

##### code

`string`

##### options?

[`SessionEvalOptions`](SessionEvalOptions.md)

#### Returns

`Promise`\<[`WorkerTaskResult`](../README.md#workertaskresult)\<`unknown`\>\>

***

### release()

> **release**(): `void`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:222

Release the session and return the worker to the pool.
After calling release(), the session can no longer be used.

#### Returns

`void`
