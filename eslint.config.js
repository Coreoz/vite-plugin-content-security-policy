import tseslint from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import sayari from '@sayari/eslint-plugin';
import airbnbBase from 'eslint-config-airbnb-base';
import importPlugin from 'eslint-plugin-import';
import airbnbTs from 'eslint-config-airbnb-typescript';
import stylistic from '@stylistic/eslint-plugin'
import compat from 'eslint-plugin-compat';

/** @type {import('eslint').Linter.Config[]} */
export default [
  react.configs.flat.recommended,
  compat.configs["flat/recommended"],
  jsxA11y.flatConfigs.recommended,
  stylistic.configs.recommended,
  {
    ignores: [
      'build/*',
      'public/*',
    ],
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.eslint.json',
      },
    },
    plugins: {
      'airbnb': airbnbBase,
      'airbnb-typescript': airbnbTs,
      '@typescript-eslint': tseslint,
      react,
      'import': importPlugin,
      '@stylistic': stylistic,
      'react-hooks': reactHooks,
      '@sayari': sayari,
    },
    settings: {
      react: {
        version: 'detect',
      },
      polyfills: [
        'AbortController',
        'PromiseConstructor.allSettled',
        'Promise.catch',
        'Promise.then',
        'Promise.finally',
        'PromiseConstructor.resolve',
        'String.startsWith',
        'Array.includes',
        'ArrayConstructor.from',
        'ObjectConstructor.values',
        'Map.values',
        'Map.keys',
      ],
    },
    rules: {
      '@stylistic/max-len': ['error', {'code': 240}],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/indent': ['error', 2, {'offsetTernaryExpressions': false}],
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/brace-style': ['error', '1tbs', {'allowSingleLine': false}],
      '@stylistic/function-paren-newline': 'off',
      '@stylistic/multiline-ternary': ['error', 'always-multiline'],
      '@stylistic/jsx-wrap-multilines': ['error', {'prop': 'ignore'}],
      'no-continue': 'error',
      'react/require-default-props': 0,
      'import/prefer-default-export': 2,
      'import/no-absolute-path': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ForInStatement',
          message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
        },
        {
          selector: 'LabeledStatement',
          message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
        },
        {
          selector: 'WithStatement',
          message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
        },
      ],
      // Forbid @ts-ignore statements
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      // Forbid any usage
      '@typescript-eslint/no-explicit-any': 2,
      // Allow defining using functions before their declaration
      '@typescript-eslint/no-use-before-define': ['error', {
        'functions': false,
      }],
      // Uniformize TS type members delimiter (comma instead of semicolon)
      '@stylistic/member-delimiter-style': ['error', {
        'multiline': {
          'delimiter': 'comma',
          'requireLast': true,
        },
        'singleline': {
          'delimiter': 'comma',
          'requireLast': false,
        },
      }],
      // Force explicit type definition
      '@typescript-eslint/typedef': [
        'error',
        {
          'arrayDestructuring': false,
          'arrowParameter': true,
          'memberVariableDeclaration': true,
          'parameter': true,
          'propertyDeclaration': true,
          'objectDestructuring': false,
          'variableDeclaration': true,
          'variableDeclarationIgnoreFunction': true,
        },
      ],
      'react-hooks/rules-of-hooks': 'error',
      '@stylistic/linebreak-style': 'off',
      // Add all your custom hooks which have dependencies in the additional hooks
      // If you have several hooks, here is the syntax 'additionalHooks': '(hook1|hook2)'
      'react-hooks/exhaustive-deps': ['warn', {'additionalHooks': 'useOnDependenciesChange|useEffectWithSsrSupport|useObservableLoader'}],
      'no-restricted-imports': [
        'error',
        {
          'patterns': [
            {
              'group': ['/**/**.module.scss', '!./**.module.scss'],
              'message': 'SCSS modules can not be imported from outside of its component folder.',
            },
            {
              'group': ['clsx'],
              'message': 'Please use the classNames function in lib folder',
            },
          ],
        },
      ],
      'react/react-in-jsx-scope': 0
    },
  },
];
