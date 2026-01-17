[**quickjs-emscripten**](../../../README.md)

***

[quickjs-emscripten](../../../packages.md) / [@componentor/quickjs-emscripten](../README.md) / ContextEvalOptions

# Interface: ContextEvalOptions

Defined in: [packages/quickjs-emscripten-core/src/types.ts:252](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/types.ts#L252)

## Properties

### backtraceBarrier?

> `optional` **backtraceBarrier**: `boolean`

Defined in: [packages/quickjs-emscripten-core/src/types.ts:271](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/types.ts#L271)

don't include the stack frames before this eval in the Error() backtraces

***

### compileOnly?

> `optional` **compileOnly**: `boolean`

Defined in: [packages/quickjs-emscripten-core/src/types.ts:269](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/types.ts#L269)

compile but do not run. The result is an object with a
JS_TAG_FUNCTION_BYTECODE or JS_TAG_MODULE tag. It can be executed
with JS_EvalFunction().

***

### strict?

> `optional` **strict**: `boolean`

Defined in: [packages/quickjs-emscripten-core/src/types.ts:261](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/types.ts#L261)

Force "strict" mode

***

### strip?

> `optional` **strip**: `boolean`

Defined in: [packages/quickjs-emscripten-core/src/types.ts:263](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/types.ts#L263)

Force "strip" mode

***

### type?

> `optional` **type**: `"global"` \| `"module"`

Defined in: [packages/quickjs-emscripten-core/src/types.ts:259](https://github.com/componentor/quickjs-emscripten/blob/main/packages/quickjs-emscripten-core/src/types.ts#L259)

Global code (default), or "module" code?

- When type is `"global"`, the code is evaluated in the global scope of the QuickJSContext, and the return value is the result of the last expression.
- When type is `"module"`, the code is evaluated is a module scope, may use `import`, `export`, and top-level `await`. The return value is the module's exports, or a promise for the module's exports.
