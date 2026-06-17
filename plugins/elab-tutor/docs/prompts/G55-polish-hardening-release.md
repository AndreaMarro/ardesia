# G55 — FINAL POLISH, HARDENING, REGRESSION TEST

## Contesto
Fase 5 e ultima del piano sanamento G46-G55. Sessione finale pre-release. Obiettivo: score composito 8.0/10, 0 bug P0/P1, regression test completo.
Piano completo: `docs/prompts/G46-G55-sanamento-completo.md`

## STATO PRE-SESSIONE (da verificare)
- Test PASS count: ___  | Build time: ___s | Bundle: ___KB | Console errors: ___
- Deploy: https://www.elabtutor.school
- 62 esperimenti, 62 lesson paths, HEX precompilati

## REGOLE INVARIANTI
- ZERO DEMO, ZERO MOCK, ZERO DATI FINTI
- 62 lesson paths INTOCCABILI
- Non toccare engine/ — MAI
- `npm run build` + `npx vitest run` dopo OGNI singolo fix
- Palette: Navy #1E4D8C, Lime #4A7A25, Vol2 #E8941C, Vol3 #E54B3D
- Muted text: #737373 (WCAG AA 4.7:1)
- PATH: `export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | sort -V | tail -1)/bin:$PATH"`
- Budget: €50/mese (Claude escluso). Niente servizi costosi.

## PRE-SESSIONE OBBLIGATORIA
1. Esegui `/elab-quality-gate` pre-session
2. Salva baseline: test count, build time, bundle size, console errors
3. Leggere TUTTE le sessioni precedenti G46-G54 per sapere cosa e stato fatto e cosa no

---

## TASK 1 — GDPR audit tab: stato reale (1.5h)

### File da leggere PRIMA
- `src/components/teacher/TeacherDashboard.jsx` — sezione GDPRAuditTab (righe ~2817-2961)

### Problema
Le card GDPR mostrano stato hardcoded. Dopo G46 le card dovrebbero essere condizionali a `VITE_DATA_SERVER_URL`, ma servono ulteriori fix per riflettere lo stato Supabase (se configurato in G48-G50).

### Implementazione
```javascript
// Determinare stato reale
const hasSupabase = !!import.meta.env.VITE_SUPABASE_URL;
const hasDataServer = !!import.meta.env.VITE_DATA_SERVER_URL;

// Card 1: Archiviazione dati
// hasSupabase -> verde "Server EU (Frankfurt), crittografia in transito (TLS), RLS per utente"
// !hasSupabase -> giallo "Solo dati locali su questo dispositivo"

// Card 2: Audit Logging
// hasSupabase -> verde "Attivo — ogni modifica registrata con timestamp e user_id"
// !hasSupabase -> giallo "Non disponibile — configurare server per audit trail completo"

// Card 3: Data Retention
// hasSupabase -> verde "730 giorni server + locale, auto-cleanup"
// !hasSupabase -> giallo "730 giorni solo locale (auto-cleanup localStorage)"

// Card 4: Audit Log (tabella)
// hasSupabase -> fetch da Supabase e mostrare ultimi 20 eventi
// !hasSupabase -> "Configura il server per vedere il log delle attivita"
```

### Verifica
- Senza VITE_SUPABASE_URL: tutte le card gialle con messaggi onesti
- Con VITE_SUPABASE_URL: card verdi con informazioni reali
- ZERO card verdi false — questo era un P0

---

## TASK 2 — Documentation tab: contenuto utile (1h)

### File da leggere PRIMA
- `src/components/teacher/TeacherDashboard.jsx` — cercare tab Documentazione/Guida

### Problema
Il tab Documentazione ha 3 paragrafi generici su Reggio Emilia, inutili per l'insegnante.

### Implementazione
Sostituire con contenuto azionabile:

```jsx
// Quick Start Guide
<section>
  <h3>Come iniziare in 3 passi</h3>
  <ol>
    <li><strong>Crea una classe</strong>: vai nel tab Classi, clicca "Nuova classe", inserisci nome e scuola.</li>
    <li><strong>Aggiungi studenti</strong>: nella classe, clicca "Aggiungi studente" e inserisci nome/email.</li>
    <li><strong>Assegna un esperimento</strong>: scegli un volume, seleziona l'esperimento e condividi il link con la classe.</li>
  </ol>
</section>

// FAQ
<section>
  <h3>Domande frequenti</h3>
  <details>
    <summary>Posso usare ELAB senza connessione internet?</summary>
    <p>Si! Gli esperimenti con codice pre-compilato funzionano offline. Solo la compilazione di codice personalizzato e l'assistente Galileo richiedono connessione.</p>
  </details>
  <details>
    <summary>Come funziona il controllo vocale?</summary>
    <p>Il controllo vocale funziona su Chrome e Edge. Dici "play" per avviare, "stop" per fermare, "compila" per compilare il codice.</p>
  </details>
  <details>
    <summary>I dati degli studenti sono al sicuro?</summary>
    <p>I dati sono salvati localmente sul dispositivo. Con il server configurato, i dati sono crittografati e conservati in server EU (GDPR compliant).</p>
  </details>
  <details>
    <summary>Posso usare ELAB sulla LIM?</summary>
    <p>Si! ELAB e ottimizzato per LIM con touch target grandi (44px), bottoni chiari e layout adattivo.</p>
  </details>
  <details>
    <summary>Cosa serve per il kit hardware?</summary>
    <p>Il kit ELAB include scheda Arduino, breadboard, componenti base e i 3 volumi. Contattaci per informazioni: info@elabtutor.school</p>
  </details>
</section>

// Supporto
<section>
  <h3>Hai bisogno di aiuto?</h3>
  <p>Scrivi a <a href="mailto:supporto@elabtutor.school">supporto@elabtutor.school</a> — rispondiamo entro 24 ore.</p>
</section>
```

### Verifica
- Tab Documentazione: contenuto chiaro, azionabile, utile
- Nessun riferimento a Reggio Emilia o pedagogia astratta
- Link email funzionante
- FAQ espandibili con `<details>`/`<summary>`

---

## TASK 3 — Performance audit (1h)

### 3a. Lighthouse
```bash
# Build production
npm run build
npx vite preview &
# In un altro terminale o browser:
# Aprire Chrome DevTools -> Lighthouse -> Performance + Accessibility + Best Practices
```

Target:
- LCP < 2.5s
- FID (INP) < 200ms
- CLS < 0.1
- Accessibility score >= 90

### 3b. Bundle analysis
```bash
npx vite-bundle-analyzer
```

Controllare:
- Nessun chunk singolo > 500KB gzip
- CodeMirror, AVR, React in chunk separati (gia fatto in Sprint 3)
- Nessuna duplicazione di dipendenze
- Se ci sono chunk troppo grandi, aggiungere code splitting in `vite.config.js`

### 3c. Core Web Vitals fix
Se LCP > 2.5s:
- Verificare che le immagini critiche abbiano `loading="eager"`
- Preload font critici nell'`<head>`
- Verificare che il CSS critico non blocchi il rendering

Se CLS > 0.1:
- Aggiungere dimensioni esplicite a immagini/SVG
- Verificare che i font abbiano `font-display: swap`

### Documentare i risultati
Scrivere i risultati Lighthouse in un commento nel codice o in questo file di progresso.

---

## TASK 4 — FULL REGRESSION TEST (2h)

### 4a. Navigare TUTTI i 62 esperimenti
```javascript
// Script da eseguire nella console del browser su https://www.elabtutor.school
// Verifica che ogni esperimento si carica senza errori
const experiments = [/* lista di tutti i 62 ID */];
const results = [];
for (const id of experiments) {
  try {
    // Navigare all'esperimento
    window.location.hash = `#prova/${id}`;
    await new Promise(r => setTimeout(r, 2000));
    // Verificare che il canvas SVG sia presente
    const canvas = document.querySelector('svg.simulator-canvas');
    results.push({ id, status: canvas ? 'OK' : 'NO_CANVAS' });
  } catch (err) {
    results.push({ id, status: 'ERROR', error: err.message });
  }
}
console.table(results);
```

### 4b. Test tutti i 4 giochi
- Circuit Detective: aprire, rispondere a 3 domande, verificare miniatura SVG (G53)
- Prevedi e Spiega: aprire, rispondere, verificare feedback
- Circuito Misterioso: aprire, testare probe points (G53)
- CircuitReview: online (con AI) e offline (con fallback G53)

### 4c. Test dashboard con dati reali
- Creare una classe di test
- Aggiungere 2-3 studenti
- Verificare che tutti gli 11 tab funzionano
- Se Supabase configurato: verificare sync cross-device

### 4d. Test compilatore
- Text mode: codice custom -> Compila -> OK
- Scratch mode: blocchi -> Compila -> OK
- Codice default -> deve usare HEX precompilato (G52)

### 4e. Test LIM 1024x768
- Chrome DevTools -> Device toolbar -> 1024x768
- Verificare che layout non rompa
- Touch target >= 44px per tutti i bottoni principali

### 4f. Test offline
- DevTools -> Network -> Offline
- Banner offline visibile (G51)
- Compila disabilitato (G51)
- UNLIM mostra messaggio offline (G51)
- Giochi 3/4 disponibili (G51/G53)
- Esperimento con codice default compila da cache (G52)

### 4g. Test Firefox
- Aprire su Firefox
- Toast "controllo vocale" appare (G51)
- Tutto il resto funziona normalmente

---

## TASK 5 — Anti-regression plugin check (30min)

### Verifiche obbligatorie
```bash
# Tutti i test passano
npx vitest run
# Output atteso: 972+ test PASS (+ nuovi test da G46-G54)

# 0 errori console in production
npm run build
npx vite preview
# Aprire Chrome, F12, Console: ZERO errors

# Bundle size
# Controllare output build: precache deve essere < 5500KB (con HEX files)
# Se > 5500KB, verificare che i HEX siano in runtime cache (non precache)
```

---

## TASK 6 — Score verification con agente indipendente (30min)

### Eseguire audit con agente
Usare `/elab-quality-gate full` per audit completo con scoring.

### Target score: 8.0/10 composito

Breakdown atteso:
| Area | Target | Note |
|------|--------|------|
| Build & Test | 9.0+ | 0 errori, test 972+ |
| Simulatore | 7.5+ | DC funzionante, compiler dedicato, offline |
| UNLIM/Galileo | 6.5+ | <80 parole, offline message, no hallucination |
| Dashboard | 7.0+ | 11 tab, GDPR reale, docs utili |
| Giochi | 7.5+ | Mini-SVG, offline fallback, probe funzionali |
| Scratch | 7.5+ | Friendly errors, undo/redo, type fix, step guard |
| Offline | 8.0+ | Banner, compile cache, HEX precompilati, graceful |
| A11y/WCAG | 7.5+ | Contrast AA, touch 44px, aria labels |
| Performance | 7.5+ | LCP <2.5s, CLS <0.1, bundle ottimizzato |

### Se score < 7.5
- Documentare i gap specifici
- Creare `G56-remediation.md` con i fix rimanenti
- Prioritizzare per impatto: cosa porta piu punteggio con meno sforzo?

### Se score >= 8.0
- Il prodotto e VENDIBILE con fiducia
- Passare a feature development (teacher analytics, student reports, etc.)

---

## POST-SESSIONE OBBLIGATORIA
1. `npm run build` — deve passare
2. `npx vitest run` — deve passare (972+ test, tutti PASS)
3. `/elab-quality-gate` post-session — confronta con baseline
4. Verifica browser: 0 console errors su Chrome, Firefox, Edge
5. Aggiorna `docs/prompts/G46-G55-sanamento-completo.md` con score FINALE reale
6. Se deploy necessario: `npm run build && npx vercel --prod --yes`

## Anti-regressione specifica G55
- [ ] GDPR tab: card gialle senza server, verdi con server — ZERO false
- [ ] Documentation tab: quick-start, FAQ, supporto email — contenuto azionabile
- [ ] Lighthouse: LCP < 2.5s, CLS < 0.1, Accessibility >= 90
- [ ] Nessun chunk > 500KB gzip nel bundle
- [ ] TUTTI i 62 esperimenti si caricano senza errori
- [ ] Tutti i 4 giochi funzionano (3 offline + 1 online)
- [ ] Dashboard: 11 tab funzionanti con dati reali
- [ ] Compiler: text mode + Scratch mode funzionanti
- [ ] LIM 1024x768: layout integro, touch target >= 44px
- [ ] Offline: banner, compile disabilitato, UNLIM message, 3 giochi
- [ ] Firefox: toast voice control, resto funzionante
- [ ] 0 console errors in production build
- [ ] Build passa, tutti i test passano
- [ ] Score composito >= 7.5/10 (target 8.0)

## Score atteso dopo G55: **8.0/10**

---

## NOTA FINALE

Questo e l'ultimo prompt del piano sanamento G46-G55. Se il score finale e >= 7.5:
- Il prodotto e pronto per demo ai committenti (Giovanni, Omaric, Davide)
- Le feature successive (teacher analytics, student reports, YouTube integration) possono iniziare
- La reputazione di Andrea e al sicuro

Se < 7.5: creare G56+ con i gap specifici. Non mascherare i problemi. MASSIMA ONESTA.
