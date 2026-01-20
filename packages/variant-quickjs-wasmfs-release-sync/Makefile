# WasmFS Variant - QuickJS with native filesystem via WasmFS OPFS backend
# This variant enables filesystem operations directly in Wasm without JS boundary crossing

# Tools
EMSDK_VERSION=3.1.65
EMSDK_DOCKER_IMAGE=emscripten/emsdk:3.1.65
EMCC_SRC=../../scripts/emcc.sh
EMCC=EMSDK_VERSION=$(EMSDK_VERSION) EMSDK_DOCKER_IMAGE=$(EMSDK_DOCKER_IMAGE) EMSDK_PROJECT_ROOT=$(REPO_ROOT) EMSDK_DOCKER_CACHE=$(REPO_ROOT)/emsdk-cache/$(EMSDK_VERSION) $(EMCC_SRC)
GENERATE_TS=$(GENERATE_TS_ENV) ../../scripts/generate.ts
THIS_DIR := $(dir $(abspath $(firstword $(MAKEFILE_LIST))))
REPO_ROOT := $(abspath $(THIS_DIR)/../..)

QUICKJS_LIB=quickjs

# Paths
QUICKJS_ROOT=../../vendor/$(QUICKJS_LIB)
WRAPPER_ROOT=../../c
TEMPLATES=../../templates
# Intermediate build files
BUILD_ROOT=build
BUILD_WRAPPER=$(BUILD_ROOT)/wrapper
BUILD_QUICKJS=$(BUILD_ROOT)/quickjs
# Distributed to users
DIST=dist

# QuickJS
QUICKJS_OBJS=quickjs.o libregexp.o libunicode.o cutils.o quickjs-libc.o libbf.o
ifeq ($(QUICKJS_LIB),quickjs-ng)
	QUICKJS_DEFINES:=-D_GNU_SOURCE
	CFLAGS_WASM+=-DQTS_USE_QUICKJS_NG
else
	QUICKJS_CONFIG_VERSION=$(shell cat $(QUICKJS_ROOT)/VERSION)
	QUICKJS_DEFINES:=-D_GNU_SOURCE -DCONFIG_VERSION=\"$(QUICKJS_CONFIG_VERSION)\" -DCONFIG_STACK_CHECK -DCONFIG_BIGNUM
	CFLAGS_WASM+=-DCONFIG_BIGNUM
endif
VARIANT_QUICKJS_OBJS=$(patsubst %.o, $(BUILD_QUICKJS)/%.o, $(QUICKJS_OBJS))

# quickjs-emscripten
WRAPPER_DEFINES+=-Wcast-function-type   # Likewise, warns about some quickjs casts we don't control.
WRAPPER_DEFINES+=-DQTS_WASMFS=1         # Enable WasmFS-specific code paths
EMCC_EXPORTED_FUNCS+=-s EXPORTED_FUNCTIONS=@$(BUILD_WRAPPER)/symbols.json
EMCC_EXPORTED_FUNCS_ASYNCIFY+=-s EXPORTED_FUNCTIONS=@$(BUILD_WRAPPER)/symbols.asyncify.json

# OPFS initialization object (for early OPFS setup during runtime init)
OPFS_INIT_OBJ=$(BUILD_WRAPPER)/opfs-init.o

# Emscripten options - base
CFLAGS_WASM+=-s EXPORTED_RUNTIME_METHODS=@../../exportedRuntimeMethods.wasmfs.json
CFLAGS_WASM+=-s MODULARIZE=1
CFLAGS_WASM+=-s IMPORTED_MEMORY=1
CFLAGS_WASM+=-s EXPORT_NAME=QuickJSRaw
CFLAGS_WASM+=-s INVOKE_RUN=0
CFLAGS_WASM+=-s ALLOW_MEMORY_GROWTH=1
CFLAGS_WASM+=-s ALLOW_TABLE_GROWTH=1
CFLAGS_WASM+=-s STACK_SIZE=5MB

# WasmFS options - THIS IS THE KEY DIFFERENCE
# Instead of -s FILESYSTEM=0, we enable WasmFS
CFLAGS_WASM+=-sWASMFS
CFLAGS_WASM+=-sFORCE_FILESYSTEM
# Enable OPFS backend (FS, PATH, ERRNO_CODES, wasmfsOPFS* are in exportedRuntimeMethods.wasmfs.json)
CFLAGS_WASM+=-lwasmfs.js
CFLAGS_WASM+=-lopfs.js

# Emscripten options - like STRICT
CFLAGS_WASM+=-s IGNORE_MISSING_MAIN=0 --no-entry
CFLAGS_WASM+=-s AUTO_JS_LIBRARIES=0
CFLAGS_WASM+=-s -lccall.js
CFLAGS_WASM+=-s AUTO_NATIVE_LIBRARIES=0
CFLAGS_WASM+=-s AUTO_ARCHIVE_INDEXES=0
CFLAGS_WASM+=-s DEFAULT_TO_CXX=0
# Allow syscalls since WasmFS needs them
CFLAGS_WASM+=-s ALLOW_UNIMPLEMENTED_SYSCALLS=1

# Emscripten options - NodeJS
CFLAGS_WASM+=-s MIN_NODE_VERSION=160000
CFLAGS_WASM+=-s NODEJS_CATCH_EXIT=0

CFLAGS_MJS+=-s EXPORT_ES6=1
CFLAGS_BROWSER+=-s EXPORT_ES6=1

# VARIANT - Use pthreads for WasmFS OPFS backend
# WasmFS + OPFS requires either pthreads or JSPI (ASYNCIFY=2)
# pthreads is the primary tested configuration and more reliable
# See https://github.com/emscripten-core/emscripten/issues/23133
SYNC=SYNC
CFLAGS_WASM_BROWSER=$(CFLAGS_WASM)

# Emscripten options - pthreads (required for WasmFS OPFS backend)
# With pthreads, WasmFS proxies OPFS operations to a dedicated worker thread
CFLAGS_WASM+=-pthread
CFLAGS_WASM+=-sPROXY_TO_PTHREAD
# Pool size for pthread workers (WasmFS OPFS needs at least 1)
CFLAGS_WASM+=-sPTHREAD_POOL_SIZE=2
# SharedArrayBuffer is required for pthreads
CFLAGS_WASM+=-sSHARED_MEMORY=1

# Emscripten options - variant & target specific
CFLAGS_WASM+=-Oz
CFLAGS_WASM+=-flto

# Linker-only flags (closure, pre-js files)
LDFLAGS_WASM+=--closure 1
LDFLAGS_WASM+=--closure-args="--externs=closure-externs.js"
LDFLAGS_WASM+=--pre-js $(TEMPLATES)/pre-extension.js
LDFLAGS_WASM+=--pre-js $(TEMPLATES)/pre-wasmMemory.js
LDFLAGS_WASM+=--pre-js $(TEMPLATES)/pre-wasmfs-opfs.js
CFLAGS_CJS+=-s ENVIRONMENT=node
CFLAGS_MJS+=-s ENVIRONMENT=node
CFLAGS_BROWSER+=-s ENVIRONMENT=web,worker
CFLAGS_CLOUDFLARE+=-s ENVIRONMENT=web

# GENERATE_TS options - variant specific
# Note: No ASYNCIFY - using pthreads for WasmFS OPFS instead


ifdef DEBUG_MAKE
	MKDIRP=@echo "\n=====[["" target: $@, deps: $<, variant: $(VARIANT) ""]]=====" ; mkdir -p $(dir $@)
else
	MKDIRP=@mkdir -p $(dir $@)
	CFLAGS+=-Wunused-command-line-argument=0
endif

###############################################################################
# High-level
all: EXPORTS

clean:
	git clean -fx $(DIST) $(BUILD_ROOT)

###############################################################################
# Emscripten output targets
# Note: Only BROWSER target makes sense for WasmFS with OPFS (browser-only API)
EXPORTS: BROWSER
BROWSER: $(DIST)/emscripten-module.browser.mjs $(DIST)/emscripten-module.browser.d.ts

$(DIST)/emscripten-module.browser.mjs: $(BUILD_WRAPPER)/browser/emscripten-module.js
	$(MKDIRP)
	if [ -e $(basename $<).wasm ] ; then cp -v $(basename $<).wasm* $(dir $@); fi
	cp $< $@

$(DIST)/emscripten-module.browser.d.ts: $(TEMPLATES)/emscripten-module.$(SYNC).d.ts
	$(MKDIRP)
	echo '// Generated from $< - WasmFS variant with OPFS support' > $@
	cat $< >> $@

$(BUILD_WRAPPER)/browser/emscripten-module.js: CFLAGS_WASM+=$(CFLAGS_BROWSER)
$(BUILD_WRAPPER)/browser/emscripten-module.js: $(BUILD_WRAPPER)/interface.o $(OPFS_INIT_OBJ) $(VARIANT_QUICKJS_OBJS) $(WASM_SYMBOLS) | $(EMCC_SRC)
	$(MKDIRP)
	$(EMCC) $(CFLAGS_WASM) $(LDFLAGS_WASM) $(WRAPPER_DEFINES) $(EMCC_EXPORTED_FUNCS) -o $@ $< $(OPFS_INIT_OBJ) $(VARIANT_QUICKJS_OBJS)

###############################################################################
# Emscripten intermediate files
WASM_SYMBOLS=$(BUILD_WRAPPER)/symbols.json $(BUILD_WRAPPER)/asyncify-remove.json $(BUILD_WRAPPER)/asyncify-imports.json

# Generic wrapper object files
$(BUILD_WRAPPER)/%.o: $(WRAPPER_ROOT)/%.c $(WASM_SYMBOLS) | $(EMCC_SRC)
	$(MKDIRP)
	$(EMCC) $(CFLAGS_WASM) $(WRAPPER_DEFINES) -c -o $@ $<

# OPFS init object (needs WRAPPER_DEFINES for QTS_WASMFS define)
$(BUILD_WRAPPER)/opfs-init.o: $(WRAPPER_ROOT)/opfs-init.c | $(EMCC_SRC)
	$(MKDIRP)
	$(EMCC) $(CFLAGS_WASM) $(WRAPPER_DEFINES) -c -o $@ $<

$(BUILD_QUICKJS)/%.o: $(QUICKJS_ROOT)/%.c $(WASM_SYMBOLS) | $(EMCC_SRC)
	$(MKDIRP)
	$(EMCC) $(CFLAGS_WASM) $(QUICKJS_DEFINES) -c -o $@ $<

$(BUILD_WRAPPER)/symbols.json:
	$(MKDIRP)
	$(GENERATE_TS) symbols $@

$(BUILD_WRAPPER)/asyncify-remove.json:
	$(MKDIRP)
	$(GENERATE_TS) sync-symbols $@

$(BUILD_WRAPPER)/asyncify-imports.json:
	$(MKDIRP)
	$(GENERATE_TS) async-callback-symbols $@
