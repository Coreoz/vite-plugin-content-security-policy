import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@lib': path.resolve(__dirname, 'src/lib'),
    },
  },
});
