import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    // React Bits visual sources are imported as vendor-style components and are
    // maintained independently from ClubHub's application code.
    'src/components/AeroShards/**',
    'src/components/GlassSurface/**',
    'src/components/SpecularButton/**',
    'src/components/TextType/**',
  ]),
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
    rules: {
      // Async request functions update state after the request resolves; this
      // rule cannot distinguish that pattern from a synchronous effect update.
      'react-hooks/set-state-in-effect': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
])
