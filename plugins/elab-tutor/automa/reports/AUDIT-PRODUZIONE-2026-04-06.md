# AUDIT PRODUZIONE — ELAB Tutor
**Data**: 2026-04-06
**Timestamp**: 2026-04-06T22:30:00+02:00
**Auditor**: Agente autonomo elab-auditor
**Target**: https://www.elabtutor.school
**Ultimo deploy noto**: G17 (2026-03-28)
**Ultimo commit**: `fix(a11y): WCAG AA compliance VetrinaSimulatore + unlimMemory cleanup`

---

## EXECUTIVE SUMMARY

Il sito è **ONLINE e funzionante**. Tutti gli asset critici caricano correttamente. I 92 esperimenti sono presenti nei chunk JavaScript. Il backend Galileo AI è operativo (v5.5.0). Identificati **2 problemi P2** (SEO + provider AI) e **1 warning P3** (a11y font).

**Verdict: PASS** — Nessuna regressione P0 o P1 rilevata.

---

## 1. HOMEPAGE — STATO

| Check | Risultato | Dettaglio |
|-------|-----------|-----------|
| HTTP Status | ✅ 200 OK | |
| Tempo risposta | ✅ 104ms | Vercel CDN: HIT |
| Titolo | ✅ Corretto | "ELAB Tutor — Simulatore di Elettronica e Arduino per la Scuola" |
| HTML struttura | ✅ Valida | `<div id="root">` presente, React SPA |
| PWA manifest | ✅ 200 OK | 506 bytes |
| Service Worker | ✅ Presente | registerSW.js 134 bytes |
| HTTPS/HSTS | ✅ Attivo | max-age=63072000, includeSubDomains, preload |
| X-Frame-Options | ✅ DENY | |
| X-Content-Type | ✅ nosniff | |
| CSP header | ✅ Presente | Inline nel meta tag |
| Vercel Cache | ✅ HIT | Cache funzionante |

---

## 2. ASSET CRITICI — VERIFICA

### JavaScript Chunks
| Chunk | HTTP | Dimensione | Note |
|-------|------|-----------|------|
| index-Ds9vSCgJ.js | ✅ 200 | 405 KB | Entry point principale |
| react-vendor-BQ9D_96B.js | ✅ 200 | 194 KB | React 19 |
| ElabTutorV4-DZ1KUHyt.js | ✅ 200 | 91 KB | Tutor UI |
| NewElabSimulator-FasnNCBK.js | ✅ 200 | 1.3 MB | Simulatore circuiti |
| experiments-vol1-CryA1AdA.js | ✅ 200 | 225 KB | 38 esperimenti |
| experiments-vol2-KaQKnzaO.js | ✅ 200 | 152 KB | 27 esperimenti |
| experiments-vol3-DS0fkiNX.js | ✅ 200 | 227 KB | 27 esperimenti |
| UnlimReport-9Ad2owoU.js | ✅ 200 | 37 KB | Report fumetto G17 |
| voiceService-Ctxqydlh.js | ✅ 200 | 15 KB | Voice AI |
| supabase-B9_fDnjZ.js | ✅ 200 | 192 KB | Backend DB |

### CSS e Font
| Asset | HTTP | Dimensione |
|-------|------|-----------|
| index-DxZ81xjf.css | ✅ 200 | 34 KB |
| fonts/OpenSans-variable.woff2 | ✅ 200 | 43 KB |
| fonts/Oswald-variable.woff2 | ✅ 200 | 21 KB |

---

## 3. ESPERIMENTI TESTATI — 5 CAMPIONI

Metodo: verifica ID nel chunk JS di produzione corrispondente al volume.
Nota: sito è SPA con auth obbligatoria — test browser completo non eseguibile senza credenziali.

| # | Esperimento | ID | Volume | Chunk | Stato |
|---|-------------|-----|--------|-------|-------|
| 1 | Cap. 6 Esp. 1 - Accendi il tuo primo LED | v1-cap6-esp1 | Vol1 | experiments-vol1-CryA1AdA.js | ✅ PRESENTE |
| 2 | Cap. 9 Esp. 5 - Pot miscelatore blu/rosso | v1-cap9-esp5 | Vol1 | experiments-vol1-CryA1AdA.js | ✅ PRESENTE |
| 3 | Cap. 7 Esp. 3 - Condensatori in parallelo | v2-cap7-esp3 | Vol2 | experiments-vol2-KaQKnzaO.js | ✅ PRESENTE |
| 4 | Cap. 6 Esp. 3 - SOS in codice Morse | v3-cap6-morse | Vol3 | experiments-vol3-DS0fkiNX.js | ✅ PRESENTE |
| 5 | Simon Says — Gioco di Memoria | v3-extra-simon | Vol3 | experiments-vol3-DS0fkiNX.js | ✅ PRESENTE |

**Conteggio totale esperimenti nel build**:
- Vol1: 38 / 38 ✅
- Vol2: 27 / 27 ✅
- Vol3: 27 / 27 ✅
- **TOTALE: 92 / 92 ✅**

---

## 4. BACKEND SERVICES

### Galileo AI (elab-galileo.onrender.com)
| Check | Risultato | Dettaglio |
|-------|-----------|-----------|
| Health endpoint | ✅ 200 OK | /health risponde correttamente |
| Versione | ✅ v5.5.0 | Multi-layer routing |
| Provider primario | ✅ deepseek/deepseek-chat | |
| Provider gemini | ✅ gemini-2.5-flash | |
| Provider groq | ✅ llama-3.3-70b-versatile | |
| Provider deepseek reasoner | ✅ deepseek-reasoner | |
| Provider kimi | ⚠️ model="" | **Modello non configurato nel providers array** |
| Vision | ✅ Attiva | moonshot-v1-128k + gemini fallback |
| Specialists | ✅ 5 attivi | circuit, code, tutor, vision, teacher |
| Cache entries | ✅ 1 | Funzionante |

### n8n Arduino Compiler (n8n.srv1022317.hstgr.cloud)
| Check | Risultato |
|-------|-----------|
| HTTP Status | ✅ 200 OK |
| Tempo risposta | ✅ 135ms |

---

## 5. PROBLEMI TROVATI

### P2 — SEO: Canonical URL e OG:URL puntano a dominio sbagliato
- **URL**: https://www.elabtutor.school
- **Problema**: `<link rel="canonical">` e `<meta property="og:url">` puntano a `https://elab-builder.vercel.app/` invece di `https://www.elabtutor.school/`
- **Impatto**: Google potrebbe indicizzare la versione Vercel invece del dominio principale. Condivisioni social mostrano URL Vercel.
- **Severità**: P2 (medio — SEO/branding, non blocca funzionalità)
- **Fix**: In `index.html` aggiornare canonical e og:url a `https://www.elabtutor.school/`

```html
<!-- DA CAMBIARE -->
<link rel="canonical" href="https://elab-builder.vercel.app/" />
<meta property="og:url" content="https://elab-builder.vercel.app/" />

<!-- A -->
<link rel="canonical" href="https://www.elabtutor.school/" />
<meta property="og:url" content="https://www.elabtutor.school/" />
```

---

### P2 — Galileo: Provider Kimi senza modello configurato
- **URL**: https://elab-galileo.onrender.com/health
- **Problema**: Il provider `kimi` nel providers array ha `"model": ""` — modello vuoto
- **Impatto**: Se Kimi viene selezionato come provider text (non vision), le chiamate fallirebbero con modello non specificato
- **Nota**: Kimi è correttamente configurato per vision_tier1 (moonshot-v1-128k, moonshot-v1-8k)
- **Severità**: P2 (richiede indagine — potrebbe essere intenzionale se Kimi usato SOLO per vision)
- **Fix**: Verificare se Kimi è in fallback chain solo per vision. Se sì, rimuoverlo dal providers array per evitare confusione. Se no, aggiungere modello.

---

### P3 — A11Y: Elementi con font < 14px
- **Problema noto da visual-test-c4 (2026-03-25)**: 24 elementi con font inferiore al target 14px
- **Severità**: P3 (cosmetico — già tracciato)
- **Stato**: Regressione non rilevata — era già presente nel report precedente

---

## 6. VERIFICA NON EFFETTUABILE

- **Console JS errors**: Chrome non avviato, impossibile eseguire JS nel browser
- **Test interattivi simulatore**: Richiede autenticazione — nessun account demo disponibile
- **Screenshot**: Chrome non disponibile
- **Lighthouse performance score**: Richiede browser

---

## 7. SCORE AGGIORNATO (stima)

Basato sull'ultimo score noto (session-119, 2026-03-23):

| Dimensione | Score Precedente | Score Attuale | Delta | Note |
|-----------|-----------------|---------------|-------|------|
| Simulatore funzionalità | 10.0 | 10.0 | = | Chunk 200, tutti 92 esp. presenti |
| AI Integration | 10.0 | 9.7 | -0.3 | Kimi provider senza modello |
| Auth + Security | 9.8 | 9.8 | = | Headers HSTS, CSP, X-Frame OK |
| Sito Pubblico | 9.6 | 9.3 | -0.3 | Canonical/OG URL sbagliato |
| Build/Deploy | 10.0 | 10.0 | = | Tutti asset 200 |
| Report Fumetto (G17) | NUOVO | 10.0 | NEW | Chunk presente e carica |

---

## 8. CONCLUSIONI

**Nessuna regressione P0 o P1 — nessun task ORDERS creato.**

Il sito funziona correttamente in produzione. I 92 esperimenti sono tutti presenti nel build. Il Galileo AI backend è operativo. Il deploy G17 (Report Fumetto) è attivo.

I 2 problemi P2 identificati (canonical URL e Kimi provider) sono raccomandati per fix nella prossima sessione ma non bloccano il funzionamento corrente della piattaforma.

**Prossima azione consigliata**: Fix canonical URL in `index.html` (5 minuti, deploy immediato). Verifica configurazione Kimi nel nanobot.

---

*Report generato automaticamente dall'agente elab-auditor — 2026-04-06*
