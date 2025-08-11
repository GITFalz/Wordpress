import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';
import tailwind from '@astrojs/tailwind';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [react(), tailwind()],
  output: 'server',

  adapter: node({
    mode: 'standalone',  // or 'server'
  }),

  vite: {
    plugins: [tailwindcss()],
  },
});