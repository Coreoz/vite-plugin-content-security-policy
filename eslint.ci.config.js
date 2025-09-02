import baseConfig from './eslint.config.js';

export default [
  ...baseConfig,
  {
    rules: {
      'no-debugger': 'error',
      'no-console': 'error',
    }
  },
];
