// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

import sanity from '@sanity/astro';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: 'https://rockyconcreteinc.com',
  output: 'server',
  adapter: netlify(),

  // Self-host Inter + Bebas Neue from Google: downloaded at build, served from our
  // own domain, preloaded, with auto metric-matched fallbacks. Replaces the
  // render-blocking Google Fonts <link> and removes the FOUT/flash.
  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: 'Inter',
        cssVariable: '--font-inter',
        weights: [300, 400, 500, 600, 700],
        styles: ['normal'], // site uses no italics — don't download them
      },
      {
        provider: fontProviders.google(),
        name: 'Bebas Neue',
        cssVariable: '--font-bebas',
        weights: [400],
        styles: ['normal'],
      },
    ],
  },

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['sanity', '@sanity/orderable-document-list']
    },
    optimizeDeps: {
      include: ['@sanity/orderable-document-list > lodash/**', '@sanity/orderable-document-list']
    }
  },

  integrations: [
    sitemap(),
    sanity({
      projectId: '7pjigdmm',
      dataset: 'production',
      useCdn: false,
      studioBasePath: '/admin',
    }),
    react()
  ]
});