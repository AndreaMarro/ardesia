// ============================================
// ELAB Tutor - Configurazione Test Vitest
// © Andrea Marro — 15/02/2026
// ============================================

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            // 2026-05-10 — mock vite-plugin-pwa virtual module for vitest.
            // src/components/common/UpdatePrompt.jsx imports virtual:pwa-register
            // dynamically; vite-plugin-pwa transform doesn't run in vitest, so
            // the alias points to a stub mock returning a no-op registerSW.
            'virtual:pwa-register': path.resolve(__dirname, 'tests/mocks/virtual-pwa-register.js'),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/setup.js'],
        // 18/04/2026: timeout esteso da default 5s a 15s + thread pool
        // limitato per sopportare saturazione Mac (load avg >20) che causa
        // flaky in full suite senza essere regressioni reali. Il test runner
        // di default spawna N worker = CPU core; con Claude.app + altri
        // processi di sistema, la saturazione causa timeout 5s su test che
        // in isolamento passano in <1s. MaxThreads 4 serializza un po' di
        // piu' ma evita la saturazione. Fix osservato: 12056/12056 PASS
        // stabile anche su Mac carico.
        testTimeout: 15000,
        hookTimeout: 15000,
        pool: 'forks',
        poolOptions: {
            forks: {
                maxForks: 4,
                minForks: 2,
            },
        },
        env: {
            VITE_N8N_AUTH_URL: 'https://api.elab-tutor.test/auth',
            VITE_N8N_GDPR_URL: 'https://api.elab-tutor.test/gdpr',
            VITE_AUTH_URL: 'https://api.elab-tutor.test/auth',
        },
        coverage: {
            provider: 'v8',
            // 'json-summary' required by CI coverage-comment workflow
            // (reads ./coverage/coverage-summary.json). Previous set
            // ['text', 'json', 'html'] produced coverage-final.json only,
            // causing ENOENT in actions/github-script step.
            reporter: ['text', 'json', 'json-summary', 'html'],
            thresholds: {
                global: {
                    branches: 60,
                    functions: 60,
                    lines: 60,
                    statements: 60,
                },
            },
            include: [
                'src/services/authService.js',
                'src/utils/crypto.js',
                'src/services/gdprService.js',
                'src/components/simulator/engine/CircuitSolver.js',
                'src/components/simulator/engine/AVRBridge.js',
                'src/components/simulator/engine/PlacementEngine.js',
            ],
        },
        include: ['tests/**/*.{test,spec}.{js,jsx}'],
        exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'tests/e2e', 'tests/persona-sim'],
    },
});
