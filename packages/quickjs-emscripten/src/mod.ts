import type {
  AsyncRuntimeOptions,
  ContextOptions,
  QuickJSAsyncContext,
  QuickJSAsyncRuntime,
  QuickJSWASMModule,
} from "@componentor/quickjs-emscripten-core"
import { newQuickJSAsyncWASMModule, newQuickJSWASMModule } from "#variants"
import {
  newWorkerEnabledContext as createWorkerEnabledContext,
  isMultiThreadingSupported,
  type WorkerEnabledContext,
  type WorkerEnabledContextOptions,
} from "@componentor/quickjs-emscripten-worker-pool"

let singleton: QuickJSWASMModule | undefined = undefined
let singletonPromise: Promise<QuickJSWASMModule> | undefined = undefined

// ============================================
// Global Worker Pool Configuration
// ============================================

/**
 * Global configuration for automatic worker pool usage.
 */
export interface WorkerPoolConfig {
  /**
   * Whether to automatically use worker pool for async contexts.
   * When true, `newAsyncContext()` will return a `WorkerEnabledContext`
   * that automatically uses workers for parallel execution.
   * @default true (when workers are available)
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
 * Call this before creating any contexts to set up automatic worker pool usage.
 * When enabled (default), `newAsyncContext()` will automatically use workers
 * for parallel execution.
 *
 * @example
 * ```typescript
 * import { configureWorkerPool, newAsyncContext } from "@componentor/quickjs-emscripten"
 *
 * // Configure once at startup
 * configureWorkerPool({
 *   poolSize: 4,
 *   bootstrapCode: `
 *     globalThis.mockFetch = (url) => ({ status: 200, url })
 *   `
 * })
 *
 * // Now all async contexts automatically use workers!
 * const ctx = await newAsyncContext()
 *
 * // Parallel execution across workers
 * const results = await Promise.all([
 *   ctx.evalCodeAsync('mockFetch("/api/1")'),
 *   ctx.evalCodeAsync('mockFetch("/api/2")'),
 *   ctx.evalCodeAsync('mockFetch("/api/3")'),
 * ])
 * ```
 *
 * @example
 * ```typescript
 * // Disable automatic worker usage
 * configureWorkerPool({ enabled: false })
 *
 * // Now newAsyncContext() returns a regular QuickJSAsyncContext
 * const ctx = await newAsyncContext()
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
 * Context type that can be either a worker-enabled context or a regular async context.
 * Both provide the same essential API (evalCodeAsync, handle operations, etc.)
 */
export type AsyncContext = WorkerEnabledContext | QuickJSAsyncContext

/**
 * Create a new async context for JavaScript execution.
 *
 * **Automatic Worker Pool Integration:**
 * By default, when workers are available (SharedArrayBuffer supported), this returns
 * a {@link WorkerEnabledContext} that automatically distributes `evalCodeAsync` calls
 * across multiple workers for parallel execution.
 *
 * Configure the worker pool behavior using {@link configureWorkerPool}:
 *
 * @example
 * ```typescript
 * import { configureWorkerPool, newAsyncContext } from "@componentor/quickjs-emscripten"
 *
 * // Configure worker pool with bootstrap code (call once at startup)
 * configureWorkerPool({
 *   poolSize: 4,
 *   bootstrapCode: `
 *     globalThis.mockFetch = (url) => ({ status: 200, url })
 *   `
 * })
 *
 * // Create context - automatically uses workers!
 * const ctx = await newAsyncContext()
 *
 * // Parallel execution across workers
 * const results = await Promise.all([
 *   ctx.evalCodeAsync('mockFetch("/api/1")'),  // Worker 1
 *   ctx.evalCodeAsync('mockFetch("/api/2")'),  // Worker 2
 *   ctx.evalCodeAsync('mockFetch("/api/3")'),  // Worker 3
 * ])
 * ```
 *
 * @example
 * ```typescript
 * // Disable workers for this context
 * const ctx = await newAsyncContext({ useWorkers: false })
 * ```
 *
 * @param options Context options. Set `useWorkers: false` to disable worker pool.
 * @returns A context for JavaScript execution (worker-enabled when available)
 */
export async function newAsyncContext(
  options?: ContextOptions & { useWorkers?: boolean },
): Promise<AsyncContext> {
  const useWorkers = options?.useWorkers ?? globalWorkerConfig.enabled ?? true

  // Use worker-enabled context if workers are enabled and available
  if (useWorkers && isMultiThreadingSupported()) {
    return createWorkerEnabledContext({
      poolSize: globalWorkerConfig.poolSize,
      bootstrapCode: globalWorkerConfig.bootstrapCode,
      useSession: globalWorkerConfig.useSession,
      verbose: globalWorkerConfig.verbose,
      defaultTimeout: globalWorkerConfig.defaultTimeout,
      contextOptions: options,
    })
  }

  // Fall back to regular async context
  const module = await newQuickJSAsyncWASMModule()
  return module.newContext(options)
}

/**
 * Create a new async context WITHOUT worker pool integration.
 * Use this when you explicitly need a raw QuickJSAsyncContext.
 *
 * @param options Context options
 * @returns A QuickJSAsyncContext (not worker-enabled)
 */
export async function newRawAsyncContext(options?: ContextOptions): Promise<QuickJSAsyncContext> {
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
 * Create a new {@link WorkerEnabledContext} with explicit worker pool options.
 *
 * Use this when you need fine-grained control over the worker pool configuration
 * for a specific context, rather than using the global configuration.
 *
 * @example
 * ```typescript
 * const ctx = await newWorkerAsyncContext({
 *   poolSize: 8,
 *   bootstrapCode: `
 *     globalThis.customHelper = (x) => x * 2
 *   `,
 *   verbose: true,
 * })
 * ```
 *
 * @param options Worker pool and context options
 * @returns A new WorkerEnabledContext instance
 */
export async function newWorkerAsyncContext(
  options?: WorkerAsyncContextOptions,
): Promise<WorkerEnabledContext> {
  return createWorkerEnabledContext(options)
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
