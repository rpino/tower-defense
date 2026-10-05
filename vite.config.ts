import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the static build works from any path (local preview, Vercel).
  base: './',
  build: {
    // Phaser alone is ~1.2 MB minified (≈0.35 MB gzip), well inside NFR-2's 5 MB.
    chunkSizeWarningLimit: 1600,
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
