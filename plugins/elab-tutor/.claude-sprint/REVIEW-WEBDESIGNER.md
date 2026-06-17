# Review WebDesigner -- ELAB Tutor

**Reviewer**: Senior WebDesigner (15 anni esperienza)
**Data**: 14/02/2026
**Scope**: Design system, tipografia, spacing, colori, responsiveness, micro-interazioni, consistenza

---

## Voto: 5/10

Un 5 onesto. C'e' un design system scritto con buone intenzioni (`design-system.css` con 155 linee di token ben organizzati), ma poi viene sistematicamente ignorato dalla maggior parte del codice. Il risultato e' un progetto con due anime: un nucleo ben progettato (toolbar simulatore, sidebar tutor, chat overlay) e un mare di inline styles e colori hardcoded che tradiscono quei principi.

---

## Top 3 cose fatte bene

### 1. Design System Token Architecture (`src/styles/design-system.css`)
Il file dei design token e' genuinamente ben fatto. 4px grid spacing, scale tipografica coerente, shadow progression logica (xs/sm/md/lg/xl), z-index scale ordinata, variabili per transition, radius, e touch targets. Include anche alias legacy per backward compat, il che dimostra pensiero evolutivo. L'inclusione di `prefers-reduced-motion` e `--touch-min: 44px` sono scelte mature.

### 2. Responsive Architecture del Tutor (`tutor-responsive.css`)
L'approccio responsive e' solido: 5 breakpoint coerenti (0-599, 600-767, 768-1023, 1024-1439, 1440+), CSS Grid per il layout principale, sidebar collapse-on-hover per tablet, bottom sheet pattern per mobile, `env(safe-area-inset-bottom)` per notch iPhone, `dvh` units come fallback moderno. L'animazione chatSlideIn e' fluida. Architettonicamente, questa e' la parte migliore del progetto.

### 3. ControlBar Component Architecture (`panels/ControlBar.jsx`)
Il componente ControlBar e' ben strutturato: ToolbarButton riutilizzabile con prop semantiche (variant, active, disabled), overflow menu con keyboard navigation completa (ArrowDown/Up, Home/End, Escape), ARIA attributes corretti (role="toolbar", aria-label, aria-haspopup, aria-expanded). Le icone SVG sono consistenti (18x18, strokeWidth 2). Questo e' l'unico componente che sembra progettato da qualcuno con esperienza in UI.

---

## Top 5 problemi critici

### 1. CRITICO: ~1,488 inline style occorrenze in JSX -- Design System bypassato
**File**: `src/App.jsx:231-338`, `src/components/simulator/panels/ExperimentPicker.jsx:269-519`, e 28+ altri file JSX

Il progetto ha un design system con CSS variables ben definite, ma poi l'80%+ dei componenti usa inline styles con valori hardcoded. ExperimentPicker.jsx ha un oggetto `S` con 44 proprietà style inline contenente 44 hex colors hardcoded (`#E5E5E5`, `#F0F0F0`, `#FFFFFF`, `#1A1A2E`, `#666`, `#999`, etc.) che non referenziano mai `var(--color-*)`. App.jsx definisce `topBarStyles` con 11 oggetti inline che usano una font family completamente diversa (`-apple-system, BlinkMacSystemFont, "Segoe UI"`) dal design system (`Inter, Open Sans`).

Conseguenza: cambiare un colore o un font richiede modifiche in 30+ file. Il design system e' decorativo, non funzionale.

### 2. CRITICO: Scala tipografica incoerente -- 7+ font size diverse senza gerarchia
**File**: `tutor-responsive.css:163` (0.58rem), `tutor-responsive.css:179` (0.72rem), `tutor-responsive.css:221` (0.72rem), `tutor-responsive.css:282` (0.62rem), `tutor-responsive.css:554` (0.85rem), `tutor-responsive.css:624` (0.75rem), `tutor-responsive.css:807` (0.82rem)

Il design system definisce una scala: 12/14/15/16/18/24/32/40px. Ma nel codice reale si trovano: 0.52rem, 0.58rem, 0.62rem, 0.68rem, 0.72rem, 0.75rem, 0.78rem, 0.8em, 0.82rem, 0.85rem, 0.88rem, 0.92rem, 1.05rem, 1.1rem, 1.15rem. Sono 15 dimensioni diverse solo nel tutor responsive. Nessuna corrisponde alla scala del design system. Il topbar subtitle a 0.52rem (~8.3px) e' sotto il minimo WCAG di 12px per qualsiasi testo.

### 3. CRITICO: Due sistemi di colori paralleli non riconciliati
**File**: `design-system.css` vs `ElabSimulator.css` vs `layout.module.css` vs `overlays.module.css` vs `codeEditor.module.css`

Il design system usa `--color-*` nomenclature. ElabSimulator.css usa `--elab-*` nomenclature. I CSS module del simulatore non usano NESSUNA variabile -- sono 100% hex hardcoded (104 occorrenze). Esempio: `layout.module.css:17` usa `#E8E4DB` per i bordi, `tutor-responsive.css:246` usa `#E2E8F0`, `design-system.css` definisce `--color-border: #E5E5EA`. Sono 3 grigi diversi per lo stesso concetto (bordo neutro).

Colori bordo nel progetto: `#E5E5E5`, `#E5E5EA`, `#E8E4DB`, `#E2E8F0`, `#F0F0F0`, `#F0EDE6`, `#CBD5E1`, `#313244`, `#45475A`, `#D1D1D6`. Sono 10 grigi-bordo diversi.

### 4. GRAVE: Inline style object nella Top Bar rende impossibile responsive design
**File**: `src/App.jsx:231-338`

La topbar principale dell'app (la barra nera in cima con "ELAB Tutor") e' interamente definita come inline styles JS. Non ha NESSUN breakpoint. I link hanno `fontSize: '13px'` fisso, l'hamburger menu usa `fontSize: '20px'` con padding `6px 10px` (non raggiunge 44px touch target), il mobile menu e' un `position: absolute` senza max-height o scroll. Se il contenuto eccede, trabocca fuori schermo.

Inoltre usa `fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'` -- un font stack completamente diverso da tutto il resto del progetto (Inter/Open Sans/Oswald). Questa barra sembra appartenere a un altro progetto.

### 5. GRAVE: Mancano focus states per la maggior parte dei componenti interattivi
**File**: `ExperimentPicker.jsx:341` (`outline: 'none'`), `ExperimentPicker.jsx:388` (`outline: 'none'`), `ExperimentPicker.jsx:462` (`outline: 'none'`)

ExperimentPicker imposta `outline: 'none'` su volume cards, chapter cards e experiment cards SENZA fornire un focus-visible alternativo. Questo significa che gli utenti che navigano con tastiera non vedono dove si trova il focus. I close buttons nei CSS module hanno `min-width/height: 44px` ma nessun focus ring. Solo `tutor-responsive.css:1152-1159` definisce focus-visible, ma solo per i componenti del tutor -- il simulatore ne e' completamente privo.

---

## 10 suggerimenti concreti di miglioramento

### 1. Eliminare il 90% degli inline styles e usare i design token
Convertire ExperimentPicker.jsx, App.jsx topBarStyles, e tutti gli style objects in CSS modules o classi che referenziano `var(--color-*)`, `var(--space-*)`, `var(--radius-*)`. Priorita: ExperimentPicker (44 inline + 44 hex) e App.jsx topBar (11 inline + 9 hex).

### 2. Consolidare la scala tipografica a massimo 7 step
Eliminare i 15 valori rem arbitrari e mappare tutto alla scala del design system. Suggerimento:

| Token | Valore | Uso |
|-------|--------|-----|
| --font-size-xs | 12px | Solo badge/label tecnici |
| --font-size-sm | 14px | Body secondario, metadata |
| --font-size-base | 15px | Body principale |
| --font-size-md | 16px | Titoli pannelli |
| --font-size-lg | 18px | Titoli sezione |
| --font-size-xl | 24px | Titoli pagina |
| --font-size-2xl | 32px | Hero |

Poi grep per `rem` e `px` nei CSS e sostituire con `var(--font-size-*)`.

### 3. Unificare i bordi grigi a massimo 3 varianti
Attualmente ci sono 10 grigi-bordo diversi. Consolidare in:
- `var(--color-border)` per bordi normali
- `var(--color-border-hover)` per hover/active
- `var(--color-border-strong)` per separatori prominenti

Fare search & replace globale.

### 4. Aggiungere focus-visible a TUTTI i componenti interattivi
Creare una regola globale:
```css
button:focus-visible, [role="button"]:focus-visible, a:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```
E rimuovere tutti gli `outline: 'none'` inline.

### 5. Muovere la topBar App.jsx in un CSS module dedicato
Creare `src/components/TopBar.module.css` con responsive breakpoints, eliminare `topBarStyles` oggetto JS, e usare il font stack del design system (`var(--font-sans)`).

### 6. Aggiungere hover/active states consistenti
Attualmente ExperimentPicker usa `onMouseEnter/Leave` JS per hover. Questo non funziona su mobile, non rispetta reduced-motion, e duplica logica che CSS fa nativamente meglio. Convertire in classi CSS con `:hover` e `:active` pseudo-selettori.

### 7. Ridurre le shadow da ~8 varianti hardcoded a 3 token
Le shadow nel progetto: `0 1px 2px`, `0 1px 3px`, `0 2px 8px`, `0 4px 12px`, `0 4px 20px`, `0 6px 20px`, `0 8px 32px`, `0 8px 40px`, `0 10px 20px`, `0 12px 48px`, `0 20px 40px`. Sono 11 shadow diverse. Consolidare nei 5 token gia definiti (`--shadow-xs/sm/md/lg/xl`).

### 8. Creare un layer di componenti UI riutilizzabili
I pattern ripetuti nel codice (card con header/body/footer, badge, back button, panel header) dovrebbero diventare componenti CSS classi nel design system. Attualmente ogni pannello reinventa padding, border, borderRadius.

### 9. Rivedere i touch targets nel tutor
`topbar-sidebar-toggle` e' 36x36px (`tutor-responsive.css:119`), sotto il minimo 44px. `sidebar-collapse-btn` e' 32x32px (`:358`). `chat-overlay-btn` e' 30x30px (`:478-479`), sale a 36px solo con `@media (pointer: coarse)` ma rimane sotto 44px. Il design system definisce `--touch-min: 44px` ma non lo applica.

### 10. Eliminare il font-size sotto 12px
`topbar-subtitle` a 0.52rem (`tutor-responsive.css:958`, mobile) = 8.3px. `sidebar-section-label` a 0.62rem (`:282`) = 9.9px. Questi sono illeggibili e violano WCAG. Minimo assoluto dovrebbe essere `var(--font-size-xs)` = 12px.

---

## Verdict finale

Il progetto soffre di una malattia comune: **il design system esiste ma nessuno lo usa**. I 155 token in `design-system.css` sono un ottimo punto di partenza -- la visione architetturale e' corretta. Ma l'esecuzione e' frammentata: 1,488 inline styles, 10+ grigi-bordo diversi, 15+ dimensioni font non nella scala, 3 font stack diversi, touch target sotto WCAG.

La parte migliore (tutor responsive layout + ControlBar) dimostra che quando il design viene applicato con disciplina, il risultato e' professionale. La parte peggiore (ExperimentPicker, App topbar, inline styles ovunque) dimostra che la maggior parte del codice e' stata scritta in fretta senza consultare il design system.

**Per arrivare a 7/10**: eliminare inline styles dei componenti principali, consolidare colori e tipografia sui token, aggiungere focus-visible globale.

**Per arrivare a 9/10**: ricostruire tutti i componenti UI come classi CSS module che consumano design token, eliminare hover JS a favore di CSS pseudo-classi, creare component library documentata.

Attuale stato: il design system e' una promessa non mantenuta. Il codice dice "ho un sistema", ma poi fa di testa sua in 30 file su 30.
