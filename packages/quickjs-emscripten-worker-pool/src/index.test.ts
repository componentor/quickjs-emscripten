import { describe, it, expect } from "vitest"
import { isMultiThreadingSupported, getDefaultPoolSize } from "./index"

describe("capabilities", () => {
  it("isMultiThreadingSupported returns boolean", () => {
    const result = isMultiThreadingSupported()
    expect(typeof result).toBe("boolean")
  })

  it("getDefaultPoolSize returns a positive number", () => {
    const result = getDefaultPoolSize()
    expect(typeof result).toBe("number")
    expect(result).toBeGreaterThan(0)
  })
})
