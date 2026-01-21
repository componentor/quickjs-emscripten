/**
 * Simple logger for verbose mode debugging.
 */

const PREFIX = "[WorkerPool]"

export type Logger = {
  log: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
}

/**
 * Creates a logger that outputs to console when verbose is true,
 * or does nothing when verbose is false.
 */
export function createLogger(verbose: boolean): Logger {
  if (verbose) {
    return {
      log: (...args: unknown[]) => console.log(PREFIX, ...args),
      warn: (...args: unknown[]) => console.warn(PREFIX, ...args),
      error: (...args: unknown[]) => console.error(PREFIX, ...args),
    }
  }

  // No-op logger
  return {
    log: () => {},
    warn: () => {},
    error: () => {},
  }
}

/**
 * Format milliseconds as a human-readable duration.
 */
export function formatDuration(ms: number): string {
  if (ms < 1) {
    return `${(ms * 1000).toFixed(2)}µs`
  }
  if (ms < 1000) {
    return `${ms.toFixed(2)}ms`
  }
  return `${(ms / 1000).toFixed(2)}s`
}

/**
 * Truncate code for logging (avoid flooding console).
 */
export function truncateCode(code: string, maxLength = 50): string {
  const oneLine = code.replace(/\n/g, " ").trim()
  if (oneLine.length <= maxLength) {
    return oneLine
  }
  return oneLine.slice(0, maxLength - 3) + "..."
}
