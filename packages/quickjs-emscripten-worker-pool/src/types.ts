import type { ContextOptions, Disposable } from "@componentor/quickjs-emscripten-core"

/**
 * Available QuickJS variants for the worker pool.
 *
 * - `"singlefile"` (default): Isolated workers with no shared state.
 *   Best for sandboxed execution where workers don't need to share data.
 *
 * - `"wasmfs"`: Workers with shared OPFS filesystem.
 *   All workers mount the same OPFS directory, enabling file-based communication.
 *   Requires SharedArrayBuffer (COOP/COEP headers in browsers).
 */
export type WorkerPoolVariant = "singlefile" | "wasmfs"

/**
 * Configuration options for creating a worker pool.
 */
export interface WorkerPoolOptions {
  /**
   * Number of workers in the pool.
   * Defaults to `navigator.hardwareConcurrency` in browsers, or 4 in Node.js.
   */
  poolSize?: number

  /**
   * QuickJS variant to use in workers.
   *
   * - `"singlefile"` (default): Isolated workers, no shared filesystem.
   * - `"wasmfs"`: Workers share an OPFS-backed filesystem.
   *
   * When using `"wasmfs"`, you can configure the mount path with `opfsMountPath`.
   */
  variant?: WorkerPoolVariant

  /**
   * OPFS mount path when using the "wasmfs" variant.
   * All workers will mount the same OPFS directory at this path.
   * Default is "/data".
   *
   * Only used when `variant` is `"wasmfs"`.
   */
  opfsMountPath?: string

  /**
   * Context options applied to each worker's QuickJS context.
   */
  contextOptions?: ContextOptions

  /**
   * Whether to pre-warm workers on pool creation.
   * When true, all workers are initialized immediately.
   * When false (default), workers are initialized lazily on first task.
   */
  preWarm?: boolean

  /**
   * Default timeout in milliseconds for task execution.
   * 0 means no timeout. Default is 0.
   */
  defaultTimeout?: number

  /**
   * Maximum number of tasks that can be queued.
   * When exceeded, new tasks are rejected.
   * 0 means unlimited. Default is 0.
   */
  maxQueueSize?: number

  /**
   * If true, throws an error if multi-threading is not supported.
   * Use this when parallel execution is required for your use case.
   * Default is false (gracefully falls back to single-threaded mode).
   */
  forceMultiThreaded?: boolean

  /**
   * If true, forces single-threaded mode even if multi-threading is supported.
   * Useful for Node.js ESM environments where worker spawning may be complex.
   * Default is false.
   */
  forceSingleThreaded?: boolean

  /**
   * If true, enables verbose logging to console for debugging.
   * Logs worker creation, task dispatch, completion, and timing information.
   * Default is false.
   */
  verbose?: boolean
}

/**
 * A task to execute in a worker.
 */
export interface WorkerTask {
  /** JavaScript code to evaluate */
  code: string

  /** Optional filename for error stack traces */
  filename?: string

  /** Timeout in milliseconds for this specific task (overrides pool default) */
  timeout?: number

  /** Priority: higher numbers execute first. Default is 0. */
  priority?: number
}

/**
 * Error information from a failed worker task.
 */
export interface WorkerTaskError {
  /** Error name (e.g., "Error", "TypeError") */
  name: string

  /** Error message */
  message: string

  /** Stack trace if available */
  stack?: string

  /** True if the error was caused by a timeout */
  isTimeout?: boolean

  /** True if the worker crashed unexpectedly */
  isWorkerCrash?: boolean

  /** True if the task was cancelled */
  isCancelled?: boolean
}

/**
 * Result of a worker task execution.
 * Follows the SuccessOrFail pattern from quickjs-emscripten-core.
 */
export type WorkerTaskResult<T = unknown> =
  | { value: T; error?: undefined }
  | { value?: undefined; error: WorkerTaskError }

/**
 * Handle to a pending task, allowing cancellation and status checking.
 */
export interface TaskHandle<T = unknown> {
  /** Promise that resolves when the task completes */
  readonly promise: Promise<WorkerTaskResult<T>>

  /** Cancel the task. If queued, removes from queue. If executing, attempts to abort. */
  cancel(): void

  /** Whether the task is still pending (queued or executing) */
  readonly pending: boolean

  /** Unique identifier for this task */
  readonly taskId: string
}

/**
 * Statistics about the worker pool.
 */
export interface PoolStats {
  /** Total number of workers in the pool */
  poolSize: number

  /** Number of workers currently executing tasks */
  busyWorkers: number

  /** Number of workers available to accept tasks */
  availableWorkers: number

  /** Number of tasks waiting in the queue */
  queuedTasks: number

  /** Total number of tasks completed successfully */
  completedTasks: number

  /** Total number of tasks that failed */
  failedTasks: number

  /** Average execution time in milliseconds */
  averageExecutionTimeMs: number

  /** Whether the pool is using multi-threading (true) or single-threaded fallback (false) */
  isMultiThreaded: boolean
}

/**
 * Internal interface for task executors.
 * Implemented by both WorkerPoolExecutor and SingleThreadExecutor.
 */
export interface TaskExecutor extends Disposable {
  /** Execute a task and return the result */
  execute(task: InternalTask): Promise<WorkerTaskResult>

  /** Number of currently busy execution slots */
  readonly busyCount: number

  /** Number of available execution slots */
  readonly availableCount: number

  /** Maximum number of concurrent tasks this executor supports */
  readonly maxConcurrency: number

  /** Whether this executor uses real multi-threading */
  readonly isMultiThreaded: boolean
}

/**
 * Internal task representation with additional tracking fields.
 */
export interface InternalTask extends WorkerTask {
  /** Unique task identifier */
  taskId: string

  /** Timestamp when the task was enqueued */
  enqueuedAt: number
}

/**
 * Internal queued task with promise resolution functions.
 */
export interface QueuedTask {
  task: InternalTask
  resolve: (result: WorkerTaskResult) => void
  reject: (error: Error) => void
  cancelled: boolean
}

/**
 * A session provides persistent state across multiple evaluations.
 *
 * Unlike regular pool tasks which may execute on any available worker,
 * a session pins all evaluations to a single worker, preserving:
 * - Global variables
 * - Defined functions
 * - Module state
 * - Filesystem state (when using wasmfs variant)
 *
 * @example
 * ```typescript
 * const session = await pool.createSession()
 *
 * await session.evalCode('globalThis.counter = 0')
 * await session.evalCode('counter++')
 * await session.evalCode('counter++')
 * const result = await session.evalCode('counter')
 * console.log(result.value) // 2
 *
 * session.release() // Return worker to pool
 * ```
 */
export interface WorkerSession extends Disposable {
  /** Unique session identifier */
  readonly sessionId: string

  /** The worker ID this session is pinned to */
  readonly workerId: number

  /** Whether the session is still active */
  readonly alive: boolean

  /**
   * Evaluate code in this session's persistent context.
   * All evaluations share the same global state.
   */
  evalCode(code: string, options?: SessionEvalOptions): Promise<WorkerTaskResult>

  /**
   * Release the session and return the worker to the pool.
   * After calling release(), the session can no longer be used.
   */
  release(): void
}

/**
 * Options for session evaluation.
 */
export interface SessionEvalOptions {
  /** Optional filename for error stack traces */
  filename?: string

  /** Timeout in milliseconds for this evaluation */
  timeout?: number
}
