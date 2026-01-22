/**
 * Worker entry point.
 * This file runs inside a Web Worker or Node.js worker_threads.
 *
 * Supports two modes:
 * - Asyncify variants (singlefile): Full top-level await (TLA) support
 * - WasmFS sync variant: Shared OPFS filesystem with pthreads for async I/O
 */

import {
  newQuickJSAsyncWASMModuleFromVariant,
  newQuickJSWASMModuleFromVariant,
  newVariant,
  type QuickJSAsyncWASMModule,
  type QuickJSAsyncContext,
  type QuickJSAsyncVariant,
  type QuickJSWASMModule,
  type QuickJSContext,
  type QuickJSSyncVariant,
  type QuickJSRuntime,
} from "@componentor/quickjs-emscripten-core"
import type {
  MainToWorkerMessage,
  WorkerToMainMessage,
  InitMessage,
  EvalMessage,
} from "../serialization"
import type { WorkerPoolVariant, WorkerTaskError } from "../types"

// Support both async and sync modules/contexts
let asyncModule: QuickJSAsyncWASMModule | null = null
let asyncContext: QuickJSAsyncContext | null = null
let syncModule: QuickJSWASMModule | null = null
let syncContext: QuickJSContext | null = null

let cancelledTaskId: string | null = null
let currentVariant: WorkerPoolVariant = "singlefile"
let isAsyncVariant = true // true for asyncify variants, false for sync (wasmfs)

/**
 * Get the current context (async or sync).
 */
function getContext(): QuickJSAsyncContext | QuickJSContext | null {
  return isAsyncVariant ? asyncContext : syncContext
}

/**
 * Get the current runtime.
 */
function getRuntime(): QuickJSRuntime | null {
  const ctx = getContext()
  return ctx?.runtime ?? null
}

/**
 * Post a message to the main thread.
 * Works in both browser Web Workers and Node.js worker_threads.
 */
function postToMain(message: WorkerToMainMessage): void {
  if (typeof self !== "undefined" && typeof self.postMessage === "function") {
    // Browser Web Worker
    self.postMessage(message)
  } else if (typeof require !== "undefined" && typeof process !== "undefined") {
    // Node.js worker_threads
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { parentPort } = require("worker_threads") as {
      parentPort?: { postMessage: (msg: unknown) => void }
    }
    parentPort?.postMessage(message)
  }
}

/**
 * Set up message listener.
 */
function setupMessageListener(): void {
  const handler = async (data: MainToWorkerMessage | { data: MainToWorkerMessage }) => {
    // Handle both browser (MessageEvent) and Node.js (raw data) formats
    const message =
      "data" in data && typeof data.data === "object" ? data.data : (data as MainToWorkerMessage)

    switch (message.type) {
      case "init":
        await handleInit(message)
        break
      case "eval":
        await handleEval(message)
        break
      case "cancel":
        handleCancel(message.taskId)
        break
      case "terminate":
        handleTerminate()
        break
    }
  }

  if (typeof self !== "undefined" && typeof self.addEventListener === "function") {
    // Browser Web Worker
    self.addEventListener("message", (event) => handler(event.data))
  } else if (typeof require !== "undefined" && typeof process !== "undefined") {
    // Node.js worker_threads
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { parentPort } = require("worker_threads") as {
      parentPort?: { on: (event: string, handler: unknown) => void }
    }
    parentPort?.on("message", handler)
  }
}

/**
 * Load the appropriate QuickJS variant based on configuration.
 */
async function loadAsyncVariant(wasmLocation?: string): Promise<QuickJSAsyncVariant> {
  // Load the asyncify variant for TLA support
  const variantModule = await import("@componentor/quickjs-singlefile-cjs-release-asyncify")
  const baseVariant = (variantModule.default ?? variantModule) as unknown as QuickJSAsyncVariant

  // Configure WASM location if provided
  if (wasmLocation) {
    return newVariant(baseVariant, {
      wasmLocation,
      locateFile: (path: string) => {
        if (path.endsWith(".wasm")) {
          return wasmLocation
        }
        const wasmDir = wasmLocation.substring(0, wasmLocation.lastIndexOf("/") + 1)
        return wasmDir + path
      },
    })
  }

  return baseVariant
}

/**
 * Load the WasmFS sync variant with shared OPFS filesystem.
 */
async function loadWasmFSVariant(wasmLocation?: string): Promise<QuickJSSyncVariant> {
  // Load the WasmFS sync variant (uses pthreads for OPFS)
  const variantModule = await import("@componentor/quickjs-wasmfs-release-sync")
  const baseVariant = (variantModule.default ?? variantModule) as unknown as QuickJSSyncVariant

  // Configure WASM location if provided
  if (wasmLocation) {
    return newVariant(baseVariant, {
      wasmLocation,
      locateFile: (path: string) => {
        if (path.endsWith(".wasm")) {
          return wasmLocation
        }
        // For WasmFS, also handle worker file location
        if (path.endsWith(".js") && path.includes("worker")) {
          const wasmDir = wasmLocation.substring(0, wasmLocation.lastIndexOf("/") + 1)
          return wasmDir + path
        }
        const wasmDir = wasmLocation.substring(0, wasmLocation.lastIndexOf("/") + 1)
        return wasmDir + path
      },
    })
  }

  return baseVariant
}

/**
 * Known exports for common Node.js modules.
 */
const moduleExports: Record<string, string[]> = {
  perf_hooks: ["performance", "PerformanceObserver", "PerformanceEntry", "monitorEventLoopDelay"],
  path: [
    "join",
    "resolve",
    "dirname",
    "basename",
    "extname",
    "normalize",
    "relative",
    "isAbsolute",
    "parse",
    "format",
    "sep",
    "delimiter",
    "posix",
    "win32",
  ],
  fs: [
    "readFile",
    "readFileSync",
    "writeFile",
    "writeFileSync",
    "existsSync",
    "exists",
    "mkdir",
    "mkdirSync",
    "readdir",
    "readdirSync",
    "stat",
    "statSync",
    "unlink",
    "unlinkSync",
    "rmdir",
    "rmdirSync",
    "rename",
    "renameSync",
    "copyFile",
    "copyFileSync",
    "access",
    "accessSync",
    "open",
    "openSync",
    "close",
    "closeSync",
    "read",
    "readSync",
    "write",
    "writeSync",
    "appendFile",
    "appendFileSync",
    "createReadStream",
    "createWriteStream",
    "watch",
    "watchFile",
    "unwatchFile",
    "promises",
    "constants",
  ],
  url: [
    "URL",
    "URLSearchParams",
    "parse",
    "format",
    "resolve",
    "fileURLToPath",
    "pathToFileURL",
    "domainToASCII",
    "domainToUnicode",
    "urlToHttpOptions",
    "Url",
  ],
  util: [
    "promisify",
    "inherits",
    "inspect",
    "format",
    "debuglog",
    "deprecate",
    "callbackify",
    "types",
    "isDeepStrictEqual",
    "TextEncoder",
    "TextDecoder",
  ],
  events: ["EventEmitter", "once", "on", "getEventListeners", "setMaxListeners", "listenerCount"],
  stream: [
    "Readable",
    "Writable",
    "Duplex",
    "Transform",
    "PassThrough",
    "Stream",
    "pipeline",
    "finished",
  ],
  buffer: ["Buffer", "constants", "kMaxLength", "kStringMaxLength", "SlowBuffer", "transcode"],
  crypto: [
    "createHash",
    "createHmac",
    "randomBytes",
    "randomUUID",
    "randomInt",
    "randomFillSync",
    "getRandomValues",
    "subtle",
    "timingSafeEqual",
  ],
  os: [
    "platform",
    "arch",
    "cpus",
    "totalmem",
    "freemem",
    "homedir",
    "tmpdir",
    "hostname",
    "type",
    "release",
    "networkInterfaces",
    "userInfo",
    "EOL",
    "endianness",
  ],
  process: [
    "env",
    "cwd",
    "chdir",
    "exit",
    "nextTick",
    "argv",
    "platform",
    "arch",
    "version",
    "versions",
    "pid",
    "ppid",
    "hrtime",
    "memoryUsage",
    "uptime",
    "stdout",
    "stderr",
    "stdin",
    "on",
    "off",
    "once",
    "emit",
  ],
  timers: [
    "setTimeout",
    "setInterval",
    "setImmediate",
    "clearTimeout",
    "clearInterval",
    "clearImmediate",
  ],
  assert: [
    "ok",
    "equal",
    "notEqual",
    "deepEqual",
    "notDeepEqual",
    "strictEqual",
    "notStrictEqual",
    "deepStrictEqual",
    "notDeepStrictEqual",
    "fail",
    "throws",
    "doesNotThrow",
    "ifError",
    "rejects",
    "doesNotReject",
    "match",
    "doesNotMatch",
    "AssertionError",
  ],
  querystring: ["parse", "stringify", "escape", "unescape", "encode", "decode"],
  zlib: [
    "createGzip",
    "createGunzip",
    "createDeflate",
    "createInflate",
    "gzip",
    "gunzip",
    "deflate",
    "inflate",
    "gzipSync",
    "gunzipSync",
    "deflateSync",
    "inflateSync",
    "constants",
  ],
}

/**
 * Set up module loader for ES module imports.
 */
/**
 * WasmFS module interface (Emscripten Module-level wrappers)
 */
interface WasmFSModule {
  readFile?(path: string): Uint8Array
  readFileString?(path: string): string
  writeFile?(path: string, data: Uint8Array): void
  writeFileString?(path: string, content: string): void
  readdir?(path: string): string[]
  stat?(path: string): { mtime: Date; isDirectory(): boolean; mode: number }
  mkdir?(path: string): void
  unlink?(path: string): void
  rmdir?(path: string): void
  rename?(oldPath: string, newPath: string): void
  exists?(path: string): boolean
}

/**
 * Expose WasmFS methods to the QuickJS context as globalThis.__wasmFS
 * This allows the fs polyfill to use WasmFS directly instead of std.open()
 */
function setupWasmFSGlobals(context: QuickJSContext): void {
  const module = syncModule?.getWasmModule() as unknown as WasmFSModule | undefined
  if (!module) {
    console.log("[Worker] No WasmFS module available")
    return
  }

  console.log("[Worker] Setting up WasmFS globals...")

  // Create __wasmFS object
  const wasmFSObj = context.newObject()

  // Helper to create a wrapped function
  const wrapFn = (name: string, fn: (...args: unknown[]) => unknown) => {
    const wrapped = context.newFunction(name, (...handles) => {
      try {
        const args = handles.map((h) => context.dump(h))
        const result = fn(...args)

        // Handle different return types
        if (result === undefined || result === null) {
          return context.undefined
        }
        if (typeof result === "string") {
          return context.newString(result)
        }
        if (typeof result === "boolean") {
          return result ? context.true : context.false
        }
        if (typeof result === "number") {
          return context.newNumber(result)
        }
        if (result instanceof Uint8Array) {
          // Convert to array for QuickJS
          const arr = context.newArray()
          for (let i = 0; i < result.length; i++) {
            const num = context.newNumber(result[i])
            context.setProp(arr, i, num)
            num.dispose()
          }
          return arr
        }
        if (Array.isArray(result)) {
          const arr = context.newArray()
          for (let i = 0; i < result.length; i++) {
            const str = context.newString(String(result[i]))
            context.setProp(arr, i, str)
            str.dispose()
          }
          return arr
        }
        if (typeof result === "object") {
          // Return stat-like objects
          const obj = context.newObject()
          for (const [key, val] of Object.entries(result as Record<string, unknown>)) {
            if (typeof val === "function") {
              const fnResult = (val as () => unknown)()
              if (typeof fnResult === "boolean") {
                context.setProp(obj, key, fnResult ? context.true : context.false)
              }
            } else if (typeof val === "number") {
              const num = context.newNumber(val)
              context.setProp(obj, key, num)
              num.dispose()
            } else if (val instanceof Date) {
              const num = context.newNumber(val.getTime())
              context.setProp(obj, key, num)
              num.dispose()
            }
          }
          return obj
        }
        return context.undefined
      } catch (e) {
        console.error(`[Worker] WasmFS.${name} error:`, e)
        return context.newError(e instanceof Error ? e.message : String(e))
      }
    })
    context.setProp(wasmFSObj, name, wrapped)
    wrapped.dispose()
  }

  // Expose available WasmFS methods
  if (module.readFileString) {
    wrapFn("readFileString", (path: unknown) => module.readFileString!(String(path)))
  }
  if (module.writeFileString) {
    wrapFn("writeFileString", (path: unknown, content: unknown) => {
      module.writeFileString!(String(path), String(content))
      return true
    })
  }
  if (module.readFile) {
    wrapFn("readFile", (path: unknown) => module.readFile!(String(path)))
  }
  if (module.writeFile) {
    wrapFn("writeFile", (path: unknown, data: unknown) => {
      // Convert array to Uint8Array
      const arr = Array.isArray(data) ? new Uint8Array(data as number[]) : (data as Uint8Array)
      module.writeFile!(String(path), arr)
      return true
    })
  }
  if (module.readdir) {
    wrapFn("readdir", (path: unknown) => module.readdir!(String(path)))
  }
  if (module.stat) {
    wrapFn("stat", (path: unknown) => module.stat!(String(path)))
  }
  if (module.mkdir) {
    wrapFn("mkdir", (path: unknown) => {
      module.mkdir!(String(path))
      return true
    })
  }
  if (module.unlink) {
    wrapFn("unlink", (path: unknown) => {
      module.unlink!(String(path))
      return true
    })
  }
  if (module.rmdir) {
    wrapFn("rmdir", (path: unknown) => {
      module.rmdir!(String(path))
      return true
    })
  }
  if (module.rename) {
    wrapFn("rename", (oldPath: unknown, newPath: unknown) => {
      module.rename!(String(oldPath), String(newPath))
      return true
    })
  }
  if (module.exists) {
    wrapFn("exists", (path: unknown) => module.exists!(String(path)))
  }

  // Set __wasmFS as a global
  const global = context.global
  context.setProp(global, "__wasmFS", wasmFSObj)
  wasmFSObj.dispose()

  console.log("[Worker] WasmFS globals set up successfully")
}

/**
 * Read a file from WasmFS using the Emscripten FS API
 */
function readFileFromWasmFS(path: string): string | null {
  // Get the Emscripten module from the sync context
  const module = syncModule?.getWasmModule() as unknown as WasmFSModule | undefined
  if (!module) {
    console.log(`[Worker] No WasmFS module available for reading: ${path}`)
    return null
  }

  // WasmFS path translation: OPFS is mounted at /root in WasmFS
  // So /home/user/... needs to become /root/home/user/...
  let translatedPath = path
  if (path.startsWith("/") && !path.startsWith("/root/")) {
    translatedPath = "/root" + path
  }

  try {
    if (module.readFileString) {
      const content = module.readFileString(translatedPath)
      if (content !== null && content !== undefined) {
        return content
      }
    }
  } catch (e) {
    console.log(`[Worker] Failed to read file ${translatedPath}:`, e)
  }

  return null
}

/**
 * Check if a path looks like a file path (not a module name)
 */
function isFilePath(name: string): boolean {
  return name.startsWith("/") || name.startsWith("./") || name.startsWith("../")
}

/**
 * Check if a module name is a bare specifier (npm package name)
 */
function isBareSpecifier(name: string): boolean {
  // Not a file path, not a node: builtin
  if (isFilePath(name)) return false
  if (name.startsWith("node:")) return false
  // Check if it looks like a package name (starts with letter, @, or is scoped)
  return /^[@a-zA-Z]/.test(name)
}

/**
 * Resolve a relative import path against the current module's directory
 */
function resolveModulePath(importPath: string, currentModulePath: string | undefined): string {
  if (importPath.startsWith("/")) {
    return importPath
  }

  if (!currentModulePath) {
    // No current module context, treat as absolute
    return importPath
  }

  // Get directory of current module
  const lastSlash = currentModulePath.lastIndexOf("/")
  const currentDir = lastSlash >= 0 ? currentModulePath.substring(0, lastSlash) : ""

  // Handle ./ and ../
  if (importPath.startsWith("./")) {
    return currentDir + importPath.substring(1)
  }

  if (importPath.startsWith("../")) {
    let dir = currentDir
    let remaining = importPath
    while (remaining.startsWith("../")) {
      const parentSlash = dir.lastIndexOf("/")
      dir = parentSlash >= 0 ? dir.substring(0, parentSlash) : ""
      remaining = remaining.substring(3)
    }
    return dir + "/" + remaining
  }

  return importPath
}

/**
 * Find the nearest node_modules directory by walking up from a given path
 */
function findNodeModulesDir(fromPath: string): string | null {
  let dir = fromPath
  // Walk up looking for node_modules
  while (dir && dir !== "/") {
    const lastSlash = dir.lastIndexOf("/")
    dir = lastSlash >= 0 ? dir.substring(0, lastSlash) : ""
    // Check if this directory might have node_modules
    // For now, assume /home/user/node_modules exists as the primary location
    if (dir === "/home/user" || dir === "") {
      return "/home/user/node_modules"
    }
  }
  return "/home/user/node_modules" // Default fallback
}

/**
 * Resolve a bare module specifier to a file path
 * e.g., 'vite' -> '/home/user/node_modules/vite/dist/node/index.js'
 */
function resolveBareModule(moduleName: string, fromPath: string | undefined): string | null {
  const nodeModulesDir = findNodeModulesDir(fromPath || "/home/user")
  if (!nodeModulesDir) return null

  // Handle scoped packages (@org/package) and subpath imports (package/subpath)
  let packageName: string
  let subpath: string | null = null

  if (moduleName.startsWith("@")) {
    // Scoped package: @org/package or @org/package/subpath
    const parts = moduleName.split("/")
    if (parts.length >= 2) {
      packageName = parts[0] + "/" + parts[1]
      if (parts.length > 2) {
        subpath = "./" + parts.slice(2).join("/")
      }
    } else {
      return null // Invalid scoped package
    }
  } else {
    // Regular package: package or package/subpath
    const slashIndex = moduleName.indexOf("/")
    if (slashIndex > 0) {
      packageName = moduleName.substring(0, slashIndex)
      subpath = "./" + moduleName.substring(slashIndex + 1)
    } else {
      packageName = moduleName
    }
  }

  const packageDir = `${nodeModulesDir}/${packageName}`
  const packageJsonPath = `${packageDir}/package.json`

  // Try to read package.json
  const packageJsonContent = readFileFromWasmFS(packageJsonPath)
  if (!packageJsonContent) {
    console.log(`[Worker] Could not read package.json for ${packageName}`)
    return null
  }

  try {
    const packageJson = JSON.parse(packageJsonContent)

    // If there's a subpath, resolve it
    if (subpath) {
      // Check exports map first
      if (packageJson.exports) {
        const resolved = resolveExportsMap(packageJson.exports, subpath, packageDir)
        if (resolved) return resolved
      }
      // Fall back to direct file path
      return resolveFilePath(`${packageDir}/${subpath.substring(2)}`)
    }

    // No subpath - resolve main entry point
    // Priority: exports["."] > module > main > index.js

    // Check exports map
    if (packageJson.exports) {
      const resolved = resolveExportsMap(packageJson.exports, ".", packageDir)
      if (resolved) return resolved
    }

    // Check module field (ESM entry)
    if (packageJson.module) {
      const modulePath = `${packageDir}/${packageJson.module}`
      const resolved = resolveFilePath(modulePath)
      if (resolved) return resolved
    }

    // Check main field
    if (packageJson.main) {
      const mainPath = `${packageDir}/${packageJson.main}`
      const resolved = resolveFilePath(mainPath)
      if (resolved) return resolved
    }

    // Default to index.js
    const indexPath = `${packageDir}/index.js`
    const resolved = resolveFilePath(indexPath)
    if (resolved) return resolved

    console.log(`[Worker] Could not find entry point for ${packageName}`)
    return null
  } catch (e) {
    console.log(`[Worker] Error parsing package.json for ${packageName}:`, e)
    return null
  }
}

/**
 * Resolve exports map from package.json
 */
function resolveExportsMap(
  exports: Record<string, unknown> | string,
  subpath: string,
  packageDir: string,
): string | null {
  if (typeof exports === "string") {
    // Simple string export
    return resolveFilePath(`${packageDir}/${exports}`)
  }

  if (typeof exports !== "object" || exports === null) {
    return null
  }

  // Look for the subpath in exports
  const exportEntry = exports[subpath] || exports[subpath === "." ? "." : `./${subpath}`]

  if (!exportEntry) {
    // Try default export for "."
    if (subpath === "." && exports.default) {
      return resolveExportCondition(exports.default, packageDir)
    }
    return null
  }

  return resolveExportCondition(exportEntry, packageDir)
}

/**
 * Resolve an export condition (handles conditional exports)
 */
function resolveExportCondition(condition: unknown, packageDir: string): string | null {
  if (typeof condition === "string") {
    return resolveFilePath(`${packageDir}/${condition}`)
  }

  if (typeof condition === "object" && condition !== null) {
    const condObj = condition as Record<string, unknown>
    // Priority: import > module > default > require
    for (const key of ["import", "module", "default", "require", "node"]) {
      if (condObj[key]) {
        const result = resolveExportCondition(condObj[key], packageDir)
        if (result) return result
      }
    }
  }

  return null
}

/**
 * Resolve a file path, trying different extensions
 */
function resolveFilePath(filePath: string): string | null {
  // Normalize path (remove ./ prefix if present)
  let normalized = filePath
  if (normalized.includes("/./")) {
    normalized = normalized.replace(/\/\.\//g, "/")
  }

  // Try the exact path first
  if (readFileFromWasmFS(normalized) !== null) {
    return normalized
  }

  // Try with extensions
  for (const ext of [".js", ".mjs", ".cjs", ".json"]) {
    const withExt = normalized + ext
    if (readFileFromWasmFS(withExt) !== null) {
      return withExt
    }
  }

  // Try as directory with index
  for (const indexFile of ["/index.js", "/index.mjs", "/index.cjs"]) {
    const indexPath = normalized + indexFile
    if (readFileFromWasmFS(indexPath) !== null) {
      return indexPath
    }
  }

  return null
}

// Stack to track module loading for proper relative path resolution
const moduleLoadStack: string[] = []

/**
 * Get the current module path from the stack
 */
function getCurrentModulePath(): string | undefined {
  return moduleLoadStack.length > 0 ? moduleLoadStack[moduleLoadStack.length - 1] : undefined
}

/**
 * Load a file module and return its source code
 */
function loadFileModule(resolvedPath: string): string | { error: Error } {
  const content = readFileFromWasmFS(resolvedPath)
  if (content === null) {
    console.error(`[Worker] Failed to load file module: ${resolvedPath}`)
    return { error: new Error(`Module not found: ${resolvedPath}`) }
  }

  console.log(`[Worker] Loaded file module: ${resolvedPath} (${content.length} bytes)`)

  // Push to stack for nested imports
  moduleLoadStack.push(resolvedPath)

  // Strip shebang if present
  let source = content
  if (source.startsWith("#!")) {
    const newlineIndex = source.indexOf("\n")
    if (newlineIndex !== -1) {
      source = source.substring(newlineIndex + 1)
    }
  }

  // Inject import.meta properties for ES modules
  // We append at the end to avoid issues with import statement hoisting
  const fileUrl = `file://${resolvedPath}`
  const dirname = resolvedPath.substring(0, resolvedPath.lastIndexOf("/"))

  // Use a wrapper that sets up import.meta before the module runs
  // QuickJS initializes import.meta as an empty object, so we can define properties on it
  const metaSetup = `
;(function() {
  const _meta = import.meta;
  if (!_meta.url) Object.defineProperty(_meta, 'url', { value: '${fileUrl}', writable: false, configurable: true });
  if (!_meta.dirname) Object.defineProperty(_meta, 'dirname', { value: '${dirname}', writable: false, configurable: true });
  if (!_meta.filename) Object.defineProperty(_meta, 'filename', { value: '${resolvedPath}', writable: false, configurable: true });
})();
`

  // Pop from stack after module is loaded (synchronous)
  // Note: For proper nested import handling, we pop after returning
  // QuickJS processes modules synchronously, so this works
  queueMicrotask(() => {
    if (
      moduleLoadStack.length > 0 &&
      moduleLoadStack[moduleLoadStack.length - 1] === resolvedPath
    ) {
      moduleLoadStack.pop()
    }
  })

  // Append meta setup at the end (after imports are hoisted)
  return source + "\n" + metaSetup
}

function setupModuleLoader(runtime: QuickJSRuntime): void {
  runtime.setModuleLoader((moduleName: string, _ctx: unknown) => {
    console.log(`[Worker] Module loader called for: ${moduleName}`)
    try {
      // Get current module path for relative resolution
      const currentModule = getCurrentModulePath()

      // 1. Check if this is a file path import
      if (isFilePath(moduleName)) {
        const resolvedPath = resolveModulePath(moduleName, currentModule)
        console.log(`[Worker] File import: ${moduleName} -> ${resolvedPath}`)
        return loadFileModule(resolvedPath)
      }

      // 2. Check for node: built-in modules
      if (moduleName.startsWith("node:")) {
        const normalizedName = moduleName.slice(5)
        console.log(`[Worker] Node builtin: ${normalizedName}`)
        return generateBuiltinModule(normalizedName, moduleName)
      }

      // 3. Check if it's a bare specifier (npm package)
      if (isBareSpecifier(moduleName)) {
        console.log(`[Worker] Bare specifier: ${moduleName}`)
        const resolvedPath = resolveBareModule(moduleName, currentModule)
        if (resolvedPath) {
          console.log(`[Worker] Resolved bare module: ${moduleName} -> ${resolvedPath}`)
          return loadFileModule(resolvedPath)
        }
        // Fall through to try as builtin
        console.log(`[Worker] Could not resolve as npm package, trying as builtin: ${moduleName}`)
      }

      // 4. Try as a builtin module (for things like 'fs', 'path', etc.)
      return generateBuiltinModule(moduleName, moduleName)
    } catch (err) {
      console.error(`[Worker] Module loader error:`, err)
      return { error: err instanceof Error ? err : new Error(String(err)) }
    }
  })
}

/**
 * Generate synthetic module code for builtin modules
 */
function generateBuiltinModule(normalizedName: string, originalName: string): string {
  console.log(`[Worker] Generating builtin module: ${normalizedName}`)

  // Get known exports for this module
  const knownExports = moduleExports[normalizedName] || []
  console.log(`[Worker] Known exports for ${normalizedName}:`, knownExports.length)

  // Generate named exports
  const namedExports = knownExports.map((name) => `export var ${name} = _mod.${name};`).join("\n")

  // Return module code that exports the polyfilled module
  const moduleCode = `var _builtins = globalThis.__builtinModules;
if (!_builtins) throw new Error('__builtinModules not found');
var _mod = _builtins['${normalizedName}'];
if (!_mod) throw new Error("Module '${originalName}' not found in polyfills. Available: " + Object.keys(_builtins || {}).join(', '));
${namedExports}
export default _mod;
`
  console.log(`[Worker] Returning builtin module code (${moduleCode.length} bytes)`)
  return moduleCode
}

async function handleInit(message: InitMessage): Promise<void> {
  try {
    currentVariant = message.variant ?? "singlefile"
    isAsyncVariant = currentVariant !== "wasmfs"

    console.log(`[Worker] Initializing with variant: ${currentVariant}, isAsync: ${isAsyncVariant}`)

    if (isAsyncVariant) {
      // Load async variant (singlefile with asyncify)
      const variant = await loadAsyncVariant(message.wasmLocation)
      asyncModule = await newQuickJSAsyncWASMModuleFromVariant(variant)
      asyncContext = asyncModule.newContext(message.contextOptions)
      console.log("[Worker] Async context created")
    } else {
      // Load WasmFS sync variant (with pthreads for OPFS)
      const variant = await loadWasmFSVariant(message.wasmLocation)
      syncModule = await newQuickJSWASMModuleFromVariant(variant)
      syncContext = syncModule.newContext(message.contextOptions)
      console.log("[Worker] WasmFS sync context created")
    }

    const context = getContext()
    if (!context) {
      throw new Error("Failed to create context")
    }

    // For WasmFS variant, expose WasmFS methods as globals BEFORE running bootstrap
    // This allows the fs polyfill to use __wasmFS instead of std.open()
    if (!isAsyncVariant && syncContext) {
      setupWasmFSGlobals(syncContext)
    }

    // Run bootstrap code if provided
    if (message.bootstrapCode) {
      console.log("[Worker] Running bootstrap code...")
      if (isAsyncVariant && asyncContext) {
        const result = await asyncContext.evalCodeAsync(message.bootstrapCode, "<bootstrap>")
        if (result.error) {
          const errorValue = asyncContext.dump(result.error)
          result.error.dispose()
          postToMain({
            type: "init-error",
            error: {
              name: "BootstrapError",
              message: `Bootstrap code failed: ${formatError(errorValue)}`,
              stack: getErrorStack(errorValue),
            },
          })
          return
        }
        result.value.dispose()
      } else if (syncContext) {
        const result = syncContext.evalCode(message.bootstrapCode, "<bootstrap>")
        if (result.error) {
          const errorValue = syncContext.dump(result.error)
          result.error.dispose()
          postToMain({
            type: "init-error",
            error: {
              name: "BootstrapError",
              message: `Bootstrap code failed: ${formatError(errorValue)}`,
              stack: getErrorStack(errorValue),
            },
          })
          return
        }
        result.value.dispose()
      }
      console.log("[Worker] Bootstrap code completed")

      // Set up module loader
      const runtime = getRuntime()
      if (runtime) {
        setupModuleLoader(runtime)
      }
    }

    postToMain({ type: "ready" })
  } catch (error) {
    console.error("[Worker] Init error:", error)
    postToMain({
      type: "init-error",
      error: {
        name: "InitializationError",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    })
  }
}

/**
 * Format an error value for display.
 */
function formatError(errorValue: unknown): string {
  if (typeof errorValue === "object" && errorValue && "message" in errorValue) {
    return String((errorValue as { message: unknown }).message)
  }
  return String(errorValue)
}

/**
 * Get stack trace from an error value.
 */
function getErrorStack(errorValue: unknown): string | undefined {
  if (typeof errorValue === "object" && errorValue && "stack" in errorValue) {
    return (errorValue as { stack: string }).stack
  }
  return undefined
}

/**
 * Strip shebang from source code.
 */
function stripShebang(source: string): string {
  if (source.startsWith("#!")) {
    const newlineIndex = source.indexOf("\n")
    if (newlineIndex !== -1) {
      return source.substring(newlineIndex + 1)
    }
    return ""
  }
  return source
}

/**
 * Check if code appears to be an ES module.
 */
function isESModule(source: string): boolean {
  return /^\s*(import|export)\s/m.test(source)
}

async function handleEval(message: EvalMessage): Promise<void> {
  const context = getContext()

  if (!context) {
    postToMain({
      type: "error",
      taskId: message.taskId,
      error: {
        name: "Error",
        message: "Worker not initialized",
      },
    })
    return
  }

  // Preprocess code
  const code = stripShebang(message.code)
  const isModule = isESModule(code)

  console.log(
    `[Worker] evalCode called with ${code.length} bytes, filename: ${message.filename}, isModule: ${isModule}, variant: ${currentVariant}`,
  )
  console.log(`[Worker] Code preview (first 500 chars):`, code.slice(0, 500))

  // Check if cancelled
  if (cancelledTaskId === message.taskId) {
    cancelledTaskId = null
    postToMain({
      type: "error",
      taskId: message.taskId,
      error: {
        name: "CancelledError",
        message: "Task was cancelled",
        isCancelled: true,
      },
    })
    return
  }

  try {
    // Set up interrupt handler for timeout and cancellation
    let timedOut = false
    const deadline = message.timeout ? Date.now() + message.timeout : 0

    context.runtime.setInterruptHandler(() => {
      if (cancelledTaskId === message.taskId) {
        cancelledTaskId = null
        return true
      }
      if (deadline && Date.now() > deadline) {
        timedOut = true
        return true
      }
      return false
    })

    try {
      let result: { value?: unknown; error?: unknown }

      if (isAsyncVariant && asyncContext) {
        // Use evalCodeAsync for TLA support
        const asyncResult = await asyncContext.evalCodeAsync(code, message.filename ?? "eval.js")
        if (asyncResult.error) {
          result = { error: asyncContext.dump(asyncResult.error) }
          asyncResult.error.dispose()
        } else {
          result = { value: asyncContext.dump(asyncResult.value) }
          asyncResult.value.dispose()
        }
      } else if (syncContext) {
        // Use evalCode for sync variant (WasmFS uses pthreads for async I/O)
        const syncResult = syncContext.evalCode(code, message.filename ?? "eval.js")
        if (syncResult.error) {
          result = { error: syncContext.dump(syncResult.error) }
          syncResult.error.dispose()
        } else {
          result = { value: syncContext.dump(syncResult.value) }
          syncResult.value.dispose()
        }
      } else {
        throw new Error("No context available")
      }

      // Check if cancelled during evaluation
      if (cancelledTaskId === message.taskId) {
        cancelledTaskId = null
        postToMain({
          type: "error",
          taskId: message.taskId,
          error: {
            name: "CancelledError",
            message: "Task was cancelled",
            isCancelled: true,
          },
        })
        return
      }

      if (result.error) {
        if (timedOut) {
          postToMain({
            type: "error",
            taskId: message.taskId,
            error: {
              name: "TimeoutError",
              message: `Task timed out after ${message.timeout}ms`,
              isTimeout: true,
            },
          })
          return
        }

        const errorValue = result.error
        let error: WorkerTaskError
        if (errorValue && typeof errorValue === "object" && "message" in errorValue) {
          error = {
            name: (errorValue as { name?: string }).name ?? "Error",
            message: String((errorValue as { message?: unknown }).message),
            stack: (errorValue as { stack?: string }).stack,
          }
        } else {
          error = {
            name: "Error",
            message: String(errorValue),
          }
        }

        postToMain({
          type: "error",
          taskId: message.taskId,
          error,
        })
        return
      }

      postToMain({
        type: "result",
        taskId: message.taskId,
        value: result.value,
      })
    } finally {
      context.runtime.removeInterruptHandler()
    }
  } catch (error) {
    postToMain({
      type: "error",
      taskId: message.taskId,
      error: {
        name: "Error",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    })
  }
}

function handleCancel(taskId: string): void {
  cancelledTaskId = taskId
}

function handleTerminate(): void {
  if (asyncContext) {
    asyncContext.dispose()
    asyncContext = null
  }
  if (syncContext) {
    syncContext.dispose()
    syncContext = null
  }
  asyncModule = null
  syncModule = null

  if (typeof process !== "undefined" && process.exit) {
    process.exit(0)
  }
}

// Initialize the message listener
setupMessageListener()
