// @ts-check
import { defineConfig } from 'astro/config';
import wasm from 'vite-plugin-wasm';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [wasm()]
  }
});
