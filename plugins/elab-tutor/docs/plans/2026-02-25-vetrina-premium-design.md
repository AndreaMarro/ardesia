# Vetrina Premium ELAB — Design Document

**Data**: 25/02/2026 — Session 48
**Approccio**: Clone editoriale di scuole.html (HTML statico su Netlify)
**Target**: `newcartella/vetrina.html` + redirect da ShowcasePage.jsx

---

## Decisioni Chiave

| Decisione | Scelta | Motivazione |
|-----------|--------|-------------|
| Piattaforma | HTML statico su Netlify | SEO nativo, CDN, stessa qualita di scuole.html |
| Font | Poppins (display) + Roboto (body) | Coerenza col sito pubblico |
| Palette | Navy #1E4D8C, Lime #7CB342, Orange #E8941C, Red #E54B3D | Palette ufficiale ELAB |
| Foto | Mix esistenti + placeholder per mancanti | Massimo riuso asset |
| Demo Galileo | Conversazione HTML su elettronica/circuiti | Coerente col prodotto |
| ShowcasePage.jsx | Redirect a versione Netlify | Nessuna duplicazione |

---

## Architettura File

```
newcartella/
  vetrina.html              ← NUOVA pagina (14 sezioni)
  css/
    vetrina.css             ← CSS dedicato (variabili + layout + animazioni)
  images/
    vetrina/
      hero-simulator.png    ← 02-simulatore-running.png (rinominata)
      simulator-rgb.png     ← 01-simulatore-rgb.png
      galileo-chat.png      ← 05-galileo-chat.png
      teacher-confused.jpg  ← PLACEHOLDER (da fornire)
      editor-arduino.png    ← DA CATTURARE (screenshot)
      volumi-grid.png       ← DA CATTURARE (screenshot)

elab-builder/src/components/
  ShowcasePage.jsx          ← Modificata: redirect a Netlify
```

---

## 14 Sezioni — Specifica Dettagliata

### 1. HERO
- **Sfondo**: gradient 135deg #0F2744 → #1E4D8C → #2D6DB5
- **Badge**: "BETA PUBBLICA" pill lime
- **Titolo**: "ELAB Tutor Galileo" — ELAB in lime, resto bianco, Poppins 800
- **Sottotitolo**: "Il laboratorio di elettronica interattivo per studenti e insegnanti."
- **CTA**: Accedi (lime bg) + Registrati Gratis (outline bianco)
- **Stats**: 69 Esperimenti / 138 Quiz / 21 Componenti / AI Integrata
- **Screenshot**: hero-simulator.png (MOSFET + multimetro), radius 12px, ombra 0 20px 60px
- **Animazioni**: fade-in su scroll, contatore animato numeri (CSS counter o JS leggero)
- **Link CTA**: Accedi → `https://elab-builder.vercel.app/#login`, Registrati → `#register`

### 2. PHOTO BREAK — Classe
- **Immagine**: `classroom-electronics-03.jpg` (close-up mani su componenti)
- **Layout**: full-width, height 420px, object-fit cover
- **Nessun testo sovrapposto**

### 3. EMPATIA INSEGNANTE
- **Sfondo**: #F9FAFB
- **Layout**: split 2-column grid, gap 64px
- **Sinistra**: Foto insegnante perplesso — `teacher-confused.jpg` PLACEHOLDER
- **Destra**:
  - Domanda retorica: "E se il docente non e esperto di elettronica?"
  - Callout lime (bordo sinistro 4px #7CB342, bg rgba(124,179,66,0.06)):
    "Con ELAB il docente non sale in cattedra: si siede accanto ai ragazzi e impara insieme a loro. Non servono competenze tecniche — il percorso guida tutti, passo dopo passo."
  - Badge pill: "Insieme"

### 4. SIMULATORE — Split reverse
- **Sfondo**: white
- **Layout**: split 2-column, testo sinistra + screenshot destra
- **Titolo**: "Simulatore Circuiti Proprietario"
- **Checklist** (5 punti con checkmark lime):
  - 69 esperimenti reali
  - 21 componenti SVG
  - Wire Bezier realistici
  - Compilatore Arduino integrato
  - Simulazione in tempo reale (AVR)
- **Callout navy** (bordo 4px #1E4D8C): "Nessun software da installare. Apri il browser e inizia."
- **Screenshot**: simulator-rgb.png (RGB LED, entry-level)

### 5. FUNZIONALITA ZOOMATE — Griglia 2x2
- **Sfondo**: #F9FAFB
- **Titolo**: "Cosa troverai dentro ELAB"
- **Sottotitolo**: "Ogni strumento e progettato per imparare facendo"
- **4 card** (2x2 grid, gap 32px):
  1. Galileo AI → galileo-chat.png + "Il tuo tutor personale"
  2. LED RGB in azione → simulator-rgb.png + "Costruisci e osserva in tempo reale"
  3. Editor Arduino → editor-arduino.png PLACEHOLDER + "Scrivi, compila, esegui"
  4. 3 Volumi → volumi-grid.png PLACEHOLDER + "Dal LED al MOSFET: 38+18+13 esperimenti"
- **Hover**: scale(1.02) + ombra piu profonda
- **Immagini**: border-radius 12px + ombra

### 6. PHOTO BREAK — Bambino
- **Immagine**: `bambino-circuito-1.jpg`
- **Layout**: full-width, 420px, object-fit cover

### 7. GALILEO DEMO — Conversazione HTML
- **Sfondo**: white
- **Titolo**: "Chiedi a Galileo"
- **Sottotitolo**: "Il tuo tutor AI risponde in italiano, in tempo reale"
- **Chat mockup** (HTML statico, stile Galileo reale):
  - Container: border-radius 16px, bg navy scuro #0F2744, padding 32px
  - Studente (destra): "Come funziona un LED? Perche serve una resistenza?"
  - Galileo (sinistra): Risposta completa su LED + resistenza + suggerimento esperimento
  - Quick actions: [Esperimento] [Diagnosi] [Altro] — pill lime
- **Caption**: "Galileo usa intelligenza artificiale per guidarti — non sostituisce il docente, lo affianca."

### 8. BENEFICI — 3 Card
- **Sfondo**: #F9FAFB
- **Titolo**: "Chi beneficia di ELAB?"
- **3 card** (3-column grid, gap 32px):
  1. Studente (accento lime): impara facendo, 69 esp, AI spiega, quiz
  2. Insegnante (accento orange): no esperto, dashboard, percorso pronto, CSV
  3. Scuola (accento navy): zero install, qualsiasi device, GDPR, scalabile
- **Hover**: translateY(-4px) + ombra profonda
- **Bar accento**: 4px top border per card

### 9. PHOTO BREAK — Classe full
- **Immagine**: `classroom-electronics-04.jpg`
- **Layout**: full-width, 420px, object-fit cover

### 10. FEATURES NAVY — 6 item griglia
- **Sfondo**: gradient 135deg #0F2744 → #1E4D8C
- **Titolo**: "Tecnologia che fa la differenza" (bianco)
- **6 card** (3x2 grid):
  1. Simulatore Proprietario — Motore AVR con solver KVL/KCL
  2. AI Integrata — Tutor in italiano con azioni rapide
  3. Dashboard Docente — Monitora progressi, export CSV
  4. Editor Arduino — Autocomplete, errori tradotti
  5. 53 Sfide Interattive — Detective, POE, Review con stelle
  6. Privacy First — Dati locali, GDPR, no tracking
- **Card**: bg rgba(255,255,255,0.05), border rgba(255,255,255,0.1), radius 12px
- **NESSUNA menzione di nanobot, n8n, backend specifici**

### 11. APPRENDIMENTO ORIZZONTALE — Split reverse
- **Sfondo**: white
- **Layout**: testo sinistra, foto destra (invertito)
- **Badge pill lime**: "Insieme"
- **Titolo**: "Apprendimento Orizzontale"
- **Testo**: "In ELAB non c'e chi sa e chi non sa. C'e chi esplora insieme. Il docente diventa guida, lo studente diventa protagonista. L'AI supporta entrambi."
- **Checklist**: Percorso guidato / Nessuna competenza tecnica / AI come supporto
- **Foto**: `classroom-electronics-02.jpg` (studenti con breadboard)

### 12. CITAZIONE FRANKLIN
- **Sfondo**: #F9FAFB
- **Padding**: 80px 0
- **Virgolette decorative**: lime #7CB342, 80px, opacity 0.15
- **Citazione**: "Dimmi e io dimentico, mostrami e io ricordo, coinvolgimi e io imparo."
- **Attribuzione**: "— Benjamin Franklin"
- **Stile**: Poppins italic 28px, color #1E4D8C, max-width 600px, centered

### 13. CTA CARD FINALE
- **Sfondo**: gradient navy scuro
- **Card bianca centrata**: max-width 640px, radius 16px, padding 48px
- **Logo**: ELAB (testo lime)
- **Titolo**: "Richiedi una Demo" — Poppins 800
- **Sottotitolo**: "Scopri come ELAB puo trasformare il laboratorio della tua scuola"
- **CTA**: Richiedi Demo (lime bg, grande) + Accedi al Tutor (outline navy)
- **Tags pill**: 69 Esp. / AI / Arduino / Quiz / Dashboard / 3 Volumi / GDPR
- **Link Demo**: mailto:info@omaricelettronica.it (o form contatto)
- **Link Tutor**: https://elab-builder.vercel.app/#login

### 14. FOOTER — 3 Colonne
- **Sfondo**: #0F2744
- **Testo**: rgba(255,255,255,0.7)
- **3 colonne**:
  1. ELAB — descrizione + copyright + P.IVA
  2. PRODOTTO — Simulatore, Galileo AI, Dashboard, Quiz, Giochi, Scuole (link), Privacy, Termini
  3. CONTATTI — email, sito, sede Torino
- **Bottom bar**: copyright + Privacy + Termini

---

## CSS Architecture

```css
/* vetrina.css — Design Tokens */
:root {
  --navy: #1E4D8C;
  --navy-dark: #163A6A;
  --navy-darkest: #0F2744;
  --lime: #7CB342;
  --orange: #E8941C;
  --red: #E54B3D;
  --text-dark: #111827;
  --text-light: rgba(255,255,255,0.85);
  --bg-white: #FFFFFF;
  --bg-light: #F9FAFB;
}

/* Layout */
.container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
.section { padding: 100px 0; }
.split { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
.split--reverse { direction: rtl; } .split--reverse > * { direction: ltr; }

/* Photo breaks */
.img-break { width: 100%; height: 420px; object-fit: cover; }

/* Animations */
.fade-in { opacity: 0; transform: translateY(24px); transition: all 0.6s ease; }
.fade-in.visible { opacity: 1; transform: translateY(0); }
```

---

## Responsive Breakpoints

| Breakpoint | Comportamento |
|------------|---------------|
| >= 1100px | Layout completo, split 2-col |
| 768-1099px | Split stack verticale, padding ridotto |
| < 768px | Mobile: single column, font ridotti, photo breaks 280px |

---

## Asset da Preparare

| File | Stato | Dimensione target | Note |
|------|-------|-------------------|------|
| hero-simulator.png | Da copiare | 800x500 | Da 02-simulatore-running.png |
| simulator-rgb.png | Da copiare | 600x400 | Da 01-simulatore-rgb.png |
| galileo-chat.png | Da copiare | 600x400 | Da 05-galileo-chat.png |
| teacher-confused.jpg | PLACEHOLDER | 500x600 | Foto insegnante perplesso |
| editor-arduino.png | DA CATTURARE | 600x400 | Screenshot editor Arduino |
| volumi-grid.png | DA CATTURARE | 600x400 | Screenshot griglia volumi |
| classroom-electronics-02.jpg | Esistente | gia ok | Studenti con breadboard |
| classroom-electronics-03.jpg | Esistente | gia ok | Close-up mani |
| classroom-electronics-04.jpg | Esistente | gia ok | Full classroom |
| bambino-circuito-1.jpg | Esistente | gia ok | Bambino con circuito |

---

## ShowcasePage.jsx — Redirect

```jsx
// ShowcasePage.jsx — Redirect to Netlify premium vetrina
import { useEffect } from 'react';

export default function ShowcasePage() {
  useEffect(() => {
    window.location.replace('https://funny-pika-3d1029.netlify.app/vetrina.html');
  }, []);
  return null;
}
```

---

## Metriche di Successo

- **Lighthouse Performance**: >= 90 (statico, CDN)
- **Lighthouse SEO**: >= 95 (meta tags, OG, structured data)
- **Time to Interactive**: < 2s
- **Largest Contentful Paint**: < 2.5s
- **Visual quality**: pari a scuole.html (9/10)
- **Zero menzioni**: nanobot, n8n, backend specifici
- **Foto non tagliate**: tutte object-fit cover con height adeguato
