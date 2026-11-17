import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

export default defineConfig({
  output: 'static',
  i18n: {
    defaultLocale: 'pt-br',
    locales: ['pt-br', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [react(), icon()],
  vite: {
    plugins: [tailwindcss()],
  },
});
