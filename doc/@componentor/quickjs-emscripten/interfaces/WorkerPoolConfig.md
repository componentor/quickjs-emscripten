[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten](../README.md) / WorkerPoolConfig

# Interface: WorkerPoolConfig

Defined in: [packages/quickjs-emscripten/src/mod.ts:27](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten/src/mod.ts#L27)

Global configuration for worker pool contexts.
These settings are used as defaults when calling [newWorkerAsyncContext](../README.md#newworkerasynccontext).

## Properties

### bootstrapCode?

> `optional` **bootstrapCode**: `string`

Defined in: [packages/quickjs-emscripten/src/mod.ts:53](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten/src/mod.ts#L53)

Bootstrap code that runs on each worker during initialization.
Use this to set up shared state like mocks, utilities, etc.

#### Example

```typescript
configureWorkerPool({
  bootstrapCode: `
    globalThis.mockFetch = (url) => ({ status: 200, url })
  `
})
```

***

### defaultTimeout?

> `optional` **defaultTimeout**: `number`

Defined in: [packages/quickjs-emscripten/src/mod.ts:73](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten/src/mod.ts#L73)

Default timeout for code execution in milliseconds.

#### Default

```ts
0 (no timeout)
```

***

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [packages/quickjs-emscripten/src/mod.ts:32](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten/src/mod.ts#L32)

Whether worker pool is enabled.

#### Default

```ts
true
```

***

### poolSize?

> `optional` **poolSize**: `number`

Defined in: [packages/quickjs-emscripten/src/mod.ts:38](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten/src/mod.ts#L38)

Number of workers in the pool.

#### Default

```ts
navigator.hardwareConcurrency or 4
```

***

### useSession?

> `optional` **useSession**: `boolean`

Defined in: [packages/quickjs-emscripten/src/mod.ts:61](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten/src/mod.ts#L61)

Whether to use a session for state persistence.
- false (default): Parallel execution, each eval may hit different worker
- true: Sequential execution, all evals go to same worker (state persists)

#### Default

```ts
false
```

***

### verbose?

> `optional` **verbose**: `boolean`

Defined in: [packages/quickjs-emscripten/src/mod.ts:67](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten/src/mod.ts#L67)

Enable verbose logging for debugging.

#### Default

```ts
false
```
