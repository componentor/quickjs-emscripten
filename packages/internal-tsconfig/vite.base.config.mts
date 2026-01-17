import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  // Incantation needed for vite to not barf on "using" statement
  esbuild: {
    target: "es2020",
  },
  plugins: [tsconfigPaths()],
  test: {
    include: ["src/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    onStackTrace(_error, _frame) {
      return true
    },
  },
})
