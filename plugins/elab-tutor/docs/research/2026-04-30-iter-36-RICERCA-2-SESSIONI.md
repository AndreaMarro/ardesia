# Ricerca 2 Sessioni Precedenti — Atom A12 prep iter 36

**Date**: 2026-04-30 PM (iter 36 PHASE 1 parallel work, Documenter Phase 2 will consume)
**Author**: orchestrator scribe (Documenter Phase 2 expand)

## §1 Mem-search summary iter 33-35 bugs (claude-mem cross-session corpus)

Query: `iter 33 34 35 bugs UNLIM modalità lavagna` → 25 results (9 obs, 1 sessions, 15 prompts).

**Most relevant Andrea bug reports pre-iter 36** (chronological):

| ID | Date | Bug/topic |
|----|------|-----------|
| #P4999 | 2026-04-30 07:01 | "ma fai iter 30 e 31 in questa sessione, documenta tutto e..." (iter 30+31 marathon mandate) |
| #P5030 | 2026-04-30 11:09 | "VORREI CHE TUTTI I BUG ELENCATI SIANO TOLTI O MESSI A POS..." (bug sweep mandate iter 36 origin) |
| #P5032 | 2026-04-30 11:18 | "hai deployato?" (deploy verify Andrea pressure) |
| #P5041 | 2026-04-30 12:16 | "che problemi permangono? cosa devo fornirti? documenta tu..." (gap audit request) |
| #P5044 | 2026-04-30 12:47 | "poi la modalità percorso è sparita e il quadrante di pass..." (**Atom A4 + A5 bug origin verbatim**) |

**Earlier Sprint Q context** (#1083-1086 Apr 24): Sprint Q0 v1.1 curriculum 35 chapters + 4 editorial bugs flagged. Volume narrative refactor scope → ADR-027 (iter 19) → carryover Sprint U.

## §2 Top 10 unresolved bugs Andrea iter 33-35 → iter 36 sweep target

(Cross-ref: CLAUDE.md "Iter 33+ P0 carryover" + iter 32 close + Andrea PM mandate iter 21+)

1. **Modalità Percorso sparita dropdown** (Atom A4 P0, WebDesigner-1 BG)
2. **Passo Passo NON resizable/draggable** (Atom A5 P0, WebDesigner-2 BG, FloatingWindow wrap)
3. **UNLIM tabs sovrapposizione persistente** post 7f963c4 iter 34 (Atom A6 P0, WebDesigner-2 BG)
4. **Toast "Nessuna sessione salvata" su Fumetto** (Atom A7 verify, Tester-1 ✅)
5. **Lavagna scritti spariscono post Esci** (Bug 2 Atom A8 verify, Tester-1 ✅)
6. **Wake word "Ehi UNLIM" toast permission denied** (Bug 8 Atom A9 verify, Tester-2 ✅, **already fixato iter 35** + gap "Ragazzi" prepend iter 37 Maker-1)
7. **Onnipotenza dispatcher 62-tool NOT wired post-LLM** (Atom A1 P0, Maker-1 BG, ADR-028 PROPOSED)
8. **Compile server LIVE post-Andrea SSH n8n fix arduino-cli** (BLOCKER Andrea infrastructure, NOT MacBook agent fixable)
9. **Vision Gemini Flash EU NOT prod deploy** (Atom A2 require Andrea SUPABASE_ACCESS_TOKEN ratify)
10. **Latency p95 chat 6.8s warm** (target <4s post Mistral + Gemini Flash-Lite routing 50/15/15/20 — defer iter 37 measure post Onniscenza inject)

## §3 PWA Service Worker cache invalidation research

**Andrea cache issue context** (CLAUDE.md iter 32 carryover #1): post API key rotation, frontend Vercel deploy verify pending. Andrea reportedly seeing stale UI strings post deploy. Hypothesis: PWA SW cache aggressive serving old `index.html` + chunked JS bundles.

**Stato attuale `dist/sw.js`** (assumed Workbox via VitePWA plugin):
- Strategy: NetworkFirst for `index.html` + StaleWhileRevalidate for JS/CSS chunks
- 33 precache (per iter S2 Lavagna Redesign close note)
- Risk: SWR serves stale chunk, force refresh required

**2026 Workbox best practices summary**:

- **Stale-While-Revalidate**: serves cached resource first, updates cache in background. Used for mixed content (static + frequently updated). Risk: user sees stale UI until next reload.
- **Workbox-expiration module**: `purgeOnQuotaError` + `maxAgeSeconds` + `maxEntries` to bound cache lifetime.
- **Workbox 7 + Vite 7 native integration** (CLAUDE.md stack): supports `injectManifest` + `generateSW`. Service worker version bumped automatically per build hash.
- **Force update prompt pattern**: SW listens `'updatefound'` event → `'controllerchange'` → prompt user "Nuova versione disponibile, ricarica?". Not enabled by default.

**Fix raccomandato iter 37 Maker-1**:

1. Verify `vite.config.js` VitePWA plugin config (`registerType: 'autoUpdate'` vs `'prompt'`)
2. If `autoUpdate`: SW auto-replaces, but UI not reloaded — add `window.location.reload()` on `controllerchange` event
3. If `prompt`: implement "Aggiornamento disponibile" toast + "Ricarica" button (PRINCIPIO ZERO plurale: "Ragazzi, c'è una nuova versione. Ricaricate la pagina?")
4. Add SW version label in footer ("v{BUILD_SHA}") for debugging
5. Add `?v=BUILD_SHA` query param to critical fetch URLs to bypass SW cache

**Additional reference**: Workbox issue #2767 (StaleWhileRevalidate second call edge case) — applicable if `vary` headers present.

## §4 Firecrawl SW.js prod current state (deferred Documenter Phase 2)

**Action**: Documenter use `firecrawl` to fetch `https://www.elabtutor.school/sw.js` and diff vs `dist/sw.js` locale. Identify version + precache count + strategy mismatch.

```bash
# Documenter Phase 2 command:
curl -s https://www.elabtutor.school/sw.js | head -100 > /tmp/sw-prod.js
diff /tmp/sw-prod.js "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/dist/sw.js" 2>&1 | head -50
```

Or via firecrawl MCP if configured.

## §5 Iter 36 Atom A12 spec coverage status

| Sub-task | Status | Owner |
|----------|--------|-------|
| mem-search "iter 33 34 35 bugs" | ✅ done (§1+§2) | orchestrator scribe (this doc) |
| timeline anchors critical | partial (15 prompts, 9 obs identified) | Documenter Phase 2 expand |
| WebSearch PWA SW invalidation 2026 | ✅ done (§3) | orchestrator scribe |
| firecrawl SW.js prod diff | pending | Documenter Phase 2 |
| Output research doc | ✅ done (this file) | orchestrator + Documenter Phase 2 expand |

## §6 Sources

- [Offline-First PWAs: Service Worker Caching Strategies](https://www.magicbell.com/blog/offline-first-pwas-service-worker-caching-strategies)
- [Progressive Web Apps 2026: PWA Performance Guide](https://www.digitalapplied.com/blog/progressive-web-apps-2026-pwa-performance-guide)
- [Workbox | web.dev](https://web.dev/learn/pwa/workbox)
- [Workbox Issue #2767 StaleWhileRevalidate edge case](https://github.com/GoogleChrome/workbox/issues/2767)
- [PWA Caching Strategies — DEV](https://dev.to/pssingh21/pwa-caching-strategies-1d7c)
- [Service Worker Caching Strategies — DEV](https://dev.to/pahanperera/service-worker-caching-strategies-1dib)

## §7 Handoff to Documenter Phase 2

**Actions for Documenter agent** when spawned post 6/6 barrier:

1. Expand §1 mem-search with timeline `depth_before:3 depth_after:3` on anchors #P5044 + #P5030 + #P4999 (full Andrea iter 30-31-36 mandate context)
2. Execute §4 firecrawl SW.js prod diff
3. Cross-link to iter 36 Phase 1 deliverables matrix (audit doc)
4. Cite this prep file in `2026-04-30-iter-36-PHASE3-CLOSE-audit.md` §5 research findings
5. Update `MEMORY.md` index with `[ricerca-2-sessioni-iter-36](research/2026-04-30-iter-36-RICERCA-2-SESSIONI.md) — Atom A12 prep + PWA SW research`
