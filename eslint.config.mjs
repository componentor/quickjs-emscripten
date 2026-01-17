import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import importX from "eslint-plugin-import-x"
import globals from "globals"

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      "ts/generated/**",
      "quickjs/**",
      ".pnpm/**",
      "doc/**",
      "json-generator-dot-com-1024-rows.json",
      "**/dist/**",
      "**/.output/**",
      "examples/imports/**",
      "examples/create-react-app/**",
      "examples/node-typescript/*.js",
      "examples/vite-vue/**",
      "build/**",
      "emsdk-cache/**",
      "packages/internal-tsconfig/*.d.*ts",
      "packages/internal-tsconfig/*.*js",
      "packages/variant-*/src/ffi.ts",
      "packages/quickjs-ffi-types/src/ffi*.ts",
      "typedoc.js",
      "typedoc.base.js",
      "vendor/**",
      "templates/**",
      // Ignore all variant package dist folders
      "packages/variant-*/**",
      // QuickJS-for-QuickJS examples use special globals injected by host
      "packages/quickjs-for-quickjs/example/**",
    ],
  },

  // Base recommended configs
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // Browser/Node example files configuration
  {
    files: ["examples/**/*.mjs", "examples/**/*.js", "examples/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // Node.js files configuration (scripts, typedoc configs, etc.)
  {
    files: ["scripts/**/*.ts", "packages/**/typedoc.js", "packages/**/*.mjs"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // CTS files that use require()
  {
    files: ["**/*.cts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  // Import plugin config and custom rules
  {
    plugins: {
      "import-x": importX,
    },
    rules: {
      // Disables
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "no-extra-semi": "off", // covered by prettier
      "no-empty": "off",

      // Enables
      "@typescript-eslint/consistent-type-imports": "error",
      "import-x/order": "error",
      "import-x/no-duplicates": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
)
