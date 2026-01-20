/**
 * WasmFS OPFS Integration
 *
 * This pre-js file provides OPFS-related utilities for the QuickJS module.
 * The actual OPFS mounting is handled by C code via wasmfs_before_preload().
 *
 * WasmFS + OPFS requires ASYNCIFY because:
 * - wasmfs_create_opfs_backend() blocks waiting for OPFS worker to spawn
 * - Without ASYNCIFY, this causes deadlock on the main thread
 *
 * The C code in opfs-init.c mounts OPFS at /root automatically during
 * WasmFS startup, before file preloading occurs.
 */

// ============================================================================
// OPFS Mount Verification
// ============================================================================

// Hook to verify OPFS mount status after initialization
if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.getDirectory) {
  var origOnRuntimeInitialized = Module["onRuntimeInitialized"]

  Module["onRuntimeInitialized"] = function () {
    // Check if C code successfully mounted OPFS
    if (Module["_wasmfsOPFSMounted"]) {
      console.log("[WasmFS] OPFS mounted at", Module["_wasmfsOPFSMountPath"] || "/root", "(via C)")
    } else {
      console.log("[WasmFS] OPFS mount status unknown - may have been done by C code")
    }

    // Verify /root exists and is accessible
    try {
      if (typeof Module["FS"] !== "undefined") {
        var stat = Module["FS"].stat("/root")
        console.log("[WasmFS] /root directory exists, mode:", stat.mode)
      }
    } catch (e) {
      console.log("[WasmFS] Note: /root not yet accessible:", e.message)
    }

    // Call original handler if any
    if (origOnRuntimeInitialized) {
      origOnRuntimeInitialized()
    }
  }
}

// ============================================================================
// Manual OPFS Mounting Function (for additional mounts after init)
// ============================================================================
Module["mountOPFS"] = async function (mountPoint, opfsPath) {
  if (typeof mountPoint === "undefined") mountPoint = "/opfs"
  if (typeof opfsPath === "undefined") opfsPath = null

  if (!navigator.storage || !navigator.storage.getDirectory) {
    throw new Error("OPFS is not supported in this browser")
  }

  var opfsRoot = await navigator.storage.getDirectory()

  // Get specific OPFS subdirectory if path specified
  var opfsDir = opfsRoot
  if (opfsPath && opfsPath !== "/" && opfsPath !== "") {
    var parts = opfsPath.split("/").filter(Boolean)
    for (var j = 0; j < parts.length; j++) {
      opfsDir = await opfsDir.getDirectoryHandle(parts[j], { create: true })
    }
  }

  // Use wasmfsOPFSGetOrCreateDir if available (after module init)
  if (typeof Module["wasmfsOPFSGetOrCreateDir"] === "function") {
    var result = await Module["wasmfsOPFSGetOrCreateDir"](opfsDir, mountPoint)
    if (result !== 0 && result !== undefined) {
      throw new Error("wasmfsOPFSGetOrCreateDir returned error: " + result)
    }
  } else {
    throw new Error("wasmfsOPFSGetOrCreateDir not available - module may not be initialized")
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
