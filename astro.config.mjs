// @ts-check
import { defineConfig } from 'astro/config';
import wasm from 'vite-plugin-wasm';

import lit from '@astrojs/lit';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [wasm()]
  },

  integrations: [lit()]
});