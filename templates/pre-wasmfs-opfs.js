/**
 * WasmFS OPFS Integration
 *
 * This pre-js file adds OPFS mounting functionality to the QuickJS module.
 * It provides methods to mount the browser's Origin Private File System
 * as a WasmFS backend, enabling fast filesystem access without JS boundary crossing.
 *
 * IMPORTANT: OPFS directories must be mounted during module initialization.
 * We use multiple hooks to try mounting at the right time:
 * 1. preInit - runs before runtime init (may be too early)
 * 2. onRuntimeInitialized - runs right when runtime is ready
 * 3. preRun - runs after runtime init (may be too late)
 */

// ============================================================================
// OPFS Mounting State
// ============================================================================
var _opfsMountState = {
  attempted: false,
  succeeded: false,
  mountedPaths: [],
  opfsRoot: null,
  opfsDirs: [],
  errors: [],
}

// ============================================================================
// OPFS Discovery - runs immediately to get OPFS data ready
// ============================================================================
var _opfsDiscoveryPromise = null

if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.getDirectory) {
  _opfsDiscoveryPromise = (async function () {
    try {
      var opfsRoot = await navigator.storage.getDirectory()
      _opfsMountState.opfsRoot = opfsRoot
      console.log("[WasmFS] Got OPFS root handle")

      var dirs = []
      for await (var entry of opfsRoot.entries()) {
        var name = entry[0]
        var handle = entry[1]
        if (handle.kind === "directory") {
          dirs.push({ name: name, handle: handle })
        }
      }
      _opfsMountState.opfsDirs = dirs
      console.log(
        "[WasmFS] Discovered OPFS directories:",
        dirs.map(function (d) {
          return d.name
        }),
      )
      return true
    } catch (e) {
      console.error("[WasmFS] OPFS discovery failed:", e)
      _opfsMountState.errors.push(e)
      return false
    }
  })()
}

// ============================================================================
// Mount Function - attempts to mount OPFS directories
// ============================================================================
async function _attemptOPFSMount(phase) {
  if (_opfsMountState.attempted) {
    console.log("[WasmFS " + phase + "] Mount already attempted, skipping")
    return _opfsMountState.succeeded
  }

  // Wait for discovery to complete
  if (_opfsDiscoveryPromise) {
    await _opfsDiscoveryPromise
  }

  if (!_opfsMountState.opfsRoot) {
    console.log("[WasmFS " + phase + "] No OPFS root, skipping mount")
    return false
  }

  if (_opfsMountState.opfsDirs.length === 0) {
    console.log("[WasmFS " + phase + "] No OPFS directories found")
    return false
  }

  _opfsMountState.attempted = true
  console.log("[WasmFS " + phase + "] Attempting OPFS mount...")

  // Check what functions are available
  var hasMountFunc = typeof Module["wasmfsOPFSGetOrCreateDir"] === "function"
  var hasFS = typeof Module["FS"] !== "undefined"

  console.log("[WasmFS " + phase + "] Available:", {
    wasmfsOPFSGetOrCreateDir: hasMountFunc,
    FS: hasFS,
    "Module._qtsEarlyInitCalled": Module._qtsEarlyInitCalled,
    "Module._qtsLateInitCalled": Module._qtsLateInitCalled,
  })

  if (!hasMountFunc) {
    console.warn("[WasmFS " + phase + "] wasmfsOPFSGetOrCreateDir not available")
    return false
  }

  // Skip system directories
  var skipDirs = ["dev", "tmp", "proc", "sys"]
  var mounted = []

  for (var i = 0; i < _opfsMountState.opfsDirs.length; i++) {
    var dir = _opfsMountState.opfsDirs[i]

    if (skipDirs.indexOf(dir.name) !== -1) {
      console.log("[WasmFS " + phase + "] Skipping system dir:", dir.name)
      continue
    }

    var wasmfsPath = "/" + dir.name

    try {
      console.log("[WasmFS " + phase + "] Mounting", dir.name, "at", wasmfsPath)
      var result = await Module["wasmfsOPFSGetOrCreateDir"](dir.handle, wasmfsPath)

      if (result === 0 || result === undefined) {
        mounted.push(wasmfsPath)
        console.log("[WasmFS " + phase + "] SUCCESS: Mounted", dir.name, "at", wasmfsPath)
      } else {
        console.warn("[WasmFS " + phase + "] Mount returned error:", result, "for", dir.name)
        _opfsMountState.errors.push({ path: wasmfsPath, error: result })
      }
    } catch (e) {
      console.error("[WasmFS " + phase + "] Mount threw for", dir.name, ":", e)
      _opfsMountState.errors.push({ path: wasmfsPath, error: e })
    }
  }

  if (mounted.length > 0) {
    _opfsMountState.succeeded = true
    _opfsMountState.mountedPaths = mounted
    Module["_opfsMounted"] = true
    Module["_opfsMountedPaths"] = mounted
    console.log("[WasmFS " + phase + "] Successfully mounted:", mounted)
    return true
  }

  console.warn("[WasmFS " + phase + "] No directories mounted successfully")
  return false
}

// ============================================================================
// Hook: preInit - runs BEFORE runtime initialization
// ============================================================================
if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.getDirectory) {
  Module["preInit"] = Module["preInit"] || []
  Module["preInit"].push(function () {
    console.log("[WasmFS preInit] Hook called")
    console.log("[WasmFS preInit] Available functions:", {
      wasmfsOPFSGetOrCreateDir: typeof Module["wasmfsOPFSGetOrCreateDir"],
      FS: typeof Module["FS"],
      addRunDependency: typeof Module["addRunDependency"],
    })

    // The mount function probably isn't available yet, but let's check
    if (typeof Module["wasmfsOPFSGetOrCreateDir"] === "function") {
      console.log("[WasmFS preInit] wasmfsOPFSGetOrCreateDir IS available in preInit!")
      // Add dependency to block execution until mount completes
      if (typeof Module["addRunDependency"] === "function") {
        Module["addRunDependency"]("opfs-mount-preInit")
        _attemptOPFSMount("preInit")
          .then(function () {
            Module["removeRunDependency"]("opfs-mount-preInit")
          })
          .catch(function (e) {
            console.error("[WasmFS preInit] Mount failed:", e)
            Module["removeRunDependency"]("opfs-mount-preInit")
          })
      }
    } else {
      console.log("[WasmFS preInit] wasmfsOPFSGetOrCreateDir not yet available (expected)")
    }
  })
}

// ============================================================================
// Hook: onRuntimeInitialized - runs when runtime is JUST initialized
// This is potentially the sweet spot for OPFS mounting
// ============================================================================
if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.getDirectory) {
  var origOnRuntimeInitialized = Module["onRuntimeInitialized"]

  Module["onRuntimeInitialized"] = function () {
    console.log("[WasmFS onRuntimeInitialized] Hook called")
    console.log("[WasmFS onRuntimeInitialized] Available functions:", {
      wasmfsOPFSGetOrCreateDir: typeof Module["wasmfsOPFSGetOrCreateDir"],
      FS: typeof Module["FS"],
    })

    // Try mounting here - this might be the right time
    if (typeof Module["wasmfsOPFSGetOrCreateDir"] === "function") {
      console.log("[WasmFS onRuntimeInitialized] Attempting mount synchronously...")
      // Note: This is async but we can't block here. The mount will complete
      // but may not be ready before preRun callbacks
      _attemptOPFSMount("onRuntimeInitialized").then(function (success) {
        console.log("[WasmFS onRuntimeInitialized] Mount result:", success)
      })
    }

    // Call original handler if any
    if (origOnRuntimeInitialized) {
      origOnRuntimeInitialized()
    }
  }
}

// ============================================================================
// Hook: preRun - runs after runtime init, before main()
// ============================================================================
if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.getDirectory) {
  Module["preRun"] = Module["preRun"] || []
  Module["preRun"].push(function () {
    console.log("[WasmFS preRun] Hook called")

    // If mount hasn't been attempted yet, try it now with dependency blocking
    if (!_opfsMountState.attempted) {
      console.log("[WasmFS preRun] Mount not attempted yet, trying now")

      if (typeof Module["addRunDependency"] === "function") {
        Module["addRunDependency"]("opfs-mount-preRun")

        _attemptOPFSMount("preRun").finally(function () {
          console.log("[WasmFS preRun] Removing dependency")
          Module["removeRunDependency"]("opfs-mount-preRun")
        })
      } else {
        // No dependency function, just try async
        _attemptOPFSMount("preRun")
      }
    } else {
      console.log("[WasmFS preRun] Mount already attempted, result:", _opfsMountState.succeeded)
    }

    // Log final state
    console.log("[WasmFS preRun] Mount state:", {
      attempted: _opfsMountState.attempted,
      succeeded: _opfsMountState.succeeded,
      paths: _opfsMountState.mountedPaths,
      errors: _opfsMountState.errors.length,
    })
  })
}

// ============================================================================
// Manual OPFS Mounting Function (for post-init use)
// ============================================================================
Module["mountOPFS"] = async function (mountPoint, opfsPath) {
  if (typeof mountPoint === "undefined") mountPoint = "/opfs"
  if (typeof opfsPath === "undefined") opfsPath = null

  if (!navigator.storage || !navigator.storage.getDirectory) {
    throw new Error("OPFS is not supported in this browser")
  }

  var opfsRoot = await navigator.storage.getDirectory()

  async function mountSingleDir(opfsDir, wasmfsPath) {
    if (typeof Module["wasmfsOPFSGetOrCreateDir"] === "function") {
      var result = await Module["wasmfsOPFSGetOrCreateDir"](opfsDir, wasmfsPath)
      if (result !== 0 && result !== undefined) {
        throw new Error("wasmfsOPFSGetOrCreateDir returned error: " + result)
      }
      return true
    } else if (Module["FS"] && Module["FS"].filesystems && Module["FS"].filesystems.OPFS) {
      try {
        Module["mkdir"](wasmfsPath)
      } catch (e) {
        if (e.code !== "EEXIST" && e.errno !== 20) throw e
      }
      Module["FS"].mount(Module["FS"].filesystems.OPFS, { root: opfsDir }, wasmfsPath)
      return true
    }
    return false
  }

  // If mounting at root, mount each top-level OPFS directory
  if (mountPoint === "/" && (opfsPath === null || opfsPath === "/" || opfsPath === "")) {
    var mounted = []
    for await (var entry of opfsRoot.entries()) {
      var name = entry[0]
      var handle = entry[1]
      if (handle.kind === "directory") {
        var wasmfsPath = "/" + name
        try {
          try {
            Module["FS"].stat(wasmfsPath)
            console.log("[WasmFS] Skipping existing directory:", wasmfsPath)
            continue
          } catch (e) {
            // Directory doesn't exist, we can mount
          }
          await mountSingleDir(handle, wasmfsPath)
          mounted.push(wasmfsPath)
          console.log("[WasmFS] Mounted OPFS", name, "at", wasmfsPath)
        } catch (e) {
          console.warn("[WasmFS] Failed to mount", name, ":", e.message)
        }
      }
    }
    console.log("[WasmFS] OPFS mounted directories:", mounted)
    return mounted.length > 0 ? "/" : null
  }

  // Get specific OPFS subdirectory if path specified
  var opfsDir = opfsRoot
  if (opfsPath && opfsPath !== "/" && opfsPath !== "") {
    var parts = opfsPath.split("/").filter(Boolean)
    for (var j = 0; j < parts.length; j++) {
      opfsDir = await opfsDir.getDirectoryHandle(parts[j], { create: true })
    }
  }

  var success = await mountSingleDir(opfsDir, mountPoint)
  if (!success) {
    throw new Error("WasmFS OPFS backend not available")
  }

  console.log(
    "[WasmFS] OPFS mounted at",
    mountPoint,
    opfsPath ? "(OPFS path: " + opfsPath + ")" : "",
  )
  return mountPoint
}

// ============================================================================
// File watching support via polling
// ============================================================================
Module["watchFiles"] = function (paths, callback, intervalMs) {
  if (typeof intervalMs === "undefined") intervalMs = 100
  var mtimes = new Map()

  for (var i = 0; i < paths.length; i++) {
    try {
      var stat = Module["FS"].stat(paths[i])
      mtimes.set(paths[i], stat.mtime.getTime())
    } catch (e) {
      mtimes.set(paths[i], 0)
    }
  }

  var intervalId = setInterval(function () {
    for (var i = 0; i < paths.length; i++) {
      var path = paths[i]
      try {
        var stat = Module["FS"].stat(path)
        var newMtime = stat.mtime.getTime()
        var oldMtime = mtimes.get(path)

        if (newMtime !== oldMtime) {
          mtimes.set(path, newMtime)
          if (oldMtime !== 0) {
            callback(path, "change")
          }
        }
      } catch (e) {
        var oldMtime = mtimes.get(path)
        if (oldMtime !== 0) {
          mtimes.set(path, 0)
          callback(path, "delete")
        }
      }
    }
  }, intervalMs)

  return {
    close: function () {
      clearInterval(intervalId)
    },
    addPath: function (path) {
      if (paths.indexOf(path) === -1) {
        paths.push(path)
        try {
          var stat = Module["FS"].stat(path)
          mtimes.set(path, stat.mtime.getTime())
        } catch (e) {
          mtimes.set(path, 0)
        }
      }
    },
    removePath: function (path) {
      var idx = paths.indexOf(path)
      if (idx !== -1) {
        paths.splice(idx, 1)
        mtimes.delete(path)
      }
    },
  }
}

Module["watchDirectory"] = function (dirPath, callback, intervalMs) {
  if (typeof intervalMs === "undefined") intervalMs = 100
  var watchedFiles = new Map()

  function scanDirectory(path) {
    var files = []
    try {
      var entries = Module["readdir"](path)
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i]
        if (entry === "." || entry === "..") continue
        var fullPath = path + "/" + entry
        try {
          var stat = Module["FS"].stat(fullPath)
          if (stat.isDirectory()) {
            var subFiles = scanDirectory(fullPath)
            for (var j = 0; j < subFiles.length; j++) {
              files.push(subFiles[j])
            }
          } else {
            files.push({ path: fullPath, mtime: stat.mtime.getTime() })
          }
        } catch (e) {
          // Skip inaccessible files
        }
      }
    } catch (e) {
      // Directory doesn't exist
    }
    return files
  }

  var initialFiles = scanDirectory(dirPath)
  for (var i = 0; i < initialFiles.length; i++) {
    watchedFiles.set(initialFiles[i].path, initialFiles[i].mtime)
  }

  var intervalId = setInterval(function () {
    var currentFiles = scanDirectory(dirPath)
    var currentPaths = new Set()

    for (var i = 0; i < currentFiles.length; i++) {
      var file = currentFiles[i]
      currentPaths.add(file.path)
      var oldMtime = watchedFiles.get(file.path)

      if (oldMtime === undefined) {
        watchedFiles.set(file.path, file.mtime)
        callback(file.path, "add")
      } else if (file.mtime !== oldMtime) {
        watchedFiles.set(file.path, file.mtime)
        callback(file.path, "change")
      }
    }

    watchedFiles.forEach(function (mtime, path) {
      if (!currentPaths.has(path)) {
        watchedFiles.delete(path)
        callback(path, "delete")
      }
    })
  }, intervalMs)

  return {
    close: function () {
      clearInterval(intervalId)
    },
  }
}

// ============================================================================
// FS Wrapper Functions (stable API that handles potential minification)
// ============================================================================
Module["readFile"] = function (path) {
  return Module["FS"].readFile(path)
}

Module["readFileString"] = function (path) {
  var data = Module["FS"].readFile(path)
  return new TextDecoder().decode(data)
}

Module["writeFile"] = function (path, data) {
  Module["FS"].writeFile(path, data)
}

Module["writeFileString"] = function (path, content) {
  var data = new TextEncoder().encode(content)
  Module["FS"].writeFile(path, data)
}

Module["readdir"] = function (path) {
  return Module["FS"].readdir(path)
}

Module["stat"] = function (path) {
  return Module["FS"].stat(path)
}

Module["mkdir"] = function (path) {
  return Module["FS"].mkdir(path)
}

Module["unlink"] = function (path) {
  return Module["FS"].unlink(path)
}

Module["rmdir"] = function (path) {
  return Module["FS"].rmdir(path)
}

Module["rename"] = function (oldPath, newPath) {
  return Module["FS"].rename(oldPath, newPath)
}

Module["exists"] = function (path) {
  try {
    Module["FS"].stat(path)
    return true
  } catch (e) {
    return false
  }
}

Module["syncOPFS"] = async function () {
  var FS = Module["FS"]
  if (FS && typeof FS.syncfs === "function") {
    return new Promise(function (resolve, reject) {
      FS.syncfs(false, function (err) {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

// Export guard
Module["__wasmfs_exports__"] = {
  mountOPFS: Module["mountOPFS"],
  readFile: Module["readFile"],
  readFileString: Module["readFileString"],
  writeFile: Module["writeFile"],
  writeFileString: Module["writeFileString"],
  readdir: Module["readdir"],
  stat: Module["stat"],
  mkdir: Module["mkdir"],
  unlink: Module["unlink"],
  rmdir: Module["rmdir"],
  rename: Module["rename"],
  exists: Module["exists"],
  syncOPFS: Module["syncOPFS"],
  watchFiles: Module["watchFiles"],
  watchDirectory: Module["watchDirectory"],
}
