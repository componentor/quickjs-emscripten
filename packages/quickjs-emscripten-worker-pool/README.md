# @componentor/quickjs-emscripten-worker-pool

A Worker Pool for parallel QuickJS execution with **graceful degradation** to single-threaded mode when SharedArrayBuffer is unavailable.

## Features

- **Parallel Execution** - Run multiple QuickJS evaluations concurrently across Web Workers
- **Full Async Support** - Uses asyncify variants with `evalCodeAsync` for true top-level await (TLA) support
- **Context-Compatible API** - `WorkerPoolContext` provides familiar QuickJSAsyncContext-like interface
- **Shared Filesystem** - Optional WasmFS variant enables shared OPFS filesystem across workers
- **Graceful Degradation** - Automatically falls back to single-threaded mode when SharedArrayBuffer is unavailable (no COOP/COEP headers)
- **Cross-Platform** - Works in both browsers (Web Workers) and Node.js (worker_threads)
- **Unified API** - Same API regardless of threading mode
- **Task Queuing** - Queue tasks when all workers are busy
- **Timeout Support** - Cancel long-running tasks with configurable timeouts
- **Verbose Logging** - Debug mode to verify multi-threading is working

## Installation

```bash
npm install @componentor/quickjs-emscripten-worker-pool @componentor/quickjs-singlefile-cjs-release-asyncify
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

## Context-Compatible API

For a familiar QuickJSAsyncContext-like interface, use the `WorkerPoolContext` wrapper:

```typescript
import { newWorkerPool, newWorkerPoolContext } from "@componentor/quickjs-emscripten-worker-pool"

// Create a pool-backed context
const pool = await newWorkerPool({ poolSize: 4 })
const context = newWorkerPoolContext(pool)

// Use like QuickJSAsyncContext.evalCodeAsync()
const result = await context.evalCodeAsync("1 + 1")
if (result.value !== undefined) {
  console.log("Result:", result.value) // 2
}

// Parallel execution - multiple calls are distributed across workers
const results = await Promise.all([
  context.evalCodeAsync("Math.sqrt(16)"),
  context.evalCodeAsync("Math.pow(2, 10)"),
  context.evalCodeAsync("[1,2,3].map(x => x * 2)"),
])

// Batch execution for convenience
const batchResults = await context.evalCodeBatch([
  "1 + 1",
  { code: "2 * 2", timeout: 5000 },
  "Math.PI",
])

// unwrapResult helper
const value = context.unwrapResult(result) // throws if error

// Clean up
context.dispose()
pool.dispose()
```

The `WorkerPoolContext` provides the same result type as the main runtime, making it easy to switch between local and worker-based execution.

## WorkerEnabledContext (Recommended)

For the most seamless integration, use `WorkerEnabledContext` - a hybrid that combines a local QuickJSAsyncContext with worker pool execution. **By default, it uses parallel execution** across workers with `bootstrapCode` to set up shared state:

```typescript
import { newWorkerEnabledContext } from "@componentor/quickjs-emscripten-worker-pool"

// Create hybrid context with parallel execution (default)
// Use bootstrapCode to set up shared state across all workers
const ctx = await newWorkerEnabledContext({
  poolSize: 4,
  bootstrapCode: `
    // This runs on EVERY worker - perfect for mocks!
    globalThis.mockFetch = (url) => ({ status: 200, url })
    globalThis.config = { apiBase: 'https://api.example.com' }
  `,
})

// Parallel execution - each call may hit a different worker
// All workers have mockFetch and config from bootstrap!
const results = await Promise.all([
  ctx.evalCodeAsync('mockFetch("/api/users")'), // Worker 1
  ctx.evalCodeAsync('mockFetch("/api/posts")'), // Worker 2
  ctx.evalCodeAsync("config.apiBase"), // Worker 3
])

console.log(ctx.dump(results[0].value)) // { status: 200, url: '/api/users' }

ctx.dispose()
```

### Session Mode (State Persistence)

If you need **state to persist across calls** (like a REPL), enable session mode:

```typescript
const ctx = await newWorkerEnabledContext({
  poolSize: 4,
  useSession: true, // All calls go to same worker - state persists
})

// State persists across evalCodeAsync calls
await ctx.evalCodeAsync("globalThis.counter = 0")
await ctx.evalCodeAsync("counter++")
await ctx.evalCodeAsync("counter++")
const result = await ctx.evalCodeAsync("counter")
console.log(ctx.dump(result.value)) // 2

ctx.dispose()
```

### Parallel vs Session Mode

| Feature           | `useSession: false` (default)             | `useSession: true`                |
| ----------------- | ----------------------------------------- | --------------------------------- |
| Parallelism       | Yes - distributed across workers          | No - all calls go to same worker  |
| State persistence | No - use `bootstrapCode` for shared state | Yes - variables/functions persist |
| Use case          | Parallel tasks, HTTP mocking              | REPL, stateful runtime            |

**How it works:**

- **Handle operations** (newFunction, newObject, setProp, etc.) use the local context
- **evalCodeAsync** routes to workers (parallel) or session worker (sequential)
- **bootstrapCode** runs on each worker during initialization
- **Automatic fallback** - uses local context when workers unavailable

This lets you use the familiar QuickJS API while benefiting from parallel worker execution with shared initial state.

## Full Async/Await Support

The worker pool uses **asyncify variants** with `evalCodeAsync` for full **top-level await (TLA)** support. This means async functions and promises work exactly like you'd expect:

```typescript
const pool = await newWorkerPool({ poolSize: 4 })

// Top-level await works! Promises are fully resolved
const result = await pool.evalCode(`
  async function compute() {
    return new Promise(resolve => {
      setTimeout(() => resolve(42), 100)
    })
  }

  // Top-level await - result is the resolved value, not a Promise!
  await compute()
`)

console.log(result.value) // 42

// Synchronous computations work too
const result2 = await pool.evalCode(`
  function fibonacci(n) {
    if (n <= 1) return n
    return fibonacci(n - 1) + fibonacci(n - 2)
  }
  fibonacci(20)
`)

console.log(result2.value) // 6765

pool.dispose()
```

This matches how the main QuickJS runtime handles async code with `evalCodeAsync`.

## Shared Filesystem (WasmFS Variant)

By default, each worker has isolated state. For scenarios where workers need to share files, use the WasmFS variant with OPFS (Origin Private File System):

```typescript
import { newWorkerPool } from "@componentor/quickjs-emscripten-worker-pool"

// Create pool with shared filesystem
const pool = await newWorkerPool({
  poolSize: 4,
  variant: "wasmfs", // Enable shared OPFS filesystem
  opfsMountPath: "/data", // Mount path (default: "/data")
  verbose: true,
})

// Worker 1 writes a file
await pool.evalCode(`
  const fs = std.open('/data/shared.txt', 'w')
  fs.puts('Hello from worker 1!')
  fs.close()
`)

// Worker 2 can read the same file
const result = await pool.evalCode(`
  const fs = std.open('/data/shared.txt', 'r')
  const content = fs.readAsString()
  fs.close()
  content
`)

console.log(result.value) // "Hello from worker 1!"

pool.dispose()
```

### Variant Comparison

| Feature                    | `singlefile` (default)    | `wasmfs`                   |
| -------------------------- | ------------------------- | -------------------------- |
| Worker isolation           | Full isolation            | Shared OPFS filesystem     |
| SharedArrayBuffer required | Yes (for multi-threading) | Yes                        |
| Use case                   | Sandboxed execution       | File-based communication   |
| Performance                | Fastest                   | Slightly slower (file I/O) |

## Sessions (Persistent State)

By default, each `evalCode()` call may run on any available worker, so state doesn't persist between calls. For scenarios requiring persistent state (like a REPL or stateful runtime), use **sessions**:

```typescript
import { newWorkerPool } from "@componentor/quickjs-emscripten-worker-pool"

const pool = await newWorkerPool({ poolSize: 4, verbose: true })

// Create a session - pins all evals to one worker
const session = await pool.createSession()

// State persists across evaluations
await session.evalCode("globalThis.counter = 0")
await session.evalCode("counter++")
await session.evalCode("counter++")
const result = await session.evalCode("counter")
console.log(result.value) // 2

// Define functions that persist
await session.evalCode(`
  function greet(name) {
    return 'Hello, ' + name + '!'
  }
`)
const greeting = await session.evalCode('greet("World")')
console.log(greeting.value) // "Hello, World!"

// Release when done - returns worker to pool
session.release()

pool.dispose()
```

### Sessions with Shared Filesystem

Combine sessions with the `wasmfs` variant for a full runtime experience:

```typescript
const pool = await newWorkerPool({
  poolSize: 4,
  variant: "wasmfs",
})

const session = await pool.createSession()

// Persistent state + persistent filesystem
await session.evalCode(`
  // Write config that persists
  const fs = std.open('/data/config.json', 'w')
  fs.puts(JSON.stringify({ initialized: true }))
  fs.close()
`)

// Later evaluations can read it
const config = await session.evalCode(`
  const fs = std.open('/data/config.json', 'r')
  const data = JSON.parse(fs.readAsString())
  fs.close()
  data
`)
console.log(config.value) // { initialized: true }

session.release()
```

### Multiple Concurrent Sessions

You can create multiple sessions for parallel stateful runtimes:

```typescript
const pool = await newWorkerPool({ poolSize: 4 })

// Each session has its own isolated state
const session1 = await pool.createSession()
const session2 = await pool.createSession()

await session1.evalCode('globalThis.name = "Alice"')
await session2.evalCode('globalThis.name = "Bob"')

const r1 = await session1.evalCode("name") // "Alice"
const r2 = await session2.evalCode("name") // "Bob"

session1.release()
session2.release()
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

  // QuickJS variant: "singlefile" (isolated) or "wasmfs" (shared filesystem)
  variant: "singlefile",

  // OPFS mount path when using "wasmfs" variant (default: "/data")
  opfsMountPath: "/data",

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
pool.activeSessionCount // number of active sessions

// Get statistics
const stats = pool.getStats()
// { poolSize, busyWorkers, availableWorkers, queuedTasks,
//   completedTasks, failedTasks, averageExecutionTimeMs, isMultiThreaded }

// Clean up
pool.dispose()
```

### Session Methods

```typescript
// Create a session for persistent state
const session = await pool.createSession()

// Evaluate code in the session (state persists)
const result = await session.evalCode("globalThis.x = 42")
const result2 = await session.evalCode("x + 1") // { value: 43 }

// With timeout
const result = await session.evalCode("while(true){}", { timeout: 1000 })

// Check session status
session.alive // true if session is active
session.sessionId // unique session identifier
session.workerId // ID of the pinned worker

// Release session (return worker to pool)
session.release()
```

### WorkerPoolContext Methods

```typescript
import { newWorkerPoolContext } from "@componentor/quickjs-emscripten-worker-pool"

// Create context wrapper around pool
const context = newWorkerPoolContext(pool)

// Evaluate code (mirrors QuickJSAsyncContext.evalCodeAsync)
const result = await context.evalCodeAsync("1 + 1")
// result: { value: 2 } or { error: { name, message } }

// With filename for error messages
const result = await context.evalCodeAsync("throw new Error('oops')", "test.js")

// With options
const result = await context.evalCodeAsync("while(true){}", {
  filename: "infinite.js",
  timeout: 1000,
})

// Batch evaluation
const results = await context.evalCodeBatch(["1 + 1", { code: "2 * 2", timeout: 5000 }])

// Unwrap result (throws if error)
const value = context.unwrapResult(result)

// Check status
context.alive // true if not disposed
context.isMultiThreaded // true if using real workers

// Clean up (does NOT dispose the pool)
context.dispose()
```

### WorkerEnabledContext Methods

```typescript
import { newWorkerEnabledContext } from "@componentor/quickjs-emscripten-worker-pool"

// Create with options
const ctx = await newWorkerEnabledContext({
  poolSize: 4,
  // Bootstrap code runs on each worker (great for mocks!)
  bootstrapCode: `globalThis.mockFetch = () => ({ status: 200 })`,
  // Use a session for state persistence (default: false)
  useSession: false,
  // Strategy for routing evalCodeAsync
  evalStrategy: "workers", // "workers" | "local" | "auto"
  // Worker-only mode (no local context for handles)
  workerOnly: false,
  // Other pool options...
})

// Check capabilities
ctx.hasWorkerPool // true if workers available
ctx.isMultiThreaded // true if real multi-threading
ctx.alive // true if not disposed
ctx.usesSession // true if using a session (useSession: true)

// Access underlying components
ctx.localContext // QuickJSAsyncContext (null if workerOnly)
ctx.pool // QuickJSWorkerPool (null if unavailable)
ctx.session // WorkerSession (null if useSession: false)

// Handle operations (use local context)
const obj = ctx.newObject()
const str = ctx.newString("hello")
ctx.setProp(obj, "greeting", str)
ctx.setProp(ctx.global, "myObj", obj)
str.dispose()
obj.dispose()

// Code evaluation (routes to workers)
const result = await ctx.evalCodeAsync("myObj.greeting")
// result: { value: QuickJSHandle } or { error: QuickJSHandle }

// Direct worker evaluation (returns raw values, not handles)
const workerResult = await ctx.evalCodeOnWorkers("1 + 1")
// workerResult: { value: 2 } or { error: { name, message } }

// Batch evaluation across workers
const results = await ctx.evalCodeBatch(["1 + 1", "2 * 2", "3 + 3"])

// Dump handle to JavaScript value
const value = ctx.dump(result.value)

// Clean up
result.value?.dispose()
ctx.dispose()
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
