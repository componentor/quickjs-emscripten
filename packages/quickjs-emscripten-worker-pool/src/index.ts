// Main exports
export { QuickJSWorkerPool, newWorkerPool, getWorkerPool, getWorkerPoolSync } from "./pool"

// Context wrapper - provides QuickJSAsyncContext-like API
export {
  WorkerPoolContext,
  newWorkerPoolContext,
  type WorkerPoolContextResult,
  type WorkerPoolEvalOptions,
} from "./context-wrapper"

// Worker-enabled context - hybrid local context + worker pool
export {
  WorkerEnabledContext,
  newWorkerEnabledContext,
  type WorkerEnabledContextOptions,
  type WorkerEnabledContextResult,
} from "./worker-enabled-context"

// Capability detection
export { isMultiThreadingSupported, getDefaultPoolSize, detectPlatform } from "./capabilities"

// Types
export type {
  WorkerPoolOptions,
  WorkerPoolVariant,
  WorkerTask,
  WorkerTaskResult,
  WorkerTaskError,
  TaskHandle,
  PoolStats,
  WorkerSession,
  SessionEvalOptions,
} from "./types"

// Errors
export {
  WorkerTaskTimeoutError,
  WorkerTaskCancelledError,
  WorkerCrashError,
  PoolDisposedError,
  QueueFullError,
  MultiThreadingNotSupportedError,
} from "./errors"
