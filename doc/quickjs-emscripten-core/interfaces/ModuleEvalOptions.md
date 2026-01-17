[**quickjs-emscripten**](../../README.md)

***

[quickjs-emscripten](../../packages.md) / [quickjs-emscripten-core](../README.md) / ModuleEvalOptions

# Interface: ModuleEvalOptions

Defined in: [packages/quickjs-emscripten-core/src/module.ts:66](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/module.ts#L66)

Options for [QuickJSWASMModule#evalCode](../classes/QuickJSWASMModule.md#evalcode).

## Properties

### maxStackSizeBytes?

> `optional` **maxStackSizeBytes**: `number`

Defined in: [packages/quickjs-emscripten-core/src/module.ts:82](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/module.ts#L82)

Stack size limit for this vm, in bytes
To remove the limit, set to `0`.

***

### memoryLimitBytes?

> `optional` **memoryLimitBytes**: `number`

Defined in: [packages/quickjs-emscripten-core/src/module.ts:76](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/module.ts#L76)

Memory limit, in bytes, of WebAssembly heap memory used by the QuickJS VM.

***

### moduleLoader?

> `optional` **moduleLoader**: [`JSModuleLoader`](JSModuleLoader.md)

Defined in: [packages/quickjs-emscripten-core/src/module.ts:87](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/module.ts#L87)

Module loader for any `import` statements or expressions.

***

### shouldInterrupt?

> `optional` **shouldInterrupt**: [`InterruptHandler`](../README.md#interrupthandler)

Defined in: [packages/quickjs-emscripten-core/src/module.ts:71](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/module.ts#L71)

Interrupt evaluation if `shouldInterrupt` returns `true`.
See [shouldInterruptAfterDeadline](../README.md#shouldinterruptafterdeadline).
