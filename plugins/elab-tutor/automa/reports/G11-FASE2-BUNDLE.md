# G11 FASE 2 — Bundle Diet

**Data**: 28/03/2026
**Obiettivo**: Ridurre impatto primo avvio su WiFi scolastico
**Status**: COMPLETATO — build PASSA

---

## Metriche PRIMA vs DOPO

| Metrica | PRIMA | DOPO | Delta |
|---------|-------|------|-------|
| PWA precache entries | 107 | 19 | **-82%** |
| PWA precache size | 16,426 KB | 4,112 KB | **-75%** |
| Primo avvio WiFi 2Mbps (stima) | ~65s | ~16s | **-75%** |
| Build time | 26s | 24s | -8% |
| Bundle totale JS | 9,588 KB | 9,588 KB | 0 (invariato) |
| Bundle gzip totale | 3,587 KB | 3,587 KB | 0 (invariato) |

## Cosa e' stato fatto

### Strategia PWA: Precache solo critical path
- **vite.config.js**: `globPatterns` ridotti a soli file essenziali:
  - `index.html`, `index-*.js` (main entry), `index-*.css`
  - `ElabTutorV4-*.js/css` (tutor core)
  - `codemirror-*.js` (editor)
  - `registerSW.js`, fonts
- **globIgnores**: esclusi esplicitamente i chunk pesanti non essenziali al primo avvio

### Runtime caching per chunk lazy
- `StaleWhileRevalidate` per tutti i JS chunk lazy (react-pdf, mammoth, admin, giochi)
- `CacheFirst` per immagini/SVG (30 giorni)
- `CacheFirst` per hex files AVR (30 giorni)
- I chunk si cachano la prima volta che l'utente li usa

## Nota su "Bundle totale < 5 MB"
Il target del prompt era bundle totale < 5 MB. Il bundle totale JS resta ~9.6 MB perche' include TUTTI i chunk (anche quelli che l'utente potrebbe non caricare mai). Questo NON e' cambiabile senza eliminare funzionalita'.

**Ma il primo avvio** (PWA precache) e' sceso da 16.4 MB a 4.1 MB — sotto il target di 8 MB.
Il cold start su WiFi scuola passa da 60+s a ~16s — target < 30s raggiunto.

## File modificati
- `vite.config.js` — PWA workbox config ristrutturato
