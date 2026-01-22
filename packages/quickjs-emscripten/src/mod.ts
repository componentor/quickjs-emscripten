import type {
  AsyncRuntimeOptions,
  ContextOptions,
  QuickJSAsyncContext,
  QuickJSAsyncRuntime,
  QuickJSWASMModule,
} from "@componentor/quickjs-emscripten-core"
import {
  newWorkerEnabledContext as createWorkerEnabledContext,
  isMultiThreadingSupported,
  type WorkerEnabledContext,
  type WorkerEnabledContextOptions,
} from "@componentor/quickjs-emscripten-worker-pool"
import { newQuickJSAsyncWASMModule, newQuickJSWASMModule } from "#variants"

let singleton: QuickJSWASMModule | undefined = undefined
let singletonPromise: Promise<QuickJSWASMModule> | undefined = undefined

// ============================================
// Global Worker Pool Configuration
// ============================================

/**
 * Global configuration for worker pool contexts.
 * These settings are used as defaults when calling {@link newWorkerAsyncContext}.
 */
export interface WorkerPoolConfig {
  /**
   * Whether worker pool is enabled.
   * @default true
   */
  enabled?: boolean

  /**
   * Number of workers in the pool.
   * @default navigator.hardwareConcurrency or 4
   */
  poolSize?: number

  /**
   * Bootstrap code that runs on each worker during initialization.
   * Use this to set up shared state like mocks, utilities, etc.
   *
   * @example
   * ```typescript
   * configureWorkerPool({
   *   bootstrapCode: `
   *     globalThis.mockFetch = (url) => ({ status: 200, url })
   *   `
   * })
   * ```
   */
  bootstrapCode?: string

  /**
   * Whether to use a session for state persistence.
   * - false (default): Parallel execution, each eval may hit different worker
   * - true: Sequential execution, all evals go to same worker (state persists)
   * @default false
   */
  useSession?: boolean

  /**
   * Enable verbose logging for debugging.
   * @default false
   */
  verbose?: boolean

  /**
   * Default timeout for code execution in milliseconds.
   * @default 0 (no timeout)
   */
  defaultTimeout?: number
}

// Global worker pool configuration
let globalWorkerConfig: WorkerPoolConfig = {
  enabled: true, // Auto-use workers by default
}

/**
 * Configure the global worker pool settings.
 *
 * Call this before creating worker contexts to set up default worker pool options.
 * These settings are used as defaults when calling {@link newWorkerAsyncContext}.
 *
 * @example
 * ```typescript
 * import { configureWorkerPool, newWorkerAsyncContext } from "@componentor/quickjs-emscripten"
 *
 * // Configure once at startup
 * configureWorkerPool({
 *   poolSize: 4,
 *   bootstrapCode: `
 *     globalThis.mockFetch = (url) => ({ status: 200, url })
 *   `
 * })
 *
 * // Create worker context - uses global config!
 * const ctx = await newWorkerAsyncContext()
 *
 * // Parallel execution across workers
 * const results = await Promise.all([
 *   ctx.evalCodeAsync('mockFetch("/api/1")'),
 *   ctx.evalCodeAsync('mockFetch("/api/2")'),
 *   ctx.evalCodeAsync('mockFetch("/api/3")'),
 * ])
 * ```
 */
export function configureWorkerPool(config: WorkerPoolConfig): void {
  globalWorkerConfig = { ...globalWorkerConfig, ...config }
}

/**
 * Get the current global worker pool configuration.
 */
export function getWorkerPoolConfig(): WorkerPoolConfig {
  return { ...globalWorkerConfig }
}

/**
 * Reset the global worker pool configuration to defaults.
 */
export function resetWorkerPoolConfig(): void {
  globalWorkerConfig = { enabled: true }
}

// ============================================
// Core QuickJS Functions
// ============================================

/**
 * Get a shared singleton {@link QuickJSWASMModule}. Use this to evaluate code
 * or create Javascript environments.
 *
 * This is the top-level entrypoint for the quickjs-emscripten library.
 *
 * If you need strictest possible isolation guarantees, you may create a
 * separate {@link QuickJSWASMModule} via {@link newQuickJSWASMModule}.
 *
 * To work with the asyncified version of this library, see these functions:
 *
 * - {@link newAsyncRuntime}.
 * - {@link newAsyncContext}.
 * - {@link newQuickJSAsyncWASMModule}.
 */
export async function getQuickJS(): Promise<QuickJSWASMModule> {
  singletonPromise ??= newQuickJSWASMModule().then((instance) => {
    singleton = instance
    return instance
  })
  return await singletonPromise
}

/**
 * Provides synchronous access to the shared {@link QuickJSWASMModule} instance returned by {@link getQuickJS}, as long as
 * least once.
 * @throws If called before `getQuickJS` resolves.
 */
export function getQuickJSSync(): QuickJSWASMModule {
  if (!singleton) {
    throw new Error("QuickJS not initialized. Await getQuickJS() at least once.")
  }
  return singleton
}

/**
 * Create a new {@link QuickJSAsyncRuntime} in a separate WebAssembly module.
 *
 * Each runtime is isolated in a separate WebAssembly module, so that errors in
 * one runtime cannot contaminate another runtime, and each runtime can execute
 * an asynchronous action without conflicts.
 *
 * Note that there is a hard limit on the number of WebAssembly modules in older
 * versions of v8:
 * https://bugs.chromium.org/p/v8/issues/detail?id=12076
 */
export async function newAsyncRuntime(options?: AsyncRuntimeOptions): Promise<QuickJSAsyncRuntime> {
  const module = await newQuickJSAsyncWASMModule()
  return module.newRuntime(options)
}

/**
 * Create a new {@link QuickJSAsyncContext} in a separate WebAssembly module.
 *
 * Each context is isolated in a separate WebAssembly module, so that errors in
 * one runtime cannot contaminate another runtime, and each runtime can execute
 * an asynchronous action without conflicts.
 *
 * Note that there is a hard limit on the number of WebAssembly modules in older
 * versions of v8:
 * https://bugs.chromium.org/p/v8/issues/detail?id=12076
 *
 * For parallel execution across workers, use {@link newWorkerAsyncContext} instead.
 */
export async function newAsyncContext(options?: ContextOptions): Promise<QuickJSAsyncContext> {
  const module = await newQuickJSAsyncWASMModule()
  return module.newContext(options)
}

// ============================================
// Worker Pool Helpers
// ============================================

/**
 * Options for creating a worker-enabled async context.
 */
export interface WorkerAsyncContextOptions extends WorkerEnabledContextOptions {
  /**
   * Context options for the local QuickJS context.
   */
  contextOptions?: ContextOptions
}

/**
 * Create a new {@link WorkerEnabledContext} for parallel execution across workers.
 *
 * This is the recommended way to use QuickJS with parallel execution. Each
 * `evalCodeAsync` call can be distributed to different workers for parallelism.
 *
 * Uses global config from {@link configureWorkerPool} as defaults, which can
 * be overridden by passing options.
 *
 * @example
 * ```typescript
 * // Simple usage with defaults
 * const ctx = await newWorkerAsyncContext()
 *
 * // Parallel execution
 * const results = await Promise.all([
 *   ctx.evalCodeAsync('1 + 1'),
 *   ctx.evalCodeAsync('2 + 2'),
 *   ctx.evalCodeAsync('3 + 3'),
 * ])
 * ```
 *
 * @example
 * ```typescript
 * // With bootstrap code for mocks
 * const ctx = await newWorkerAsyncContext({
 *   poolSize: 8,
 *   bootstrapCode: `
 *     globalThis.mockFetch = (url) => ({ status: 200, url })
 *   `,
 * })
 * ```
 *
 * @param options Worker pool and context options (overrides global config)
 * @returns A new WorkerEnabledContext instance
 */
export async function newWorkerAsyncContext(
  options?: WorkerAsyncContextOptions,
): Promise<WorkerEnabledContext> {
  // Merge global config with provided options
  const mergedOptions: WorkerAsyncContextOptions = {
    poolSize: options?.poolSize ?? globalWorkerConfig.poolSize,
    bootstrapCode: options?.bootstrapCode ?? globalWorkerConfig.bootstrapCode,
    useSession: options?.useSession ?? globalWorkerConfig.useSession,
    verbose: options?.verbose ?? globalWorkerConfig.verbose,
    defaultTimeout: options?.defaultTimeout ?? globalWorkerConfig.defaultTimeout,
    ...options,
  }
  return createWorkerEnabledContext(mergedOptions)
}

/**
 * Check if multi-threading is supported in the current environment.
 *
 * Returns true if SharedArrayBuffer is available (required for Web Workers
 * to share memory). In browsers, this requires COOP/COEP headers to be set.
 * In Node.js, this is typically always available.
 *
 * @example
 * ```typescript
 * if (canUseWorkers()) {
 *   console.log('Parallel execution available!')
 * } else {
 *   console.log('Falling back to single-threaded execution')
 * }
 * ```
 */
export function canUseWorkers(): boolean {
  return isMultiThreadingSupported()
}
