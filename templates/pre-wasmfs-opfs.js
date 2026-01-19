/**
 * WasmFS OPFS Integration
 *
 * This pre-js file adds OPFS mounting functionality to the QuickJS module.
 * It provides methods to mount the browser's Origin Private File System
 * as a WasmFS backend, enabling fast filesystem access without JS boundary crossing.
 */

// Add OPFS mounting function to Module
Module["mountOPFS"] = async function (mountPoint = "/opfs") {
  if (!navigator.storage || !navigator.storage.getDirectory) {
    throw new Error("OPFS is not supported in this browser")
  }

  // Get the OPFS root
  const opfsRoot = await navigator.storage.getDirectory()

  // Mount OPFS using WasmFS OPFS backend
  // The wasmfsOPFSGetOrCreateDir function is provided by Emscripten's OPFS support
  // It handles creating the directory and backing it with OPFS - no need to mkdir first
  if (typeof Module["wasmfsOPFSGetOrCreateDir"] === "function") {
    // WasmFS OPFS API - creates the directory backed by OPFS
    // This handles both creating the mount point and connecting it to OPFS
    try {
      await Module["wasmfsOPFSGetOrCreateDir"](opfsRoot, mountPoint)
    } catch (e) {
      // Check if directory already exists and is properly mounted
      try {
        const stat = Module["FS"].stat(mountPoint)
        if (stat && typeof stat.mode !== "undefined") {
          // Directory exists, might already be mounted
          console.log("[WasmFS] Mount point already exists at", mountPoint)
          return mountPoint
        }
      } catch (statErr) {
        // Directory doesn't exist, re-throw original error
      }
      throw e
    }
  } else if (Module["FS"] && Module["FS"].filesystems && Module["FS"].filesystems.OPFS) {
    // Fallback to FS.mount if available (older Emscripten API)
    try {
      Module["FS"].mkdir(mountPoint)
    } catch (e) {
      // Directory might already exist, ignore EEXIST
      if (e.code !== "EEXIST" && e.errno !== 20) {
        throw e
      }
    }
    Module["FS"].mount(Module["FS"].filesystems.OPFS, { root: opfsRoot }, mountPoint)
  } else {
    throw new Error("WasmFS OPFS backend not available. Ensure -lopfs.js is in build flags.")
  }

  console.log("[WasmFS] OPFS mounted at", mountPoint)
  return mountPoint
}

// Add file watching support via polling (OPFS doesn't have native watch API in WasmFS)
Module["watchFiles"] = function (paths, callback, intervalMs = 100) {
  const mtimes = new Map()

  // Initialize mtimes
  for (const path of paths) {
    try {
      const stat = Module["FS"].stat(path)
      mtimes.set(path, stat.mtime.getTime())
    } catch (e) {
      // File doesn't exist yet
      mtimes.set(path, 0)
    }
  }

  // Start polling
  const intervalId = setInterval(() => {
    for (const path of paths) {
      try {
        const stat = Module["FS"].stat(path)
        const newMtime = stat.mtime.getTime()
        const oldMtime = mtimes.get(path)

        if (newMtime !== oldMtime) {
          mtimes.set(path, newMtime)
          if (oldMtime !== 0) {
            // File changed (not just first stat)
            callback(path, "change")
          }
        }
      } catch (e) {
        const oldMtime = mtimes.get(path)
        if (oldMtime !== 0) {
          // File was deleted
          mtimes.set(path, 0)
          callback(path, "delete")
        }
      }
    }
  }, intervalMs)

  // Return cleanup function
  return {
    close: function () {
      clearInterval(intervalId)
    },
    addPath: function (path) {
      if (!paths.includes(path)) {
        paths.push(path)
        try {
          const stat = Module["FS"].stat(path)
          mtimes.set(path, stat.mtime.getTime())
        } catch (e) {
          mtimes.set(path, 0)
        }
      }
    },
    removePath: function (path) {
      const idx = paths.indexOf(path)
      if (idx !== -1) {
        paths.splice(idx, 1)
        mtimes.delete(path)
      }
    },
  }
}

// Watch a directory recursively
Module["watchDirectory"] = function (dirPath, callback, intervalMs = 100) {
  const watchedFiles = new Map() // path -> mtime

  function scanDirectory(path) {
    const files = []
    try {
      const entries = Module["FS"].readdir(path)
      for (const entry of entries) {
        if (entry === "." || entry === "..") continue
        const fullPath = path + "/" + entry
        try {
          const stat = Module["FS"].stat(fullPath)
          if (stat.isDirectory()) {
            files.push(...scanDirectory(fullPath))
          } else {
            files.push({ path: fullPath, mtime: stat.mtime.getTime() })
          }
        } catch (e) {
          // Skip inaccessible files
        }
      }
    } catch (e) {
      // Directory doesn't exist or not accessible
    }
    return files
  }

  // Initial scan
  const initialFiles = scanDirectory(dirPath)
  for (const file of initialFiles) {
    watchedFiles.set(file.path, file.mtime)
  }

  // Start polling
  const intervalId = setInterval(() => {
    const currentFiles = scanDirectory(dirPath)
    const currentPaths = new Set()

    for (const file of currentFiles) {
      currentPaths.add(file.path)
      const oldMtime = watchedFiles.get(file.path)

      if (oldMtime === undefined) {
        // New file
        watchedFiles.set(file.path, file.mtime)
        callback(file.path, "add")
      } else if (file.mtime !== oldMtime) {
        // Changed file
        watchedFiles.set(file.path, file.mtime)
        callback(file.path, "change")
      }
    }

    // Check for deleted files
    for (const [path] of watchedFiles) {
      if (!currentPaths.has(path)) {
        watchedFiles.delete(path)
        callback(path, "delete")
      }
    }
  }, intervalMs)

  return {
    close: function () {
      clearInterval(intervalId)
    },
  }
}

// Helper to read file as string
Module["readFileString"] = function (path) {
  const data = Module["FS"].readFile(path)
  return new TextDecoder().decode(data)
}

// Helper to write string to file
Module["writeFileString"] = function (path, content) {
  const data = new TextEncoder().encode(content)
  Module["FS"].writeFile(path, data)
}

// Sync OPFS to ensure all writes are persisted
Module["syncOPFS"] = async function () {
  if (Module["FS"] && Module["FS"].syncfs) {
    return new Promise((resolve, reject) => {
      Module["FS"].syncfs(false, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}
