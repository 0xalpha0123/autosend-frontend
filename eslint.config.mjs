/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
  ],
  plugins: [],
  rules: {
    // Disable all TypeScript rules
    '@typescript-eslint/*': 'off'
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        // You can also add any specific rules for TypeScript files here if needed
      }
    }
  ]
};
