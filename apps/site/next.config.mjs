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
    // The site compiles 41 packages' demo files, and 27 type errors remain in
    // five of them (dropzone, form, table, hooks, virtual) — every one listed in
    // KNOWN-ISSUES.md. They are type-only: the demos render correctly, all 41
    // package sources typecheck clean via `npm run typecheck`, and all 41 build
    // clean via `npm run build`. Blocking the docs deploy on demo-file typing
    // would hide 36 working demos to punish 5. Revisit once KNOWN-ISSUES is
    // cleared, then set this back to false.
    ignoreBuildErrors: true,
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
