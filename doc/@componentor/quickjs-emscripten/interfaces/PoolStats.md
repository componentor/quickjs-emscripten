[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten](../README.md) / PoolStats

# Interface: PoolStats

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:165

Statistics about the worker pool.

## Properties

### availableWorkers

> **availableWorkers**: `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:171

Number of workers available to accept tasks

***

### averageExecutionTimeMs

> **averageExecutionTimeMs**: `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:179

Average execution time in milliseconds

***

### busyWorkers

> **busyWorkers**: `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:169

Number of workers currently executing tasks

***

### completedTasks

> **completedTasks**: `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:175

Total number of tasks completed successfully

***

### failedTasks

> **failedTasks**: `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:177

Total number of tasks that failed

***

### isMultiThreaded

> **isMultiThreaded**: `boolean`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:181

Whether the pool is using multi-threading (true) or single-threaded fallback (false)

***

### poolSize

> **poolSize**: `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:167

Total number of workers in the pool

***

### queuedTasks

> **queuedTasks**: `number`

Defined in: packages/quickjs-emscripten-worker-pool/dist/index.d.ts:173

Number of tasks waiting in the queue
