// Main exports
export { QuickJSWorkerPool, newWorkerPool, getWorkerPool, getWorkerPoolSync } from "./pool"

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
