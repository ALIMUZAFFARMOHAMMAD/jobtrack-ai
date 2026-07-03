import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'extension/lib/vendor']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // Serverless API functions run on Node, not the browser.
    files: ['api/**/*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    // Browser extension: chrome.* APIs, service worker + browser globals.
    files: ['extension/**/*.js'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.webextensions, ...globals.serviceworker },
      sourceType: 'module',
    },
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    // Vitest test files: describe/it/expect globals, plus chrome mock in extension tests.
    files: ['**/*.test.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.vitest, ...globals.browser, chrome: 'writable' },
    },
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
