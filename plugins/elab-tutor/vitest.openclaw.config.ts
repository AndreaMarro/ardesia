import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['scripts/openclaw/**/*.test.ts'],
    environment: 'node',
    globals: true,
  },
});
