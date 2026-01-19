/**
 * Closure Compiler Externs for WasmFS
 *
 * This file tells the closure compiler to NOT minify these property names.
 * These are the Emscripten filesystem API methods that we need to access
 * from JavaScript.
 *
 * Note: We don't declare 'var FS' here because Emscripten already defines it.
 * We only need to preserve the property names.
 */

/** @externs */

// Preserve FS method names on any object
Object.prototype.readdir
Object.prototype.readFile
Object.prototype.writeFile
Object.prototype.mkdir
Object.prototype.rmdir
Object.prototype.unlink
Object.prototype.rename
Object.prototype.stat
Object.prototype.open
Object.prototype.close
Object.prototype.read
Object.prototype.write
Object.prototype.truncate
Object.prototype.create
Object.prototype.syncfs
Object.prototype.mount
Object.prototype.filesystems
