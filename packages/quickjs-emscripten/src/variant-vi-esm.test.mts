import { describe, it } from "vitest"
import { testSuite } from "./variant-test-suite.js"
import * as quickjsEmscripten from "./index.js"

describe("variants (vi esm 2)", () => {
  testSuite({ describe, it }, {}, quickjsEmscripten)
})
