module.exports = {
  env: {
    node: true,
    es6: true,
    'jest/globals': true
  },
  extends: ['eslint:recommended', 'airbnb', 'prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    allowImportExportEverywhere: false,
    codeFrame: false
  },
  plugins: ['prettier', 'jest'],
  rules: {
    'prettier/prettier': ['error'],
    'max-len': ['error', { code: 140, ignoreComments: true }],
    'no-unused-vars': ['warn', { vars: 'all', args: 'none', ignoreRestSiblings: true }],
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'prefer-template': ['off'],
    'no-return-await': ['off'],
    'no-underscore-dangle': ['off'],
    'no-param-reassign': ['off'],
    'func-names': ['error', 'never'],
    radix: ['error', 'as-needed'],
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  }
};
