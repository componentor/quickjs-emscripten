export * from "@componentor/quickjs-emscripten-core"
export * from "#variants"
export * from "./mod.js"

// Worker pool exports - for parallel execution across workers
export {
  // Main pool classes and factories
  QuickJSWorkerPool,
  newWorkerPool,
  getWorkerPool,
  getWorkerPoolSync,
  // Context wrappers
  WorkerPoolContext,
  newWorkerPoolContext,
  WorkerEnabledContext,
  newWorkerEnabledContext,
  // Capability detection
  isMultiThreadingSupported,
  getDefaultPoolSize,
  detectPlatform,
  // Errors
  WorkerTaskTimeoutError,
  WorkerTaskCancelledError,
  WorkerCrashError,
  PoolDisposedError,
  QueueFullError,
  MultiThreadingNotSupportedError,
  // Types
  type WorkerPoolOptions,
  type WorkerPoolVariant,
  type WorkerTask,
  type WorkerTaskResult,
  type WorkerTaskError,
  type TaskHandle,
  type PoolStats,
  type WorkerSession,
  type SessionEvalOptions,
  type WorkerPoolContextResult,
  type WorkerPoolEvalOptions,
  type WorkerEnabledContextOptions,
  type WorkerEnabledContextResult,
} from "@componentor/quickjs-emscripten-worker-pool"
