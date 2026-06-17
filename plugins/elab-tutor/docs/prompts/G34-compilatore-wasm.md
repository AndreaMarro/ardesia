# G34 — COMPILATORE WASM LOCALE

**Sprint F** — Quarta sessione (post G33 Test E2E Playwright)
**Deadline PNRR**: 30/06/2026 (87 giorni)
**Riferimento piano**: `docs/prompts/SPRINT-F-MASTER-PLAN.md`

---

## CONTESTO RAPIDO
- G33: 20/20 test E2E Playwright, GitHub Action CI pronta, 940/940 unit test
- Score composito: 8.8/10 (target Sprint F: ≥ 9.0/10)
- Compilazione C++ attualmente via n8n (remota, dipende da server Hostinger)
- **Collo di bottiglia**: compilazione offline impossibile, dipendenza server esterno
- 67 esperimenti con codice C++ Arduino, tutti devono compilare

---

## IMPERATIVO ASSOLUTO
ZERO DEMO. ZERO DATI FINTI. ZERO MOCK.
La compilazione WASM deve produrre HEX reali per AVR, eseguibili nel simulatore.

---

## SKILL DA USARE (SE DISPONIBILI)

| Fase | Skill | Perché | Fallback manuale |
|------|-------|--------|------------------|
| INIZIO | `/elab-quality-gate` | Baseline pre-session | `npm run build && npx vitest run && npm run test:e2e` |
| RESEARCH | `/ricerca-tecnica` | avr-gcc WASM vs alternative | Web search manuale |
| IMPL | `/arduino-simulator` | Integrazione compiler | Implementazione diretta |
| TEST | `/tinkercad-simulator` | Verifica compilazione 67 esperimenti | Test manuale |
| FINE | `/elab-quality-gate` | Score card post | Build + test + E2E |

---

## TASK

### 1. Quality Gate Pre-Session (10min)
```
/elab-quality-gate pre
```
Verificare: build, 940+ unit test, 20/20 E2E

### 2. Ricerca Compilatore WASM (45min)

Investigare opzioni per compilazione C++ Arduino → HEX nel browser:

**Opzione A: avr-gcc prebuilt WASM**
- Esiste un build WASM di avr-gcc? (es. avr-gcc.wasm, avrgcc-wasm)
- Pro: compatibilità massima con Arduino IDE
- Con: build WASM di GCC è complesso, bundle potenzialmente >20MB

**Opzione B: Emscripten port di avr-gcc**
- Compilare avr-gcc con Emscripten
- Pro: full compatibility
- Con: setup time enorme, maintenance burden

**Opzione C: Vercel Edge Function / Cloudflare Worker**
- Compilazione server-side leggera, < 100ms latency
- Pro: nessun WASM, nessun bundle bloat, facile da implementare
- Con: ancora dipende da rete (ma latency bassissima)

**Opzione D: Compilatore C semplificato custom**
- Parser C++ minimo → bytecode AVR
- Pro: bundle piccolo, offline totale
- Con: compatibilità limitata, maintenance nightmare

**Decisione**: scegliere l'opzione che bilancia offline capability, bundle size (<5MB), e coverage dei 67 esperimenti.

### 3. Implementazione (2h)

In base alla decisione:
1. Creare `src/services/compiler.js` (o aggiornare esistente)
2. Implementare fallback chain: WASM/Edge → n8n → errore user-friendly
3. Lazy-loading: il modulo WASM/compiler caricato solo quando serve
4. UI indicator: "Compilazione locale ⚡" vs "Compilazione remota 🌐"
5. Progress bar durante compilazione

### 4. Test Compilazione (1h)

Testare compilazione di TUTTI i 67 esperimenti:
- Ogni `defaultCode` deve compilare senza errori
- L'HEX generato deve essere caricabile nel simulatore AVR
- Misurare tempo medio compilazione (target: < 3s)
- Misurare bundle size aggiuntivo (target: < 5MB lazy)

### 5. Quality Gate Post-Session (15min)
```
/elab-quality-gate post
```

---

## CHAIN OF VERIFICATION — 3 PASSAGGI

### CoV 1: POST-TASK (dopo ogni step)
- `npm run build` — DEVE passare
- `npx vitest run` — 940+ test, 0 fail
- `npm run test:e2e` — 20 test, 0 fail

### CoV 2: PRE-MERGE
- Tutti 67 esperimenti compilano
- Fallback chain funziona (disconnect WiFi → verifica)
- Bundle size < limite

### CoV 3: POST-SESSION
1. Compilazione funziona (online o offline)
2. 67 esperimenti tutti compilano
3. Performance < 3s
4. Handoff aggiornato
5. Prompt G35 scritto

---

## REGOLE
- ZERO DEMO, ZERO DATI FINTI, ZERO MOCK
- ZERO REGRESSIONI: build + vitest + E2E dopo OGNI modifica
- Non toccare engine/ — MAI
- 67 lesson paths INTOCCABILI
- Budget ≤ €50/mese
- 20 E2E test devono continuare a passare

---

## DELIVERABLE ATTESI G34

| # | Deliverable | Criterio di accettazione |
|---|-------------|--------------------------|
| 1 | Compilatore integrato | Compilazione C++ → HEX funzionante |
| 2 | Fallback chain | WASM/Edge → n8n → errore graceful |
| 3 | 67 esperimenti compilano | 67/67 defaultCode → HEX valido |
| 4 | Performance | < 3s per compilazione |
| 5 | Bundle size | < 5MB aggiuntivi (lazy loaded) |
| 6 | UI indicator | Locale ⚡ vs Remoto 🌐 visibile |
| 7 | Score card G34 | Simulatore ≥ 8.5/10 |

---

## SCORE TARGET

| Area | G33 | Target G34 | Come |
|------|-----|-----------|------|
| Build/Test | 10/10 | **10/10** | Mantenere |
| Simulatore | 8/10 | **8.5/10** | +compilatore offline |
| Test E2E | 8.5/10 | **8.5/10** | Mantenere 20 test |
| GDPR | 8.5/10 | **8.5/10** | Mantenere |
| **COMPOSITO** | **8.8/10** | **9.0/10** | Compilatore sblocca offline |
