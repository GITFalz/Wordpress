import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [react(), tailwind()],
  output: 'server',

  adapter: node({
    mode: 'standalone',
  }),

  vite: {
    build: {
      assetsInlineLimit: 0, // Prevent CSS inlining
    }
  },
  
  build: {
    inlineStylesheets: 'never',  // Never inline stylesheets
    assets: 'assets'
  }
});