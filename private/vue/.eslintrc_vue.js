// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2017,
    sourceType: 'module',
  },
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'prettier',
    'plugin:vue/recommended', // or 'plugin:vue/base'
  ],
  plugins: [
    'prettier', 'vue'
  ],
  // add your custom rules here
  rules: {
    'no-console': 'off',
    'comma-dangle': ['warn', 'only-multiline'],
    'no-var': 'warn',

    'prettier/prettier': ['warn', {
      'trailingComma': 'es5',
      'singleQuote': true,
      'semi': false,
    }],

    'vue/no-side-effects-in-computed-properties': 'off',

    'vue/max-attributes-per-line': [
      2,
      {
        singleline: 5,
        multiline: {
          max: 3,
          allowFirstLine: true,
        },
      },
    ],
  },
  globals: {
    'server': true,
  }
}
