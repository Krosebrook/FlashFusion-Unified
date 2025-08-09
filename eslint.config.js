import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      // Merge browser and Node.js globals so both client- and server-side code pass linting
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Allow intentional unused vars via warning and ignore pattern
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
      // Disable case declaration rule as switch statements often declare scoped lets
      'no-case-declarations': 'off',
      // Allow Object.prototype access pattern
      'no-prototype-builtins': 'off',
    },
  },
])
