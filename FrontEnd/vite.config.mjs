/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';

export default ({ mode }) =>
  defineConfig({
    plugins: [react(), eslint()],
    define: {
      'process.env.NODE_ENV': `"${mode}"`
    },
    server: {
      watch: {
        usePolling: true
      },
      host: true,
      strictPort: true,
      port: 80
    }
  });
