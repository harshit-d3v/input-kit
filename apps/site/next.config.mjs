import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Demos and package sources live outside apps/site, so Next has to be told it
  // may compile TypeScript from elsewhere in the workspace.
  experimental: {
    externalDir: true,
  },

  // Vercel needs the monorepo root for file tracing, not just this app.
  outputFileTracingRoot: join(here, '../../'),

  typescript: {
    // Strict on purpose. This build compiles all 41 packages' demo files as well as
    // the site, so a type error anywhere in the workspace fails the deploy rather
    // than shipping a demo that does not match its package's API.
    ignoreBuildErrors: false,
  },

  webpack: (config) => {
    // The packages write ESM-style specifiers — `import './useCombobox.js'`
    // pointing at useCombobox.tsx. tsup and vitest resolve that; webpack needs
    // to be told the mapping explicitly.
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.tsx', '.js'],
      '.jsx': ['.tsx', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    };
    return config;
  },
};

export default nextConfig;
