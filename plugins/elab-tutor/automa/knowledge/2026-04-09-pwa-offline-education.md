# Research: PWA Offline-First per Educazione

Data: 2026-04-09

## Fonti
- [MDN: Service Workers Offline](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation)
- [Google: PWA Going Offline](https://developers.google.com/codelabs/pwa-training/pwa03--going-offline)
- [MagicBell: Service Worker Caching Strategies](https://www.magicbell.com/blog/offline-first-pwas-service-worker-caching-strategies)
- [Progressier: How to Make PWA Work Offline](https://progressier.com/pwa-capabilities/how-to-make-a-pwa-work-offline)

## Key Findings

1. **Cache-first per assets statici**: CSS, JS, immagini, font → serviti SEMPRE da cache. Network solo per aggiornamenti in background. ELAB fa gia' questo con Workbox precache.

2. **Stale-while-revalidate per contenuti dinamici**: Mostra vecchio, aggiorna in background. ELAB usa gia' questo per lazy chunks.

3. **Test con network simulation**: Chrome DevTools → 2G/3G/offline. ELAB dovrebbe testare regolarmente su reti lente scolastiche.

4. **Install banner**: ELAB dovrebbe mostrare "Installa ELAB" al primo uso — una volta installata come PWA, funziona offline senza pensarci.

5. **Dati offline = localStorage + IndexedDB**: ELAB usa localStorage per sessioni e progresso. Sufficiente per offline, ma IndexedDB sarebbe piu' robusto per dati grandi.

## Applicabilita' ELAB

ELAB ha GIA' PWA con service worker e precache. Ma puo' migliorare:
- **HEX precompilati**: gia' cached via SW — il compilatore funziona offline ✅
- **Esperimenti**: i dati sono in JS bundle — funzionano offline ✅
- **AI Galileo**: NON funziona offline (richiede server) ❌
  → Serve fallback offline per Galileo (risposte pre-generate?)
- **Install banner**: non implementato → aggiungere

## Action Items

1. [P2] Aggiungere install banner PWA ("Installa ELAB sul tuo dispositivo")
2. [P3] Testare ELAB su rete 2G con Chrome DevTools
3. [P3] Valutare risposte Galileo pre-generate per offline
4. [P4] Migrare da localStorage a IndexedDB per dati > 5MB
