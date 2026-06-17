# G11 FASE 1 — Accesso Zero-Friction

**Data**: 28/03/2026
**Obiettivo**: Da 4+ tap a 2 tap per il primo LED
**Status**: IMPLEMENTATO — build PASSA

---

## Cosa e' stato fatto

### 1. Rotta `#prova` senza login
- **App.jsx**: Aggiunto `'prova'` a `VALID_HASHES`
- **App.jsx**: Nuovo blocco routing per `currentPage === 'prova'` — carica `ElabTutorV4` con `provaMode` prop, SENZA RequireAuth/RequireLicense
- **Zero duplicazione**: usa lo stesso componente ElabTutorV4 e NewElabSimulator

### 2. Filtro Volume 1
- **ElabTutorV4.jsx**: Accetta `provaMode` prop
- In provaMode: `userKits={['Volume 1']}` — il filtro esistente in ExperimentPicker funziona nativamente
- In provaMode: `activeTab` parte su `'simulator'` (non `'manual'`)
- In provaMode: `pendingExperimentId` = `'v1-cap6-esp1'` — il primo LED si carica automaticamente

### 3. Banner non-bloccante
- Barra navy in cima: "Versione di prova — Volume 1 (38 esperimenti)"
- Bottone verde "Tutti i 70 esperimenti" → naviga a registrazione
- NON modale, NON popup, NON overlay — non interrompe la lezione

### 4. CTA in ShowcasePage/VetrinaSimulatore
- Bottone "Prova Subito — Senza Login" nell'hero section
- Colore lime #4A7A25, 48px altezza, hover scale
- aria-label per accessibilita'

## Percorso utente risultante

1. Prof.ssa apre elab-builder.vercel.app → ShowcasePage (hero con bottone "Prova Subito")
2. Click "Prova Subito" → `#prova` → ElabTutorV4 in provaMode → Simulatore con v1-cap6-esp1 gia' caricato
3. **2 tap dal browser al primo LED** (target: <=2 ✅)

## Verifiche
- Build: PASSA (26.54s)
- Bundle: +0.4 KB (banner JSX) — trascurabile
- Regressioni: ZERO (la rotta `#tutor` non e' stata toccata)
- StudentTracker: funziona anche senza login (device UUID)

## File modificati
- `src/App.jsx` — +16 righe (rotta + VALID_HASHES)
- `src/components/tutor/ElabTutorV4.jsx` — +25 righe (provaMode prop, banner, tab/experiment init)
- `src/components/VetrinaSimulatore.jsx` — +22 righe (CTA "Prova Subito")
