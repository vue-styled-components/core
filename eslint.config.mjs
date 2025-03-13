import antfu from '@antfu/eslint-config'

export default antfu(
  {
    markdown: false,
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
    ],
  },
  {
    files: ['packages/plugins/typescript-syntax/**/*.ts'],
    rules: {
      'no-unused-vars': 'off',
      'no-cond-assign': 'warn',
      'no-console': 'warn',
      'unused-imports/no-unused-vars': 'warn',
      'regexp/no-unused-capturing-group': 'warn',
      'style/max-statements-per-line': 'warn',
      'regexp/no-super-linear-backtracking': 'warn',
      'unicorn/prefer-number-properties': 'warn',
      'style/no-mixed-operators': 'warn',
      'no-case-declarations': 'warn',
    },
  },
)
