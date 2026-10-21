import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const repository = process.env.ARDESIA_REPO_ROOT;
if (!repository) throw new Error('ARDESIA_REPO_ROOT is required');
const dependency = (path: string) => fileURLToPath(new URL(`./node_modules/${path}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@ardesia-exam-under-test', replacement: resolve(repository, 'apps/web/src/features/Exam.tsx') },
      { find: /^react$/, replacement: dependency('react/index.js') },
      { find: /^react\/jsx-runtime$/, replacement: dependency('react/jsx-runtime.js') },
      { find: /^react\/jsx-dev-runtime$/, replacement: dependency('react/jsx-dev-runtime.js') },
      { find: /^react-dom$/, replacement: dependency('react-dom/index.js') },
    ],
  },
  test: { environment: 'jsdom', include: ['ui-race.test.tsx'], testTimeout: 15000 },
});
