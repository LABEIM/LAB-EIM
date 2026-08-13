import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import keystatic from '@keystatic/astro';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: process.env.CF_PAGES_URL
    ? process.env.CF_PAGES_URL.startsWith('http') ? process.env.CF_PAGES_URL : `https://${process.env.CF_PAGES_URL}`
    : process.env.PUBLIC_SITE_URL
      ? process.env.PUBLIC_SITE_URL.startsWith('http') ? process.env.PUBLIC_SITE_URL : `https://${process.env.PUBLIC_SITE_URL}`
      : process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:4321',
  adapter: cloudflare({
    imageService: 'compile',
    entrypointResolution: 'auto',
  }),
  integrations: [react(), keystatic()],
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    ssr: {
      external: ['sharp', 'detect-libc'],
    },
    build: {
      chunkSizeWarningLimit: 1000,
    },
  },
});


