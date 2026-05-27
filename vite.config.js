import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// Custom per-chunk obfuscation — preserves code-splitting, skips vendor libs
// Session 42: MAXIMUM obfuscation — RC4 100%, CFG 75%, dead code, selfDefending, domain lock
function obfuscateChunks(obfuscatorOptions = {}) {
    // Vendor chunk names to skip (3rd-party libs don't need obfuscation)
    const SKIP_PATTERNS = [
        'react-vendor', 'mammoth', 'codemirror', 'avr-',
        'html2canvas', 'react-pdf', 'DashboardGestionale',
        'ElabTutorV4',  // S47: RC4+CFG causes TDZ crash on this 3.5MB chunk — still minified by Vite
        'ScratchEditor', // S112: Blockly is already Closure-compiled — 2nd obfuscator breaks internal refs (removeElem$module$ ReferenceError)
        'ScratchCompileBar', // iter 78 STOP-HOOK: obfuscator hoists nextExperiment.title access outside JSX conditional short-circuit → undefined.title crash. Defensive optional chaining shipped CompileUploadButton + ScratchCompileBar, MA skipping obfuscator on this chunk eliminates entire class of obfuscation-induced regression iter 78+ web-dfu wire.
        'CompileUploadButton', // iter 78: same obfuscator concern; CompileUploadButton wires web-dfu flash chain with dfu npm + lazy imports; protect from obfuscation-induced control flow corruption
        'HomeCompileEntry', // iter 86 PREEMPTIVE iter 78 PRECEDENT: iter 85 close integration JSX conditional render `editorMode === MODE_BLOCKS ? <ElabScratchModeShell><ScratchEditor/></ElabScratchModeShell> : <CodeEditorCM6/>` simile pattern obfuscator hoisting risk workspaceBlockCount + onWorkspaceReady prop access. PROD bundle 36696B (3.2x preview 11279B) obfuscator string array indirection confirmed. Skip eliminates entire iter 78-style regression class. iter 79+ Atom 79.0 built-bundle E2E mandate aware, this is preemptive defense-in-depth.
        // PR #172 (2026-05-27) — session arduino R4. PROD reload-loop bug
        // diagnosed via Chrome MCP: BoardPicker `<select>` element ariaLive
        // null deref → React ErrorBoundary catch → reload. Obfuscator hoists
        // attribute lookup before React mount. Same defense-in-depth pattern
        // as ScratchCompileBar + CompileUploadButton.
        'BoardPicker',
        'UniversalUploadButton',
        'R4DfuUploadButton',
        'WebSerialUploadButton',
        'HomeUnlimChatInline',
        'UnlimChatPanel', // PR #170 Wave 2b — Andrea reload-loop same family
        'BuildModeGuide', // PR #170 Wave 2b — passo-passo guide
        'recharts', 'd3-vendor', 'supabase', 'experiments-vol', // Vendor/data chunks — no obfuscation needed
    ];

    return {
        name: 'elab-obfuscate-chunks',
        apply: 'build',
        enforce: 'post',
        async renderChunk(code, chunk) {
            // Skip vendor/library chunks
            if (SKIP_PATTERNS.some(p => chunk.fileName.includes(p))) return null;
            // Skip tiny chunks (<1KB) — likely empty stubs
            if (code.length < 1000) return null;

            // selfDefending only on main entry chunk — breaks cross-chunk refs otherwise
            const isMainChunk = chunk.isEntry || chunk.fileName.startsWith('index-');
            const chunkOptions = {
                ...obfuscatorOptions,
                selfDefending: isMainChunk ? true : false,
                sourceMap: false,
                inputFileName: chunk.fileName,
            };

            const JavaScriptObfuscator = (await import('javascript-obfuscator')).default;
            const result = JavaScriptObfuscator.obfuscate(code, chunkOptions);
            return { code: result.getObfuscatedCode(), map: null };
        },
    };
}

// Copyright watermark — injects comment every ~200 lines in built JS
function copyrightWatermark() {
    const stamp = `/* (c) Andrea Marro — ${new Date().toISOString().slice(0,10)} — ELAB Tutor — Tutti i diritti riservati */`;
    return {
        name: 'elab-copyright-watermark',
        apply: 'build',
        enforce: 'post',
        generateBundle(_, bundle) {
            for (const [fileName, chunk] of Object.entries(bundle)) {
                if (chunk.type !== 'chunk' || !fileName.endsWith('.js')) continue;
                const lines = chunk.code.split('\n');
                if (lines.length < 200) { chunk.code = stamp + '\n' + chunk.code; continue; }
                const result = [];
                for (let i = 0; i < lines.length; i++) {
                    if (i > 0 && i % 200 === 0) result.push(stamp);
                    result.push(lines[i]);
                }
                chunk.code = stamp + '\n' + result.join('\n');
            }
        },
    };
}

// Preview/dev builds must stay fast for hourly QA sessions. Code protection is
// kept for real production unless explicitly disabled, and can be forced with
// ELAB_OBFUSCATE=true when a protected local build is needed.
const enableCodeProtection = (mode, env = process.env) => {
    if (env.ELAB_OBFUSCATE === 'true') return true;
    if (env.ELAB_OBFUSCATE === 'false') return false;
    return mode === 'production' && env.VERCEL_ENV === 'production';
};

// Codex security stop-review (2026-05-27): removed hardcoded
// PUBLIC_SUPABASE_ANON_KEY fallback. anon JWT pubblico by design ma
// hardcode = leak in git history. Require env var only. Dev senza env =
// fallback dev-only sentinel (NON valido JWT, forza setup .env.local).
const DEV_SENTINEL_ANON_KEY = 'DEV_SENTINEL_SET_VITE_SUPABASE_ANON_KEY_IN_ENV_LOCAL';

function elabDevApiProxy() {
    const edgeUrl = (process.env.SUPABASE_EDGE_URL
        || process.env.VITE_SUPABASE_EDGE_URL
        || 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1').replace(/\/+$/, '');
    const anonKey = process.env.SUPABASE_ANON_KEY
        || process.env.VITE_SUPABASE_ANON_KEY
        || DEV_SENTINEL_ANON_KEY;

    return {
        name: 'elab-dev-api-proxy',
        apply: 'serve',
        configureServer(server) {
            server.middlewares.use('/api/voxtral', async (req, res) => {
                if (req.method !== 'POST') {
                    res.statusCode = 405;
                    res.setHeader('Allow', 'POST');
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Method Not Allowed - use POST' }));
                    return;
                }

                let rawBody = '';
                for await (const chunk of req) rawBody += chunk;

                let body = {};
                try {
                    body = rawBody ? JSON.parse(rawBody) : {};
                } catch {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Invalid JSON body' }));
                    return;
                }

                const input = String(body.input || body.text || '').trim().slice(0, 500);
                if (!input) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Missing input' }));
                    return;
                }

                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 10_000);
                try {
                    const upstream = await fetch(`${edgeUrl}/unlim-tts`, {
                        method: 'POST',
                        signal: controller.signal,
                        headers: {
                            'Content-Type': 'application/json',
                            apikey: anonKey,
                            Authorization: `Bearer ${anonKey}`,
                        },
                        body: JSON.stringify({
                            text: input,
                            provider: 'voxtral',
                            format: body.response_format || body.format || 'mp3',
                            voice_id: body.voice_id,
                            sessionId: body.sessionId,
                        }),
                    });
                    const contentType = upstream.headers.get('content-type') || '';
                    const provider = upstream.headers.get('x-tts-provider') || '';
                    const buffer = Buffer.from(await upstream.arrayBuffer());

                    if (!upstream.ok || !contentType.startsWith('audio/') || provider !== 'voxtral') {
                        res.statusCode = 502;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({
                            error: 'Voxtral upstream did not return cloned audio',
                            status: upstream.status,
                            contentType,
                            provider,
                            detail: buffer.toString('utf8').slice(0, 240),
                        }));
                        return;
                    }

                    res.statusCode = 200;
                    res.setHeader('Content-Type', contentType || 'audio/mpeg');
                    res.setHeader('Cache-Control', 'no-store');
                    for (const header of ['x-tts-provider', 'x-tts-voice', 'x-tts-model', 'x-tts-latency-ms']) {
                        const value = upstream.headers.get(header);
                        if (value) res.setHeader(header, value);
                    }
                    res.end(buffer);
                } catch (err) {
                    res.statusCode = err?.name === 'AbortError' ? 504 : 502;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                        error: err?.name === 'AbortError' ? 'Voxtral timeout 10s' : 'Voxtral proxy error',
                        detail: String(err?.message || err).slice(0, 200),
                    }));
                } finally {
                    clearTimeout(timer);
                }
            });
        },
    };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [
        elabDevApiProxy(),
        react(),
        VitePWA({
            // iter 49: autoUpdate. In classe e su iPad non possiamo lasciare
            // l'utente su una vecchia UI con Capitoli/Video legacy mentre il
            // deploy nuovo e' gia pronto. Il controllerchange in main.jsx
            // ricarica una sola volta quando il nuovo SW prende controllo.
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
            manifest: {
                name: 'ELAB Tutor — Simulatore Arduino',
                short_name: 'ELAB Tutor',
                description: 'Simulatore di circuiti e tutor AI per imparare elettronica e Arduino',
                theme_color: '#1E4D8C',
                background_color: '#F8FAFC',
                display: 'standalone',
                orientation: 'any',
                start_url: '/',
                icons: [
                    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
                    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                ],
            },
            workbox: {
                maximumFileSizeToCacheInBytes: 2500 * 1024, // 2.5MB max per file — increased for lesson-paths JSON (94 files)
                // autoUpdate + skipWaiting: evita drift PWA tra deploy e aula.
                // - clientsClaim: new SW takes control of uncontrolled tabs on
                //   activate, firing `controllerchange` which main.jsx uses to
                //   trigger a single automatic reload onto the fresh HTML.
                // - cleanupOutdatedCaches: purge old workbox-precache-v* entries
                //   so a stale precache from a prior deploy cannot serve stale
                //   HTML on the next navigation.
                skipWaiting: true,
                clientsClaim: true,
                cleanupOutdatedCaches: true,
                // G11: Only precache critical path — NOT all chunks
                // Lazy chunks (react-pdf, mammoth, admin, games) cached at runtime
                globPatterns: [
                    'index.html',
                    'assets/index-*.js',          // main entry + react-vendor
                    'assets/index-*.css',          // main CSS
                    'assets/ElabTutorV4-*.js',     // tutor core
                    'assets/ElabTutorV4-*.css',    // tutor CSS
                    // CodeMirror excluded from precache — runtime cached on first use (saves ~460KB)
                    // 'assets/codemirror-*.js',
                    'assets/avr-*.js',             // AVR emulation (if separate)
                    // iter 81 81.A5 (Codex Pattern V iter 79 LOW BLOCKLY-2): explicitly
                    // include ScratchEditor chunk in precache whitelist. globPatterns IS
                    // the whitelist — removing from globIgnores alone (the blacklist)
                    // does nothing if pattern not whitelisted. ScratchEditor 731KB
                    // gzipped ~190KB stays under maximumFileSizeToCacheInBytes 2.5MB
                    // line 209. Required for offline Blockly mount (Andrea iter 79 PM
                    // mandate "blocchi E IDE in homepage" + iter 80.A2 IDE-1 tab).
                    'assets/ScratchEditor-*.js',
                    // VitePWA virtual register module is now bundled as a lazy
                    // JS chunk; there is no public registerSW.js file to precache.
                    'fonts/*.woff2',
                    'hex/*.hex',               // G40: pre-compiled HEX for offline use
                ],
                // Exclude heavy chunks from precache
                // iter 81 81.A5 (Codex Pattern V iter 79 LOW BLOCKLY-2): removed
                // `assets/ScratchEditor*` from globIgnores. Andrea iter 79 PM
                // mandate "blocchi E IDE in homepage" + iter 80.A2 IDE-1 tab
                // require ScratchEditor mount LIVE first paint. PWA exclusion
                // forced runtime-only network fetch → first offline classroom
                // use would fail block render. Precache now ensures Blockly
                // works offline (typical classroom scenario: spotty wifi).
                // Chunk size ~731KB gzip ~190KB acceptable for educational
                // priority. Other heavy chunks (react-pdf 1.9MB + mammoth +
                // html2canvas + admin/teacher dashboards) STAY excluded —
                // not on critical path for student/docente lesson flow.
                globIgnores: [
                    'assets/react-pdf*',
                    'assets/mammoth*',
                    'assets/html2canvas*',
                    'assets/DashboardGestionale*',
                    'assets/GestionalePage*',
                    'assets/Admin*',
                    'assets/Fatturazione*',
                    'assets/CircuitDetective*',
                    'assets/ReverseEngineering*',
                    'assets/PredictObserve*',
                    'assets/TeacherDashboard*',
                    'assets/StudentDashboard*',
                    'assets/VetrinaSimulatore*',
                ],
                runtimeCaching: [
                    {
                        // Lazy-loaded JS chunks — cache after first load
                        urlPattern: /\/assets\/.*\.js$/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'elab-lazy-chunks',
                            expiration: { maxEntries: 60, maxAgeSeconds: 604800 }, // 7 days
                        },
                    },
                    {
                        // Images and SVGs
                        urlPattern: /\/assets\/.*\.(png|svg|jpg|webp)$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'elab-images',
                            expiration: { maxEntries: 100, maxAgeSeconds: 2592000 }, // 30 days
                        },
                    },
                    {
                        // Hex files for AVR
                        urlPattern: /\/hex\/.*\.hex$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'elab-hex',
                            expiration: { maxEntries: 30, maxAgeSeconds: 2592000 },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/elab-galileo\.onrender\.com\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'galileo-api',
                            expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
                            // G40: 30s for Render free tier cold-start (20-50s)
                            networkTimeoutSeconds: 30,
                        },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts',
                            expiration: { maxEntries: 20, maxAgeSeconds: 31536000 },
                        },
                    },
                ],
            },
        }),
        ...(enableCodeProtection(mode) ? [obfuscateChunks({
            compact: true,
            // Control flow — DISABLED: causes TDZ errors across chunk boundaries
            controlFlowFlattening: false,
            controlFlowFlatteningThreshold: 0,
            // Dead code injection — DISABLED: interacts with CFG to cause TDZ
            deadCodeInjection: false,
            deadCodeInjectionThreshold: 0,
            // Debug protection — DISABLED: causes infinite debugger loops
            // that conflict with browser environments and crash the app
            debugProtection: false,
            debugProtectionInterval: 0,
            // selfDefending is per-chunk (see renderChunk above)
            // String encryption — 100% RC4 (was 75%)
            stringArray: true,
            stringArrayEncoding: ['rc4'],
            stringArrayThreshold: 1.0,
            stringArrayWrappersCount: 5,
            stringArrayWrappersChainedCalls: true,
            // Protect dynamic import paths + asset refs from string encryption
            reservedStrings: ['\\.js', '\\.css', '\\.svg', '\\.png', '\\.jpg', 'assets/'],
            // String splitting — break long strings into chunks (min 10 to protect import paths)
            splitStrings: true,
            splitStringsChunkLength: 10,
            // Transform everything
            transformObjectKeys: true,
            unicodeEscapeSequence: true,
            numbersToExpressions: true,
            // Console output — DISABLED: conflicts with runtime code protection
            // detection and any library that expects console to be callable
            disableConsoleOutput: false,
            // Domain lock — only our domains
            domainLock: [
                '.elabtutor.school',
                '.vercel.app',
                'localhost',
            ],
            domainLockRedirectUrl: 'https://www.elabtutor.school',
            // Identifiers
            identifierNamesGenerator: 'hexadecimal',
            renameGlobals: false,
        }), copyrightWatermark()] : []),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    worker: {
        format: 'es',
    },
    build: {
        // iter 26 P1 Lighthouse perf 26/23 fix — Vite `modulePreload` directive
        // crawls modulegraph and emits `<link rel="modulepreload">` for every chunk
        // reachable from index.js INCLUDING React.lazy()/await import() chunks.
        // Browser downloads ~2.5MB extra (react-pdf 1.8MB + mammoth 492KB) before paint
        // on every route — chatbot-only + easter-modal NEVER use react-pdf/mammoth.
        // Fix: filter out heavy lazy-only chunks from preload graph.
        // Projected: -2.3MB initial, +40-50 Lighthouse perf points (26→65-75).
        modulePreload: {
            resolveDependencies: (_filename, deps) => {
                return deps.filter((d) => !/(?:react-pdf|pdfjs-dist|@react-pdf|mammoth)/.test(d));
            },
        },
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // --- Vendor libraries (explicit splits) ---

                    // React core
                    if (id.includes('node_modules/react-dom/') || id.includes('node_modules/react/')) {
                        return 'react-vendor';
                    }

                    // CodeMirror
                    if (id.includes('node_modules/codemirror/') || id.includes('node_modules/@codemirror/')) {
                        return 'codemirror';
                    }

                    // AVR emulation
                    if (id.includes('node_modules/avr8js/')) {
                        return 'avr';
                    }

                    // react-pdf + pdfjs-dist (always loaded together, lazy-loaded via VolumeViewer)
                    if (id.includes('node_modules/react-pdf/') || id.includes('node_modules/pdfjs-dist/') || id.includes('node_modules/@react-pdf/')) {
                        return 'react-pdf';
                    }

                    // recharts (only used in TeacherDashboard/admin charts)
                    if (id.includes('node_modules/recharts/')) {
                        return 'recharts';
                    }

                    // d3 sub-packages (recharts dependency, split separately)
                    if (id.includes('node_modules/d3-')) {
                        return 'd3-vendor';
                    }

                    // Supabase client
                    if (id.includes('node_modules/@supabase/')) {
                        return 'supabase';
                    }

                    // html2canvas
                    if (id.includes('node_modules/html2canvas/')) {
                        return 'html2canvas';
                    }

                    // mammoth (docx)
                    if (id.includes('node_modules/mammoth/')) {
                        return 'mammoth';
                    }

                    // --- App data splits (experiment data is ~600KB total) ---

                    // Split experiment data per volume
                    if (id.includes('/data/experiments-vol1')) {
                        return 'experiments-vol1';
                    }
                    if (id.includes('/data/experiments-vol2')) {
                        return 'experiments-vol2';
                    }
                    if (id.includes('/data/experiments-vol3')) {
                        return 'experiments-vol3';
                    }
                },
            },
        },
        chunkSizeWarningLimit: 1000,
        sourcemap: false,
        // minify: default (esbuild) — TDZ crash is obfuscator/minifier identifier collision (S57: confirmed NOT Rollup chunking)
    },
}))
