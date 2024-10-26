import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import solidSvg from 'vite-plugin-solid-svg';
import wasm from 'vite-plugin-wasm';
export default defineConfig({
  base: '',
  plugins: [
    /* 
    Uncomment the following line to enable solid-devtools.
    For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
    */
    // devtools(),
    wasm(),
    solidPlugin(),
    solidSvg({
      defaultAsComponent: true,
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: { external: ['sharp'] },
  },
});
