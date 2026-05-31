import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import solidSvg from 'vite-plugin-solid-svg';
import wasm from 'vite-plugin-wasm';
import path from 'path';

export default defineConfig({
  base: '',
  plugins: [
    // devtools(),
    wasm(),
    solidPlugin(),
    solidSvg({
      defaultAsComponent: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: { external: ['sharp'] },
  },
});
