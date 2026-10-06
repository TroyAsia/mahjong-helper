import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

const noReact = [
  { name: 'react', message: 'This layer must not import React.' },
  { name: 'react-dom', message: 'This layer must not import React.' },
]

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },

  // engine: pure — no React, no other project layers
  {
    files: ['src/engine/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: noReact,
          patterns: [
            {
              group: [
                '**/ai',
                '**/ai/**',
                '**/coach',
                '**/coach/**',
                '**/app',
                '**/app/**',
                '**/ui',
                '**/ui/**',
                '**/levels',
                '**/levels/**',
                '**/content',
                '**/content/**',
              ],
              message: 'engine must not import other project layers',
            },
          ],
        },
      ],
    },
  },

  // ai: engine + levels/schema types only
  {
    files: ['src/ai/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: noReact,
          patterns: [
            {
              group: [
                '**/coach',
                '**/coach/**',
                '**/app',
                '**/app/**',
                '**/ui',
                '**/ui/**',
                '**/content',
                '**/content/**',
              ],
              message: 'ai may import engine and levels/schema only',
            },
            {
              group: ['**/levels', '**/levels/**'],
              allowTypeImports: true,
              message:
                'ai may only type-import from levels (prefer levels/schema)',
            },
          ],
        },
      ],
    },
  },

  // coach: engine + levels/schema types only
  {
    files: ['src/coach/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: noReact,
          patterns: [
            {
              group: [
                '**/ai',
                '**/ai/**',
                '**/app',
                '**/app/**',
                '**/ui',
                '**/ui/**',
                '**/content',
                '**/content/**',
              ],
              message: 'coach may import engine and levels/schema only',
            },
            {
              group: ['**/levels', '**/levels/**'],
              allowTypeImports: true,
              message:
                'coach may only type-import from levels (prefer levels/schema)',
            },
          ],
        },
      ],
    },
  },

  // levels: Zod only (no other project layers)
  {
    files: ['src/levels/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: noReact,
          patterns: [
            {
              group: [
                '**/engine',
                '**/engine/**',
                '**/ai',
                '**/ai/**',
                '**/coach',
                '**/coach/**',
                '**/app',
                '**/app/**',
                '**/ui',
                '**/ui/**',
                '**/content',
                '**/content/**',
              ],
              message: 'levels may import Zod only',
            },
          ],
        },
      ],
    },
  },

  // ui: app + content only — never engine/ai/coach directly
  {
    files: ['src/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/engine',
                '**/engine/**',
                '**/ai',
                '**/ai/**',
                '**/coach',
                '**/coach/**',
                '**/levels',
                '**/levels/**',
              ],
              message: 'ui may import app and content only',
            },
          ],
        },
      ],
    },
  },
)
