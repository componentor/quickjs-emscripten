// Main exports
export { QuickJSWorkerPool, newWorkerPool, getWorkerPool, getWorkerPoolSync } from "./pool"

// Capability detection
export { isMultiThreadingSupported, getDefaultPoolSize, detectPlatform } from "./capabilities"

// Types
export type {
  WorkerPoolOptions,
  WorkerTask,
  WorkerTaskResult,
  WorkerTaskError,
  TaskHandle,
  PoolStats,
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
