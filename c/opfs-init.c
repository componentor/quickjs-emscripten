/**
 * OPFS Initialization for WasmFS
 *
 * This file provides early initialization hooks for mounting OPFS directories
 * during Emscripten runtime initialization, before preRun is called.
 *
 * The __attribute__((constructor)) function runs during __wasm_call_ctors,
 * which is part of the Emscripten runtime initialization phase.
 */

#ifdef QTS_WASMFS

#include <emscripten.h>
#include <stdio.h>

/**
 * This constructor runs early during module initialization.
 * We use it to signal that OPFS mounting should happen.
 *
 * Note: We can't directly call wasmfsOPFSGetOrCreateDir here because
 * it's an async JS function. Instead, we set a flag that the JS code
 * can check to know that initialization is in progress.
 */
__attribute__((constructor(101)))  // Priority 101 to run early
void qts_opfs_early_init(void) {
    // Signal to JS that we're in the early init phase
    // This allows pre-js code to potentially hook in at the right time
    EM_ASM({
        if (typeof Module !== 'undefined') {
            Module._qtsEarlyInitCalled = true;
            console.log("[WasmFS C init] Early init called, Module exists");

            // Check if OPFS mounting functions are available yet
            if (typeof Module.wasmfsOPFSGetOrCreateDir === 'function') {
                console.log("[WasmFS C init] wasmfsOPFSGetOrCreateDir is available!");
                Module._opfsFunctionsAvailable = true;
            } else {
                console.log("[WasmFS C init] wasmfsOPFSGetOrCreateDir NOT available yet");
            }
        } else {
            console.log("[WasmFS C init] Module not defined yet");
        }
    });
}

/**
 * Another constructor with lower priority to check state later in init
 */
__attribute__((constructor(999)))  // Priority 999 to run later
void qts_opfs_late_init(void) {
    EM_ASM({
        if (typeof Module !== 'undefined') {
            Module._qtsLateInitCalled = true;
            console.log("[WasmFS C init] Late init called");

            // Check again if OPFS mounting functions are available
            if (typeof Module.wasmfsOPFSGetOrCreateDir === 'function') {
                console.log("[WasmFS C init] wasmfsOPFSGetOrCreateDir is NOW available!");
                Module._opfsFunctionsAvailable = true;
            } else {
                console.log("[WasmFS C init] wasmfsOPFSGetOrCreateDir still NOT available");
            }
        }
    });
}

#endif /* QTS_WASMFS */
