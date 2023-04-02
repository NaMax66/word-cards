/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  'env': {
    'node': true
  },
  root: true,
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    quotes: ['warn', 'single'],
    semi: ['warn', 'never'],
    'object-curly-spacing': ['warn', 'always']
  }
}
