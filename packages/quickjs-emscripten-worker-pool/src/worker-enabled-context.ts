import {
  newQuickJSAsyncWASMModuleFromVariant,
  type QuickJSAsyncWASMModule,
  type QuickJSAsyncContext,
  type QuickJSAsyncVariant,
  type QuickJSHandle,
  type ContextEvalOptions,
  type Disposable,
  type VmCallResult,
} from "@componentor/quickjs-emscripten-core"
import type { QuickJSWorkerPool } from "./pool"
import { newWorkerPool } from "./pool"
import type { WorkerPoolOptions, WorkerTaskResult, WorkerSession } from "./types"
import { isMultiThreadingSupported } from "./capabilities"

/**
 * Options for creating a WorkerEnabledContext.
 */
export interface WorkerEnabledContextOptions extends WorkerPoolOptions {
  /**
   * If true, only use workers for evalCodeAsync (no local context).
   * Useful when you only need code evaluation without handle operations.
   * @default false
   */
  workerOnly?: boolean

  /**
   * Whether to use a session for sequential evalCodeAsync calls.
   * When true, all evalCodeAsync calls go to the same worker,
   * preserving state (variables, functions) across calls.
   * When false (default), each eval may go to a different worker (parallel execution).
   *
   * For shared state across parallel workers, use `bootstrapCode` instead.
   *
   * @default false
   */
  useSession?: boolean

  /**
   * Strategy for routing evalCodeAsync calls.
   * - "workers": Always route to workers (default when pool available)
   * - "local": Always use local context
   * - "auto": Use workers for standalone evals, local for code that needs handles
   * @default "workers"
   */
  evalStrategy?: "workers" | "local" | "auto"
}

/**
 * Result type that matches QuickJSContextResult for API compatibility.
 */
export type WorkerEnabledContextResult<T = unknown> =
  | { value: T; error?: undefined }
  | { error: QuickJSHandle; value?: undefined }

/**
 * A hybrid context that combines local QuickJSAsyncContext with worker pool execution.
 *
 * This allows you to use the familiar QuickJS API while automatically benefiting
 * from parallel worker execution.
 *
 * **How it works:**
 * - By default, uses parallel execution across workers (useSession: false)
 * - Use `bootstrapCode` to set up shared state (like mocks) on all workers
 * - Handle operations (newFunction, newObject, etc.) use the local context
 * - Falls back to local context when workers unavailable
 *
 * **Use cases:**
 * - Parallel execution of independent tasks across workers
 * - Shared initial state via `bootstrapCode` (e.g., HTTP client mocks)
 * - Use `useSession: true` if you need state to persist across calls
 *
 * @example
 * ```typescript
 * // Create with automatic worker pool and parallel execution (default)
 * const ctx = await newWorkerEnabledContext({
 *   poolSize: 4,
 *   // Bootstrap code runs on each worker - great for mocks!
 *   bootstrapCode: `
 *     globalThis.mockFetch = (url) => ({ status: 200, data: 'mocked' })
 *   `
 * })
 *
 * // Parallel execution - each call may hit a different worker
 * // But all workers have mockFetch available from bootstrap!
 * const results = await Promise.all([
 *   ctx.evalCodeAsync('mockFetch("/api/1")'),  // Worker 1
 *   ctx.evalCodeAsync('mockFetch("/api/2")'),  // Worker 2
 *   ctx.evalCodeAsync('mockFetch("/api/3")'),  // Worker 3
 * ])
 *
 * ctx.dispose()
 * ```
 */
export class WorkerEnabledContext implements Disposable {
  private _module: QuickJSAsyncWASMModule | null = null
  private _localContext: QuickJSAsyncContext | null = null
  private _pool: QuickJSWorkerPool | null = null
  private _session: WorkerSession | null = null
  private _alive = true
  private _useSession: boolean
  private _evalStrategy: "workers" | "local" | "auto"

  private constructor(
    module: QuickJSAsyncWASMModule | null,
    localContext: QuickJSAsyncContext | null,
    pool: QuickJSWorkerPool | null,
    session: WorkerSession | null,
    useSession: boolean,
    evalStrategy: "workers" | "local" | "auto",
  ) {
    this._module = module
    this._localContext = localContext
    this._pool = pool
    this._session = session
    this._useSession = useSession
    this._evalStrategy = evalStrategy
  }

  /**
   * Create a new WorkerEnabledContext.
   *
   * Automatically creates a worker pool when SharedArrayBuffer is available,
   * falling back to local-only execution otherwise.
   *
   * By default, uses parallel execution (useSession: false). Use `bootstrapCode`
   * to set up shared state across all workers.
   */
  static async create(options: WorkerEnabledContextOptions = {}): Promise<WorkerEnabledContext> {
    const workerOnly = options.workerOnly ?? false
    const useSession = options.useSession ?? false
    const evalStrategy = options.evalStrategy ?? "workers"

    let module: QuickJSAsyncWASMModule | null = null
    let localContext: QuickJSAsyncContext | null = null
    let pool: QuickJSWorkerPool | null = null
    let session: WorkerSession | null = null

    // Create worker pool if multi-threading is supported
    if (isMultiThreadingSupported() && !options.forceSingleThreaded) {
      pool = await newWorkerPool(options)

      // Create a session if useSession is true (default)
      // This pins all evalCodeAsync calls to the same worker for state persistence
      if (useSession && pool.isMultiThreaded) {
        session = await pool.createSession()
      }
    }

    // Create local context unless worker-only mode
    if (!workerOnly) {
      const variantModule = await import("@componentor/quickjs-singlefile-cjs-release-asyncify")
      const variant = (variantModule.default ?? variantModule) as unknown as QuickJSAsyncVariant
      module = await newQuickJSAsyncWASMModuleFromVariant(variant)
      localContext = module.newContext(options.contextOptions)

      // Run bootstrap code if provided (for local context)
      if (options.bootstrapCode && localContext) {
        const result = await localContext.evalCodeAsync(options.bootstrapCode, "<bootstrap>")
        if (result.error) {
          const errorValue = localContext.dump(result.error)
          result.error.dispose()
          throw new Error(`Bootstrap code failed: ${String(errorValue)}`)
        }
        result.value.dispose()
      }
    }

    // If no pool and worker-only mode, throw error
    if (!pool && workerOnly) {
      throw new Error(
        "Worker-only mode requires SharedArrayBuffer. " +
          "Set COOP/COEP headers or use workerOnly: false",
      )
    }

    return new WorkerEnabledContext(module, localContext, pool, session, useSession, evalStrategy)
  }

  /**
   * Whether the context is still alive.
   */
  get alive(): boolean {
    return this._alive
  }

  /**
   * Whether workers are available for parallel execution.
   */
  get hasWorkerPool(): boolean {
    return this._pool !== null && this._pool.alive
  }

  /**
   * Whether the worker pool is using real multi-threading.
   */
  get isMultiThreaded(): boolean {
    return this._pool?.isMultiThreaded ?? false
  }

  /**
   * The underlying local context (null if worker-only mode).
   * Use this for advanced handle operations.
   */
  get localContext(): QuickJSAsyncContext | null {
    return this._localContext
  }

  /**
   * The underlying worker pool (null if not available).
   */
  get pool(): QuickJSWorkerPool | null {
    return this._pool
  }

  /**
   * The underlying worker session (null if not using sessions or unavailable).
   */
  get session(): WorkerSession | null {
    return this._session
  }

  /**
   * Whether this context uses a session for persistent state.
   */
  get usesSession(): boolean {
    return this._useSession && this._session !== null
  }

  /**
   * The global object of the local context.
   * @throws Error if in worker-only mode
   */
  get global(): QuickJSHandle {
    if (!this._localContext) {
      throw new Error("No local context available (worker-only mode)")
    }
    return this._localContext.global
  }

  /**
   * The runtime of the local context.
   * @throws Error if in worker-only mode
   */
  get runtime() {
    if (!this._localContext) {
      throw new Error("No local context available (worker-only mode)")
    }
    return this._localContext.runtime
  }

  // ============================================
  // Code Evaluation - Routes to workers
  // ============================================

  /**
   * Evaluate JavaScript code asynchronously.
   *
   * By default (useSession: false), this routes to any available worker for parallel execution.
   * Use `bootstrapCode` to set up shared state across all workers.
   *
   * When useSession is true, all calls go to the same worker (state persists).
   *
   * Falls back to the local context when workers are unavailable.
   *
   * @param code JavaScript code to evaluate
   * @param filename Optional filename for error messages
   * @param options Optional evaluation options
   */
  async evalCodeAsync(
    code: string,
    filename?: string,
    options?: number | ContextEvalOptions,
  ): Promise<VmCallResult<QuickJSHandle>> {
    if (!this._alive) {
      throw new Error("Context has been disposed")
    }

    const timeout = typeof options === "number" ? options : undefined

    // If we have a session, use it (state persists across calls)
    if (this._session && this._session.alive) {
      const result = await this._session.evalCode(code, { filename, timeout })
      return this.workerResultToVmResult(result)
    }

    // Determine whether to use workers (non-session mode)
    const useWorkers =
      this._pool &&
      this._pool.alive &&
      (this._evalStrategy === "workers" || this._evalStrategy === "auto")

    if (useWorkers && this._pool) {
      // Route to worker pool (isolated - each eval may hit different worker)
      const result = await this._pool.evalCode(code, { filename, timeout })
      return this.workerResultToVmResult(result)
    }

    // Fall back to local context
    if (!this._localContext) {
      throw new Error("No local context available and workers unavailable")
    }

    return this._localContext.evalCodeAsync(code, filename, options)
  }

  /**
   * Evaluate code on workers and return the raw worker result.
   * Use this when you don't need QuickJS handles.
   */
  async evalCodeOnWorkers(
    code: string,
    options?: { filename?: string; timeout?: number },
  ): Promise<WorkerTaskResult> {
    if (!this._pool || !this._pool.alive) {
      // Fall back to local execution
      if (!this._localContext) {
        return { error: { name: "Error", message: "No execution context available" } }
      }

      const result = await this._localContext.evalCodeAsync(code, options?.filename ?? "eval.js")

      if (result.error) {
        const errorValue = this._localContext.dump(result.error)
        result.error.dispose()
        return {
          error: {
            name: "Error",
            message: String(errorValue),
          },
        }
      }

      const value = this._localContext.dump(result.value)
      result.value.dispose()
      return { value }
    }

    return this._pool.evalCode(code, options)
  }

  /**
   * Evaluate multiple code snippets in parallel across workers.
   */
  async evalCodeBatch(
    tasks: (string | { code: string; filename?: string; timeout?: number })[],
  ): Promise<WorkerTaskResult[]> {
    if (!this._pool || !this._pool.alive) {
      // Fall back to sequential local execution
      const results: WorkerTaskResult[] = []
      for (const task of tasks) {
        const code = typeof task === "string" ? task : task.code
        const filename = typeof task === "string" ? undefined : task.filename
        results.push(await this.evalCodeOnWorkers(code, { filename }))
      }
      return results
    }

    const normalizedTasks = tasks.map((t) => (typeof t === "string" ? { code: t } : t))
    return this._pool.evalCodeBatch(normalizedTasks)
  }

  // ============================================
  // Handle Operations - Use local context
  // ============================================

  /**
   * Create a new QuickJS function.
   * @throws Error if in worker-only mode
   */
  newFunction(
    name: string,
    fn: (this: QuickJSHandle, ...args: QuickJSHandle[]) => QuickJSHandle | undefined,
  ): QuickJSHandle {
    if (!this._localContext) {
      throw new Error("newFunction requires local context (not available in worker-only mode)")
    }
    return this._localContext.newFunction(name, fn)
  }

  /**
   * Create a new QuickJS object.
   * @throws Error if in worker-only mode
   */
  newObject(prototype?: QuickJSHandle): QuickJSHandle {
    if (!this._localContext) {
      throw new Error("newObject requires local context (not available in worker-only mode)")
    }
    return this._localContext.newObject(prototype)
  }

  /**
   * Create a new QuickJS array.
   * @throws Error if in worker-only mode
   */
  newArray(): QuickJSHandle {
    if (!this._localContext) {
      throw new Error("newArray requires local context (not available in worker-only mode)")
    }
    return this._localContext.newArray()
  }

  /**
   * Create a new QuickJS string.
   * @throws Error if in worker-only mode
   */
  newString(str: string): QuickJSHandle {
    if (!this._localContext) {
      throw new Error("newString requires local context (not available in worker-only mode)")
    }
    return this._localContext.newString(str)
  }

  /**
   * Create a new QuickJS number.
   * @throws Error if in worker-only mode
   */
  newNumber(num: number): QuickJSHandle {
    if (!this._localContext) {
      throw new Error("newNumber requires local context (not available in worker-only mode)")
    }
    return this._localContext.newNumber(num)
  }

  /**
   * Create a new QuickJS BigInt.
   * @throws Error if in worker-only mode
   */
  newBigInt(num: bigint): QuickJSHandle {
    if (!this._localContext) {
      throw new Error("newBigInt requires local context (not available in worker-only mode)")
    }
    return this._localContext.newBigInt(num)
  }

  /**
   * Get the undefined value.
   * @throws Error if in worker-only mode
   */
  get undefined(): QuickJSHandle {
    if (!this._localContext) {
      throw new Error("undefined requires local context (not available in worker-only mode)")
    }
    return this._localContext.undefined
  }

  /**
   * Get the null value.
   * @throws Error if in worker-only mode
   */
  get null(): QuickJSHandle {
    if (!this._localContext) {
      throw new Error("null requires local context (not available in worker-only mode)")
    }
    return this._localContext.null
  }

  /**
   * Get the true value.
   * @throws Error if in worker-only mode
   */
  get true(): QuickJSHandle {
    if (!this._localContext) {
      throw new Error("true requires local context (not available in worker-only mode)")
    }
    return this._localContext.true
  }

  /**
   * Get the false value.
   * @throws Error if in worker-only mode
   */
  get false(): QuickJSHandle {
    if (!this._localContext) {
      throw new Error("false requires local context (not available in worker-only mode)")
    }
    return this._localContext.false
  }

  /**
   * Get a string from a handle.
   * @throws Error if in worker-only mode
   */
  getString(handle: QuickJSHandle): string {
    if (!this._localContext) {
      throw new Error("getString requires local context (not available in worker-only mode)")
    }
    return this._localContext.getString(handle)
  }

  /**
   * Get a number from a handle.
   * @throws Error if in worker-only mode
   */
  getNumber(handle: QuickJSHandle): number {
    if (!this._localContext) {
      throw new Error("getNumber requires local context (not available in worker-only mode)")
    }
    return this._localContext.getNumber(handle)
  }

  /**
   * Get a BigInt from a handle.
   * @throws Error if in worker-only mode
   */
  getBigInt(handle: QuickJSHandle): bigint {
    if (!this._localContext) {
      throw new Error("getBigInt requires local context (not available in worker-only mode)")
    }
    return this._localContext.getBigInt(handle)
  }

  /**
   * Get a property from an object.
   * @throws Error if in worker-only mode
   */
  getProp(handle: QuickJSHandle, key: QuickJSHandle | string): QuickJSHandle {
    if (!this._localContext) {
      throw new Error("getProp requires local context (not available in worker-only mode)")
    }
    return this._localContext.getProp(handle, key)
  }

  /**
   * Set a property on an object.
   * @throws Error if in worker-only mode
   */
  setProp(handle: QuickJSHandle, key: QuickJSHandle | string, value: QuickJSHandle): void {
    if (!this._localContext) {
      throw new Error("setProp requires local context (not available in worker-only mode)")
    }
    this._localContext.setProp(handle, key, value)
  }

  /**
   * Call a function.
   * @throws Error if in worker-only mode
   */
  callFunction(
    func: QuickJSHandle,
    thisVal: QuickJSHandle,
    ...args: QuickJSHandle[]
  ): VmCallResult<QuickJSHandle> {
    if (!this._localContext) {
      throw new Error("callFunction requires local context (not available in worker-only mode)")
    }
    return this._localContext.callFunction(func, thisVal, ...args)
  }

  /**
   * Dump a handle to a JavaScript value.
   * @throws Error if in worker-only mode
   */
  dump(handle: QuickJSHandle): unknown {
    if (!this._localContext) {
      throw new Error("dump requires local context (not available in worker-only mode)")
    }
    return this._localContext.dump(handle)
  }

  /**
   * Get the type of a handle.
   * @throws Error if in worker-only mode
   */
  typeof(handle: QuickJSHandle): string {
    if (!this._localContext) {
      throw new Error("typeof requires local context (not available in worker-only mode)")
    }
    return this._localContext.typeof(handle)
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Convert a worker result to VmCallResult format.
   * Creates handles in the local context for the values.
   */
  private workerResultToVmResult(result: WorkerTaskResult): VmCallResult<QuickJSHandle> {
    if (!this._localContext) {
      throw new Error("Cannot convert worker result without local context")
    }

    if (result.error) {
      // Create an error handle in the local context
      const errorHandle = this._localContext.newError(result.error.message)
      return { error: errorHandle }
    }

    // Create a handle for the result value
    const handle = this.valueToHandle(result.value)
    return { value: handle }
  }

  /**
   * Convert a JavaScript value to a QuickJS handle.
   */
  private valueToHandle(value: unknown): QuickJSHandle {
    if (!this._localContext) {
      throw new Error("Cannot create handle without local context")
    }

    if (value === undefined) {
      return this._localContext.undefined
    }
    if (value === null) {
      return this._localContext.null
    }
    if (typeof value === "boolean") {
      return value ? this._localContext.true : this._localContext.false
    }
    if (typeof value === "number") {
      return this._localContext.newNumber(value)
    }
    if (typeof value === "string") {
      return this._localContext.newString(value)
    }
    if (typeof value === "bigint") {
      return this._localContext.newBigInt(value)
    }
    if (Array.isArray(value)) {
      const arr = this._localContext.newArray()
      for (let i = 0; i < value.length; i++) {
        const itemHandle = this.valueToHandle(value[i])
        this._localContext.setProp(arr, i, itemHandle)
        itemHandle.dispose()
      }
      return arr
    }
    if (typeof value === "object") {
      const obj = this._localContext.newObject()
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        const valHandle = this.valueToHandle(val)
        this._localContext.setProp(obj, key, valHandle)
        valHandle.dispose()
      }
      return obj
    }

    // Fallback: convert to string
    return this._localContext.newString(String(value))
  }

  /**
   * Dispose of the context and all resources.
   */
  dispose(): void {
    if (!this._alive) {
      return
    }
    this._alive = false

    // Release session first (returns worker to pool)
    if (this._session) {
      this._session.release()
      this._session = null
    }

    if (this._localContext) {
      this._localContext.dispose()
      this._localContext = null
    }

    if (this._pool) {
      this._pool.dispose()
      this._pool = null
    }

    this._module = null
  }

  [Symbol.dispose](): void {
    this.dispose()
  }
}

/**
 * Create a new WorkerEnabledContext.
 *
 * This is the recommended way to use QuickJS with parallel worker execution.
 *
 * By default (useSession: false), evalCodeAsync calls are distributed across workers
 * for parallel execution. Use `bootstrapCode` to set up shared state (like mocks)
 * that runs on each worker.
 *
 * @example
 * ```typescript
 * // Parallel execution with shared mocks via bootstrapCode
 * const ctx = await newWorkerEnabledContext({
 *   poolSize: 4,
 *   bootstrapCode: `
 *     globalThis.mockFetch = (url) => ({ status: 200, url })
 *   `
 * })
 *
 * // Parallel execution - each call may hit a different worker
 * // All workers have mockFetch from bootstrap!
 * const results = await Promise.all([
 *   ctx.evalCodeAsync('mockFetch("/api/1")'),
 *   ctx.evalCodeAsync('mockFetch("/api/2")'),
 *   ctx.evalCodeAsync('mockFetch("/api/3")'),
 * ])
 *
 * ctx.dispose()
 * ```
 *
 * @example
 * ```typescript
 * // Use session for state persistence (sequential execution)
 * const ctx = await newWorkerEnabledContext({
 *   poolSize: 4,
 *   useSession: true,  // All calls go to same worker
 * })
 *
 * await ctx.evalCodeAsync('let x = 10')
 * await ctx.evalCodeAsync('x += 5')
 * const result = await ctx.evalCodeAsync('x')  // returns 15
 * ```
 */
export async function newWorkerEnabledContext(
  options?: WorkerEnabledContextOptions,
): Promise<WorkerEnabledContext> {
  return WorkerEnabledContext.create(options)
}
