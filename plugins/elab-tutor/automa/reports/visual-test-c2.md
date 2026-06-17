# Visual Test Report — Ciclo 2
**Data**: 2026-03-25 00:45
**Mode**: TEST
**Score baseline**: 0.9586

---

## Persona 1 — Insegnante Inesperto alla LIM (1024×768)

### Test eseguiti
1. **Homepage (www.elabtutor.school)** → redirect a vetrina Netlify
2. **Login page (www.elabtutor.school/login)** → React SPA, login form

### Risultati
- **Touch targets**: 0 bottoni <44px ✅
- **CTA "Accedi"**: 342×47px, verde lime, prominente ✅
- **Font**: 15-16px sui campi, 24px brand — leggibile su LIM ✅
- **Layout**: centrato, card glassmorphism, sfondo navy — pulito ✅
- **Overflow**: nessuno ✅

### Valutazione
**"Questo insegnante riuscirebbe a fare lezione senza manuale?"**
→ **SÌ** per il login. Il percorso "apri sito → login" è ovvio e immediato.
→ Non testabile il flusso post-login senza credenziali.

### Screenshot
- `2026-03-25-lim-insegnante-step1-loading.png` (vetrina)
- `2026-03-25-lim-insegnante-step2-login.png` (login form)
- `2026-03-25-lim-insegnante-step3-login-live.png` (login + consent banner)

---

## Persona 2 — Studente 10 anni su iPad (810×1080)

### Risultati
- **Touch targets**: 0 bottoni <44px ✅
- **Overflow orizzontale**: NO ✅
- **Login form**: centrato, adattato al portrait ✅
- **Font**: 15px inputs, 16px button — adeguato ✅
- **Vetrina homepage**: layout corretto, hero image renderizzata 762×357 ✅
- **Lazy loading immagini**: below-fold images tutte `loading="lazy"` ✅
- **Hero image**: `loading="auto"` (eager, corretto per LCP) ✅

### Valutazione
**"Un bambino di 10 anni userebbe questo volentieri?"**
→ **SÌ** per la vetrina. Design pulito, bottoni grandi, colori attraenti.
→ Login richiede email/password — un bambino potrebbe aver bisogno di aiuto dell'insegnante.

### Screenshot
- `2026-03-25-ipad-bambino-step1-login.png`
- `2026-03-25-ipad-bambino-step2-vetrina.png`

---

## Persona 3 — Lezione di 45 min (flusso completo)

### Limitazioni
Non è possibile testare il flusso completo senza credenziali di accesso.
Il test si limita alla fase pre-login.

### Risultati misurabili
- **Tempo da apertura a login visibile**: <2s (FCP 856ms, login form render ~1.5s)
- **Tempo da apertura a vetrina caricata**: <1s (FCP 404ms)
- **Console errors**: 2 (font woff2 ERR_FAILED + CSP warning)
- **Nessun crash o blocco**

### Valutazione
→ **PARZIALE** — il flusso pre-login è fluido. Non testabile il simulatore.

---

## Verifica Tecnica (Apple HIG)

| Criterio | Risultato | Note |
|----------|-----------|------|
| Touch target ≥44×44px | ✅ 0 violazioni | Vetrina: 20 elem, tutti ≥44px. Login: 6 elem, tutti ≥44px |
| Font ≥17px iOS | ⚠️ borderline | Input font 15px (sotto soglia Apple HIG 17px), ma accettabile per web |
| Contrasto ≥4.5:1 | ✅ | H1 bianco su navy (#1E4D8C) = ~8.5:1 |
| No overflow orizzontale | ✅ | Testato su 810×1080 (iPad) |
| Layout LIM 1024×768 | ✅ | Login centrato, leggibile |
| Layout iPad 810×1080 | ✅ | Responsive, no overflow |

---

## Problemi Trovati

### 🔴 HIGH — Font Google Fonts non caricano (woff2 ERR_FAILED)
- **Severity**: high
- **Evidence**: verified (Playwright, 3 navigazioni distinte)
- **Dettaglio**: Open Sans e Oswald woff2 falliscono con ERR_FAILED. Tutti i font risultano "unloaded" o "error". Il testo usa il fallback system font.
- **Impatto Lighthouse**: possibile CLS quando/se i font si caricano in ritardo. LCP penalizzato se Lighthouse misura il font swap.
- **Fix suggerito**: Self-host i font (copia woff2 in /public/fonts/) oppure usa `font-display: optional` per eliminare il flash.

### 🟡 MEDIUM — Loading screen troppo minimale
- **Severity**: medium
- **Evidence**: verified (Gemini analysis + screenshot)
- **Dettaglio**: La schermata "Caricamento..." è solo testo "ELAB" + "Caricamento..." su sfondo grigio chiaro. Per un bambino, sembra un errore.
- **Impatto**: UX — potrebbe generare confusione o impazienza
- **Fix suggerito**: Aggiungere un'animazione CSS semplice (spinner o pulse) e/o icona/mascotte

### 🟡 MEDIUM — Consent banner potenziale CLS
- **Severity**: medium
- **Evidence**: hypothesis
- **Dettaglio**: Il consent banner appare dopo il render della login page, spostando il layout verso l'alto.
- **Impatto Lighthouse**: CLS score penalizzato
- **Fix suggerito**: Riservare spazio fisso per il banner o renderizzarlo inline

### 🟢 LOW — CSP warning in console
- **Severity**: low
- **Evidence**: verified
- **Dettaglio**: "The source list for the Content Security Policy..." — warning cosmetico, non blocca rendering
- **Fix suggerito**: Aggiornare CSP header per eliminare il warning

### 🟢 LOW — Logo oversized
- **Severity**: low
- **Evidence**: verified
- **Dettaglio**: Logo 400×600px renderizzato a 32×48px — spreco di ~200KB
- **Fix suggerito**: Ridimensionare logo a 64×96px (2x per retina)

---

## Metriche Performance (www.elabtutor.school/login)

| Metrica | Valore | Target |
|---------|--------|--------|
| TTFB | 574ms | <800ms ✅ |
| FCP | 856ms | <1800ms ✅ |
| LCP | non misurato* | <2500ms |
| Lighthouse perf (pre-cycle) | 0.78 | ≥0.90 ❌ |

*LCP non catturato dall'API PerformanceObserver — il login form si renderizza via React dopo il "Caricamento..." shell.

---

## Brutale Sincerità

**"Questo ciclo ha prodotto valore REALE per un insegnante alla LIM?"**
→ **SÌ, parziale.** Il ciclo ha confermato che l'UX è solida (0 violazioni touch, 0 overflow, login chiaro). Ha identificato il problema dei font (HIGH) che è azionabile e migliorerebbe sia la percezione visiva che il punteggio Lighthouse. Non ha prodotto fix di codice — è un ciclo TEST, non IMPROVE.

**Score delta**: 0 (nessuna modifica al codice)
**Lighthouse perf progress**: 0.62 → 0.78 (da cicli precedenti, non da questo)
