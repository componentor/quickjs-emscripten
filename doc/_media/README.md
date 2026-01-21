# @componentor/quickjs-emscripten-worker-pool

A Worker Pool for parallel QuickJS execution with **graceful degradation** to single-threaded mode when SharedArrayBuffer is unavailable.

## Features

- **Parallel Execution** - Run multiple QuickJS evaluations concurrently across Web Workers
- **Graceful Degradation** - Automatically falls back to single-threaded mode when SharedArrayBuffer is unavailable (no COOP/COEP headers)
- **Cross-Platform** - Works in both browsers (Web Workers) and Node.js (worker_threads)
- **Unified API** - Same API regardless of threading mode
- **Task Queuing** - Queue tasks when all workers are busy
- **Timeout Support** - Cancel long-running tasks with configurable timeouts
- **Verbose Logging** - Debug mode to verify multi-threading is working

## Installation

```bash
npm install @componentor/quickjs-emscripten-worker-pool @componentor/quickjs-singlefile-cjs-release-sync
```

## Quick Start

```typescript
import {
  newWorkerPool,
  isMultiThreadingSupported,
} from "@componentor/quickjs-emscripten-worker-pool"

// Check if multi-threading is available
console.log("Multi-threading available:", isMultiThreadingSupported())

// Create pool - automatically chooses best mode
const pool = await newWorkerPool({
  poolSize: 4,
  verbose: true, // Enable logging to verify multi-threading
})

console.log("Using workers:", pool.isMultiThreaded)

// Execute tasks in parallel
const results = await Promise.all([
  pool.evalCode("1 + 1"),
  pool.evalCode("2 * 2"),
  pool.evalCode("Math.sqrt(16)"),
])

// Clean up
pool.dispose()
```

## Browser Setup for Multi-Threading

For multi-threaded mode to work in browsers, you need **Cross-Origin Isolation** via HTTP headers.

### Required HTTP Headers

Your server must send these headers:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from "vite"

export default defineConfig({
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  // For production builds
  preview: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
})
```

### Webpack Dev Server

```javascript
// webpack.config.js
module.exports = {
  devServer: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
}
```

### Nginx

```nginx
add_header Cross-Origin-Opener-Policy same-origin;
add_header Cross-Origin-Embedder-Policy require-corp;
```

### Vercel

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" }
      ]
    }
  ]
}
```

## API Reference

### `newWorkerPool(options?)`

Creates a new worker pool.

```typescript
const pool = await newWorkerPool({
  // Number of workers (default: navigator.hardwareConcurrency or 4)
  poolSize: 4,

  // Pre-initialize all workers immediately (default: false)
  preWarm: true,

  // Default timeout in ms for all tasks (default: 0 = no timeout)
  defaultTimeout: 5000,

  // Maximum queued tasks (default: 0 = unlimited)
  maxQueueSize: 100,

  // Throw error if multi-threading unavailable (default: false)
  forceMultiThreaded: false,

  // Force single-threaded mode (default: false)
  forceSingleThreaded: false,

  // Enable verbose console logging (default: false)
  verbose: true,

  // QuickJS context options
  contextOptions: {},
})
```

### Pool Methods

```typescript
// Evaluate code and get result
const result = await pool.evalCode("1 + 1")
// result: { value: 2 } or { error: { name, message } }

// With timeout (overrides pool default)
const result = await pool.evalCode("while(true){}", { timeout: 1000 })
// result: { error: { name: 'TimeoutError', message: '...', isTimeout: true } }

// Batch execution
const results = await pool.evalCodeBatch([{ code: "1 + 1" }, { code: "2 + 2", timeout: 1000 }])

// Submit task with handle for cancellation
const handle = pool.submit({ code: "..." })
handle.cancel() // Cancel if still pending
await handle.promise

// Check pool status
pool.isMultiThreaded // true if using real workers
pool.busyWorkers // workers currently executing
pool.availableWorkers // workers ready for tasks
pool.queuedTasks // tasks waiting in queue

// Get statistics
const stats = pool.getStats()
// { poolSize, busyWorkers, availableWorkers, queuedTasks,
//   completedTasks, failedTasks, averageExecutionTimeMs, isMultiThreaded }

// Clean up
pool.dispose()
```

### Capability Detection

```typescript
import {
  isMultiThreadingSupported,
  getDefaultPoolSize,
} from "@componentor/quickjs-emscripten-worker-pool"

// Check if SharedArrayBuffer is available
if (isMultiThreadingSupported()) {
  console.log("Multi-threading available!")
}

// Get recommended pool size
const poolSize = getDefaultPoolSize() // navigator.hardwareConcurrency or 4
```

## Debugging with Verbose Mode

Enable `verbose: true` to see detailed logs:

```typescript
const pool = await newWorkerPool({ verbose: true })
```

Console output:

```
[WorkerPool] Creating pool with options: { poolSize: 4, ... }
[WorkerPool] Initializing multi-threaded executor with 4 workers...
[WorkerPool] Creating new worker #1 (lazy init, 1/4)
[WorkerPool] Worker #1: Spawning worker thread...
[WorkerPool] Worker #1: QuickJS runtime initialized
[WorkerPool] Pool created successfully. Mode: MULTI-THREADED
[WorkerPool] Executing task-1: "1 + 1" [busy: 1/4, queued: 0]
[WorkerPool] Worker #1: Starting task-1
[WorkerPool] Worker #1: Task task-1 completed
[WorkerPool] Task task-1 completed in 5.23ms Result: 2
```

## Performance

Multi-threading improves performance when running multiple tasks concurrently:

**Sequential (single-threaded):**

```
Task 1: [====100ms====]
Task 2:                [====100ms====]
Task 3:                               [====100ms====]
Total: ~300ms
```

**Parallel (4 workers):**

```
Worker 1: [====100ms====]
Worker 2: [====100ms====]
Worker 3: [====100ms====]
Worker 4: (idle)
Total: ~100ms
```

## Error Handling

```typescript
const result = await pool.evalCode('throw new Error("test")')

if (result.error) {
  console.log(result.error.name) // "Error"
  console.log(result.error.message) // "test"
  console.log(result.error.stack) // Stack trace
  console.log(result.error.isTimeout) // true if timed out
}
```

## License

MIT
