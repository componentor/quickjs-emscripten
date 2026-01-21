/**
 * Detect if multi-threading via Web Workers with SharedArrayBuffer is supported.
 *
 * In browsers, this requires:
 * - SharedArrayBuffer to be available
 * - The page to be cross-origin isolated (COOP/COEP headers set)
 *
 * In Node.js, worker_threads is always available.
 *
 * @returns true if multi-threading is supported, false otherwise
 */
export function isMultiThreadingSupported(): boolean {
  // Node.js environment - worker_threads is always available
  if (typeof process !== "undefined" && process.versions != null && process.versions.node != null) {
    return true
  }

  // Browser environment - check for SharedArrayBuffer and cross-origin isolation
  if (typeof globalThis !== "undefined") {
    // SharedArrayBuffer must exist
    if (typeof SharedArrayBuffer === "undefined") {
      return false
    }

    // Check for cross-origin isolation (required for SharedArrayBuffer in modern browsers)
    // crossOriginIsolated is true when COOP and COEP headers are properly set
    if (typeof crossOriginIsolated !== "undefined") {
      return crossOriginIsolated === true
    }

    // Fallback: if crossOriginIsolated doesn't exist but SharedArrayBuffer does,
    // we're likely in an older browser or special context where it might work
    return true
  }

  // Unknown environment
  return false
}

/**
 * Get the default pool size based on the environment.
 *
 * @returns The number of logical CPU cores, or 4 as a fallback
 */
export function getDefaultPoolSize(): number {
  // Browser environment
  if (typeof navigator !== "undefined" && typeof navigator.hardwareConcurrency === "number") {
    return navigator.hardwareConcurrency
  }

  // Node.js environment
  if (typeof process !== "undefined" && process.versions?.node != null) {
    try {
      // Dynamic import to avoid bundling issues
      const os = require("os")
      return os.cpus().length
    } catch {
      // Fallback if os module is not available
    }
  }

  // Default fallback
  return 4
}

/**
 * Detect the current platform.
 *
 * @returns 'node' for Node.js, 'browser' for browser environments
 */
export function detectPlatform(): "node" | "browser" {
  if (typeof process !== "undefined" && process.versions != null && process.versions.node != null) {
    return "node"
  }
  return "browser"
}
