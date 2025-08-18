import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js';

export default mergeConfig(viteConfig, defineConfig({
  test: {
    dir: 'src',
    environment: "node",
    globals: true, // Ensure globals like 'expect' are available
  },
}))
