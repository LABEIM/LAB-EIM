import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import keystatic from '@keystatic/astro';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL
    ? process.env.PUBLIC_SITE_URL.startsWith('http') ? process.env.PUBLIC_SITE_URL : `https://${process.env.PUBLIC_SITE_URL}`
    : process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:4321',
  // The Cloudflare adapter runs dev in workerd, where Keystatic's local storage
  // cannot read the filesystem. Keep Node for dev; Workers for builds.
  adapter: process.env.NODE_ENV === 'development' ? undefined : cloudflare({
    imageService: 'compile',
    // Prerendering in workerd hangs here on miniflare's Request.cf fetch.
    prerenderEnvironment: 'node',
  }),
  // The site does not use Astro sessions; skip the KV namespace the adapter would auto-provision.
  session: false,
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


