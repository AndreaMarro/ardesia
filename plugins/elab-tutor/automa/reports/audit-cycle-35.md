# Audit Cycle 35 — Bug Hunting Report

**Data**: 2026-03-26
**Modo**: AUDIT (ricerca-bug)
**Autore**: Andrea Marro — ELAB Tutor © 2026

---

## Bug Trovati: 5

### BUG-1: Font self-hosted mai importati (P1)
- **Severity**: high
- **Evidence**: verified
- **Descrizione**: `src/styles/fonts.css` contiene le dichiarazioni @font-face per font self-hosted (Open Sans, Oswald, Fira Code in woff2). Ma il file **non è mai importato** in `main.jsx` né altrove. Nel frattempo `src/index.css:2` importa ancora Google Fonts da CDN (`fonts.googleapis.com`), che fallisce su reti scolastiche con proxy restrittivi → console error `ERR_FAILED` su ogni page load.
- **File coinvolti**:
  - `src/index.css:2` — @import Google Fonts (da rimuovere)
  - `src/styles/fonts.css` — font self-hosted (da importare in main.jsx)
  - `src/main.jsx` — manca `import './styles/fonts.css'`
- **Fix**: Rimuovere l'import CDN da index.css, aggiungere `import './styles/fonts.css'` in main.jsx
- **Impatto**: Ogni caricamento pagina genera 1-2 console error. Su reti scolastiche con firewall/proxy, i font non caricano affatto → fallback system font.

### BUG-2: URL Netlify hardcoded (P2 — task "done" mai fixato)
- **Severity**: medium
- **Evidence**: verified
- **Descrizione**: Il task P2-058 è marcato come "done" nell'orchestratore ma il URL `funny-pika-3d1029.netlify.app` è ancora hardcoded in 3 file sorgente. Se Netlify rigenera il sito su un nuovo subdomain, tutti i link rompono.
- **File coinvolti**:
  - `src/components/ShowcasePage.jsx:11` — redirect principale
  - `src/components/social/Navbar.jsx:35` — link "Per le Scuole"
  - `src/components/VetrinaSimulatore.jsx:416` — link scuole
  - `vercel.json:13` — CSP connect-src whitelist
  - Footer vetrina: "Sito Web" link mostra URL tecnico
- **Fix**: Creare costante `VETRINA_URL` in un file config e usarla ovunque. Idealmente, usare `elabtutor.school` come dominio.

### BUG-3: Contatori stats vetrina bloccati a "0" (P1)
- **Severity**: high
- **Evidence**: verified (Playwright)
- **Descrizione**: La sezione stats nell'hero della vetrina mostra "0 Esperimenti", "0 Quiz", "0 Componenti". Il markup HTML contiene il valore "0" ma **non esiste alcuno script JavaScript per l'animazione countUp** o IntersectionObserver. I numeri non si animano mai — restano a zero.
- **File coinvolti**: Vetrina Netlify (`vetrina.html`) — file esterno
- **Fix**: Aggiungere script countUp con IntersectionObserver che anima i valori target (69, 53, 21) quando la sezione entra nel viewport.
- **Impatto**: Un visitatore vede "0 Esperimenti" — comunicazione di valore completamente rotta. Primo contatto con il prodotto.

### BUG-4: CSP errore su vetrina Netlify (P2)
- **Severity**: medium
- **Evidence**: verified (console)
- **Descrizione**: La vetrina Netlify ha ancora `https://n8n.*.hostinger.com` nella CSP connect-src. Il pattern wildcard nel subdomain (`*.`) è invalido per CSP → console error su ogni page load. Il fix era stato applicato a `public/_headers` (Netlify) e `vercel.json` (Vercel), ma la vetrina HTML ha la sua CSP inline o headers separati.
- **Console error**: `The source list for Content Security Policy directive 'connect-src' contains an invalid source: 'https://n8n.*.hostinger.com'`
- **Fix**: Aggiornare gli headers della vetrina Netlify con il pattern corretto `https://n8n.srv1022317.hstgr.cloud`

### BUG-5: Navbar collassa in hamburger su iPad landscape 1024px (P3)
- **Severity**: low
- **Evidence**: verified (screenshot)
- **Descrizione**: A 1024px (iPad landscape) la navbar della vetrina collassa in hamburger menu. C'è spazio sufficiente per mostrare tutti i 7 link. Il breakpoint è probabilmente troppo aggressivo (>1024px per la nav full).
- **File coinvolti**: Vetrina Netlify CSS (media query breakpoint)
- **Fix**: Abbassare il breakpoint della navbar a ~900px o usare un layout più compatto per tablet.
- **Impatto**: UX minore — un tap extra per navigare su iPad.

---

## Riepilogo Severity

| Severity | Count | Bug IDs |
|----------|-------|---------|
| high     | 2     | BUG-1, BUG-3 |
| medium   | 2     | BUG-2, BUG-4 |
| low      | 1     | BUG-5 |

## Bug nel codebase vs Netlify esterno

| Location | Bug IDs |
|----------|---------|
| Codebase (fixabile) | BUG-1, BUG-2 |
| Netlify vetrina (esterno) | BUG-3, BUG-4, BUG-5 |

## CoV — Chain of Verification

1. **Claim senza prova?** No — ogni bug ha evidence verificata con Playwright/Grep
2. **Contraddizioni?** Sì: P2-058 marcato "done" ma non fixato → segnalato
3. **Regressioni?** No nuove regressioni — build non toccato
4. **Build passa?** Non toccato (audit-only)
5. **Principio Zero?** BUG-3 è critico per il principio zero — un insegnante che vede "0 esperimenti" nella landing non capisce il valore del prodotto
6. **Output riusabile?** Sì — 2 task YAML creati per bug fixabili
7. **Severity assegnata?** Sì, per tutti i 5 bug
