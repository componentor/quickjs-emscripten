import type { Disposable } from "@componentor/quickjs-emscripten-core"
import type {
  WorkerPoolOptions,
  WorkerPoolVariant,
  WorkerTask,
  WorkerTaskResult,
  TaskHandle,
  PoolStats,
  TaskExecutor,
  InternalTask,
  QueuedTask,
  WorkerSession,
} from "./types"
import { TaskQueue } from "./task-queue"
import { SingleThreadExecutor } from "./single-thread-executor"
import { WorkerPoolExecutor } from "./worker-pool-executor"
import { WorkerSessionImpl } from "./worker-session"
import { isMultiThreadingSupported, getDefaultPoolSize } from "./capabilities"
import { MultiThreadingNotSupportedError, PoolDisposedError, QueueFullError } from "./errors"
import { createLogger, formatDuration, truncateCode, type Logger } from "./logger"

/**
 * A pool of workers for parallel QuickJS execution.
 *
 * Each worker runs in a separate thread with its own isolated WASM module
 * and QuickJS context, providing true parallelism for CPU-bound tasks.
 *
 * When SharedArrayBuffer is not available (no COOP/COEP headers), the pool
 * automatically falls back to single-threaded execution on the main thread.
 *
 * @example
 * ```typescript
 * const pool = await newWorkerPool({ poolSize: 4 })
 *
 * // Check if we're using real workers
 * console.log('Multi-threaded:', pool.isMultiThreaded)
 *
 * // Execute tasks in parallel (or sequentially in fallback mode)
 * const results = await Promise.all([
 *   pool.evalCode('1 + 1'),
 *   pool.evalCode('2 * 2'),
 *   pool.evalCode('Math.sqrt(16)'),
 * ])
 *
 * // Clean up
 * pool.dispose()
 * ```
 */
export class QuickJSWorkerPool implements Disposable {
  private readonly taskQueue: TaskQueue
  private readonly executor: TaskExecutor
  private readonly logger: Logger
  private taskIdCounter = 0
  private sessionIdCounter = 0
  private completedTasks = 0
  private failedTasks = 0
  private totalExecutionTime = 0
  private _alive = true
  private pendingExecutions = new Map<string, { task: QueuedTask; startTime: number }>()
  private activeSessions = new Map<string, WorkerSessionImpl>()

  private constructor(
    executor: TaskExecutor,
    logger: Logger,
    options: {
      poolSize: number
      variant: WorkerPoolVariant
      opfsMountPath: string
      contextOptions: object
      preWarm: boolean
      defaultTimeout: number
      maxQueueSize: number
      bootstrapCode?: string
    },
  ) {
    this.executor = executor
    this.logger = logger
    this.taskQueue = new TaskQueue(options.maxQueueSize)
  }

  /**
   * Create a new worker pool.
   *
   * @param options Configuration options for the pool
   * @returns A new QuickJSWorkerPool instance
   *
   * @throws {MultiThreadingNotSupportedError} If forceMultiThreaded is true and
   *   SharedArrayBuffer is not available
   */
  static async create(options: WorkerPoolOptions = {}): Promise<QuickJSWorkerPool> {
    const verbose = options.verbose ?? false
    const logger = createLogger(verbose)

    const resolvedOptions = {
      poolSize: options.poolSize ?? getDefaultPoolSize(),
      variant: (options.variant ?? "singlefile") as WorkerPoolVariant,
      opfsMountPath: options.opfsMountPath ?? "/data",
      contextOptions: options.contextOptions ?? {},
      preWarm: options.preWarm ?? false,
      defaultTimeout: options.defaultTimeout ?? 0,
      maxQueueSize: options.maxQueueSize ?? 0,
      bootstrapCode: options.bootstrapCode,
      wasmLocation: options.wasmLocation,
      workerUrl: options.workerUrl,
    }

    const multiThreadSupported = isMultiThreadingSupported()
    const useMultiThreaded = multiThreadSupported && !options.forceSingleThreaded

    logger.log("Creating pool with options:", {
      poolSize: resolvedOptions.poolSize,
      variant: resolvedOptions.variant,
      opfsMountPath:
        resolvedOptions.variant === "wasmfs" ? resolvedOptions.opfsMountPath : undefined,
      preWarm: resolvedOptions.preWarm,
      defaultTimeout: resolvedOptions.defaultTimeout,
      maxQueueSize: resolvedOptions.maxQueueSize,
      multiThreadSupported,
      useMultiThreaded,
    })

    if (options.forceMultiThreaded && !multiThreadSupported) {
      throw new MultiThreadingNotSupportedError()
    }

    // WasmFS variant requires multi-threading support (SharedArrayBuffer)
    if (resolvedOptions.variant === "wasmfs" && !multiThreadSupported) {
      logger.warn("WasmFS variant requires SharedArrayBuffer. Falling back to singlefile variant.")
      resolvedOptions.variant = "singlefile"
    }

    let executor: TaskExecutor
    const createStart = performance.now()

    if (useMultiThreaded) {
      logger.log(
        `Initializing multi-threaded executor with ${resolvedOptions.poolSize} workers (variant: ${resolvedOptions.variant})...`,
      )
      executor = await WorkerPoolExecutor.create({
        poolSize: resolvedOptions.poolSize,
        contextOptions: resolvedOptions.contextOptions,
        variant: resolvedOptions.variant,
        opfsMountPath: resolvedOptions.opfsMountPath,
        preWarm: resolvedOptions.preWarm,
        bootstrapCode: resolvedOptions.bootstrapCode,
        wasmLocation: resolvedOptions.wasmLocation,
        workerUrl: resolvedOptions.workerUrl,
        logger,
      })
      logger.log(
        `Multi-threaded executor ready in ${formatDuration(performance.now() - createStart)}`,
      )
    } else {
      // Graceful fallback to single-threaded execution
      logger.log("Initializing single-threaded executor (fallback mode)...")
      executor = await SingleThreadExecutor.create(
        resolvedOptions.contextOptions,
        resolvedOptions.bootstrapCode,
        logger,
      )
      logger.log(
        `Single-threaded executor ready in ${formatDuration(performance.now() - createStart)}`,
      )
    }

    logger.log(
      `Pool created successfully. Mode: ${useMultiThreaded ? "MULTI-THREADED" : "SINGLE-THREADED"}, Variant: ${resolvedOptions.variant}`,
    )

    return new QuickJSWorkerPool(executor, logger, resolvedOptions)
  }

  /**
   * Whether the pool is using multi-threading (true) or single-threaded fallback (false).
   */
  get isMultiThreaded(): boolean {
    return this.executor.isMultiThreaded
  }

  /**
   * Whether the pool is still alive (not disposed).
   */
  get alive(): boolean {
    return this._alive
  }

  /**
   * Number of workers currently executing tasks.
   */
  get busyWorkers(): number {
    return this.executor.busyCount
  }

  /**
   * Number of workers available to accept tasks.
   */
  get availableWorkers(): number {
    return this.executor.availableCount
  }

  /**
   * Number of tasks waiting in the queue.
   */
  get queuedTasks(): number {
    return this.taskQueue.length
  }

  /**
   * Number of active sessions.
   */
  get activeSessionCount(): number {
    return this.activeSessions.size
  }

  /**
   * Create a session for persistent state across multiple evaluations.
   *
   * A session pins all evaluations to a single worker, preserving:
   * - Global variables
   * - Defined functions
   * - Module state
   * - Filesystem state (when using wasmfs variant)
   *
   * @returns A session object for persistent evaluations
   * @throws {PoolDisposedError} If the pool has been disposed
   * @throws {Error} If no workers are available
   *
   * @example
   * ```typescript
   * const session = await pool.createSession()
   *
   * await session.evalCode('globalThis.counter = 0')
   * await session.evalCode('counter++')
   * const result = await session.evalCode('counter')
   * console.log(result.value) // 1
   *
   * session.release() // Return worker to pool
   * ```
   */
  async createSession(): Promise<WorkerSession> {
    if (!this._alive) {
      throw new PoolDisposedError()
    }

    // Sessions only work with multi-threaded executor
    if (!(this.executor instanceof WorkerPoolExecutor)) {
      throw new Error(
        "Sessions are only supported in multi-threaded mode. " +
          "Ensure SharedArrayBuffer is available (COOP/COEP headers set).",
      )
    }

    const worker = await this.executor.reserveWorkerForSession()
    if (!worker) {
      throw new Error(
        "No workers available for session. " +
          "All workers are reserved or busy. Try releasing existing sessions or increasing pool size.",
      )
    }

    const sessionId = `session-${++this.sessionIdCounter}`
    this.logger.log(`Creating session ${sessionId} on worker #${worker.id}`)

    const session = new WorkerSessionImpl(
      sessionId,
      worker,
      (releasedSession) => {
        this.activeSessions.delete(releasedSession.sessionId)
        if (this.executor instanceof WorkerPoolExecutor) {
          this.executor.releaseReservedWorker(releasedSession.workerId)
        }
      },
      this.logger,
    )

    this.activeSessions.set(sessionId, session)
    return session
  }

  /**
   * Evaluate JavaScript code in an available worker.
   *
   * @param code JavaScript code to evaluate
   * @param options Optional task options (timeout, filename, priority)
   * @returns The result of the evaluation
   */
  async evalCode(
    code: string,
    options?: Partial<Omit<WorkerTask, "code">>,
  ): Promise<WorkerTaskResult> {
    const handle = this.submit({
      code,
      ...options,
    })
    return handle.promise
  }

  /**
   * Execute multiple tasks and return when all complete.
   *
   * @param tasks Array of tasks to execute
   * @returns Array of results in the same order as the input tasks
   */
  async evalCodeBatch(tasks: WorkerTask[]): Promise<WorkerTaskResult[]> {
    const handles = tasks.map((task) => this.submit(task))
    return Promise.all(handles.map((h) => h.promise))
  }

  /**
   * Submit a task and get a handle for status checking and cancellation.
   *
   * @param task The task to execute
   * @returns A handle to the pending task
   *
   * @throws {PoolDisposedError} If the pool has been disposed
   * @throws {QueueFullError} If the queue is full
   */
  submit(task: WorkerTask): TaskHandle {
    if (!this._alive) {
      throw new PoolDisposedError()
    }

    const taskId = `task-${++this.taskIdCounter}`
    let cancelled = false
    let pending = true

    const internalTask: InternalTask = {
      ...task,
      taskId,
      enqueuedAt: Date.now(),
    }

    const promise = new Promise<WorkerTaskResult>((resolve, reject) => {
      const queuedTask: QueuedTask = {
        task: internalTask,
        resolve: (result) => {
          pending = false
          this.pendingExecutions.delete(taskId)
          resolve(result)
        },
        reject: (error) => {
          pending = false
          this.pendingExecutions.delete(taskId)
          reject(error)
        },
        cancelled: false,
      }

      // Try to execute immediately if a worker is available
      if (this.executor.availableCount > 0) {
        this.executeTask(queuedTask)
      } else {
        // Queue the task
        try {
          this.taskQueue.enqueue(queuedTask)
        } catch (error) {
          if (error instanceof Error && error.message.includes("Queue is full")) {
            reject(new QueueFullError(this.taskQueue.length))
            pending = false
            return
          }
          throw error
        }
      }
    })

    return {
      promise,
      cancel: () => {
        if (cancelled || !pending) {
          return
        }
        cancelled = true

        // If in queue, mark as cancelled
        if (this.taskQueue.cancel(taskId)) {
          return
        }

        // If executing, we can't really cancel it mid-execution
        // The worker will complete but we'll ignore the result
        // (The interrupt handler in the worker will pick up the cancellation)
      },
      get pending() {
        return pending && !cancelled
      },
      taskId,
    }
  }

  private async executeTask(queuedTask: QueuedTask): Promise<void> {
    const { task, resolve, cancelled } = queuedTask

    if (cancelled) {
      this.logger.log(`Task ${task.taskId} was cancelled before execution`)
      resolve({
        error: {
          name: "CancelledError",
          message: "Task was cancelled",
          isCancelled: true,
        },
      })
      return
    }

    const startTime = performance.now()
    this.pendingExecutions.set(task.taskId, { task: queuedTask, startTime: Date.now() })

    this.logger.log(
      `Executing ${task.taskId}: "${truncateCode(task.code)}"`,
      `[busy: ${this.executor.busyCount}/${this.executor.maxConcurrency}, queued: ${this.taskQueue.length}]`,
    )

    try {
      const result = await this.executor.execute(task)
      const executionTime = performance.now() - startTime

      if (result.error) {
        this.failedTasks++
        this.logger.warn(
          `Task ${task.taskId} failed in ${formatDuration(executionTime)}:`,
          result.error.message,
        )
      } else {
        this.completedTasks++
        this.logger.log(
          `Task ${task.taskId} completed in ${formatDuration(executionTime)}`,
          `Result: ${JSON.stringify(result.value).slice(0, 100)}`,
        )
      }
      this.totalExecutionTime += executionTime

      resolve(result)
    } catch (error) {
      this.failedTasks++
      this.logger.error(`Task ${task.taskId} threw exception:`, error)
      resolve({
        error: {
          name: "Error",
          message: error instanceof Error ? error.message : String(error),
        },
      })
    } finally {
      // Process next queued task
      this.processNextTask()
    }
  }

  private processNextTask(): void {
    if (!this._alive) {
      return
    }

    const nextTask = this.taskQueue.dequeue()
    if (nextTask) {
      this.executeTask(nextTask)
    }
  }

  /**
   * Get pool statistics.
   */
  getStats(): PoolStats {
    return {
      poolSize: this.executor.maxConcurrency,
      busyWorkers: this.executor.busyCount,
      availableWorkers: this.executor.availableCount,
      queuedTasks: this.taskQueue.length,
      completedTasks: this.completedTasks,
      failedTasks: this.failedTasks,
      averageExecutionTimeMs:
        this.completedTasks + this.failedTasks > 0
          ? this.totalExecutionTime / (this.completedTasks + this.failedTasks)
          : 0,
      isMultiThreaded: this.executor.isMultiThreaded,
    }
  }

  /**
   * Dispose of the pool and all its workers.
   * Rejects any pending tasks and releases all sessions.
   */
  dispose(): void {
    if (!this._alive) {
      return
    }

    this._alive = false

    // Release all active sessions
    for (const session of this.activeSessions.values()) {
      session.release()
    }
    this.activeSessions.clear()

    // Reject all queued tasks
    const queuedTasks = this.taskQueue.clear()
    for (const task of queuedTasks) {
      task.reject(new PoolDisposedError())
    }

    // Reject all pending executions
    for (const [, { task }] of this.pendingExecutions) {
      task.reject(new PoolDisposedError())
    }
    this.pendingExecutions.clear()

    // Dispose executor
    this.executor.dispose()
  }

  [Symbol.dispose](): void {
    this.dispose()
  }
}

// Singleton instance
let poolSingleton: QuickJSWorkerPool | undefined
let poolSingletonPromise: Promise<QuickJSWorkerPool> | undefined

/**
 * Create a new worker pool.
 *
 * @param options Configuration options for the pool
 * @returns A new QuickJSWorkerPool instance
 */
export async function newWorkerPool(options?: WorkerPoolOptions): Promise<QuickJSWorkerPool> {
  return QuickJSWorkerPool.create(options)
}

/**
 * Get a shared singleton worker pool.
 *
 * This is convenient for simple use cases. For more control,
 * use {@link newWorkerPool} to create isolated pool instances.
 *
 * @returns The singleton QuickJSWorkerPool instance
 */
export async function getWorkerPool(): Promise<QuickJSWorkerPool> {
  poolSingletonPromise ??= newWorkerPool().then((pool) => {
    poolSingleton = pool
    return pool
  })
  return poolSingletonPromise
}

/**
 * Provides synchronous access to the singleton pool, if it has been initialized.
 *
 * @throws Error if the singleton has not been initialized via {@link getWorkerPool}
 */
export function getWorkerPoolSync(): QuickJSWorkerPool {
  if (!poolSingleton) {
    throw new Error("Worker pool not initialized. Await getWorkerPool() at least once.")
  }
  return poolSingleton
}
