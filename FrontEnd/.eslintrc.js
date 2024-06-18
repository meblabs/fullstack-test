module.exports = {
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  plugins: ['react', 'react-hooks', 'prettier'],
  extends: ['eslint:recommended', 'airbnb', 'plugin:react/recommended', 'plugin:jsx-a11y/recommended', 'prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto'
      }
    ],
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': [
      1,
      {
        extensions: ['.js', '.jsx']
      }
    ],
    'react/destructuring-assignment': ['off'],
    'react/jsx-props-no-spreading': ['off'],
    'react/prop-types': ['off'],
    'no-useless-catch': ['off'],
    'no-unused-vars': [
      'warn',
      {
        vars: 'all',
        args: 'none',
        ignoreRestSiblings: true
      }
    ],
    'prefer-template': ['off'],
    'no-underscore-dangle': ['off'],
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function'
      }
    ]
  }
};
