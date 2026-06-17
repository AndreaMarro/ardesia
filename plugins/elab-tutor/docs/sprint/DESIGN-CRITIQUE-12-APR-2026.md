# Design Critique — ELAB Tutor
> Data: 2026-04-12 | Auditor: Claude Opus 4.6 | Metodo: Screenshot + inspect + snapshot in Chrome

---

## Overall Impression

L'interfaccia ha un'identita' visiva coerente (palette Navy/Lime/Orange, font Oswald+Open Sans) e il simulatore funziona. Ma il **Principio Zero e' violato**: un docente che arriva per la prima volta non sa cosa fare. L'UNLIM window copre il simulatore, la toolbar non e' autoesplicativa, e non c'e' nessun guided tour.

**Score Design: 5.5/10** — Funzionale ma non "magico". Per la vendita serve un 7+.

---

## 1. First Impression (2 secondi)

### Homepage (WelcomePage)
- **Cosa attira l'occhio**: Mascotte ELAB (bene) + "BENVENUTO IN ELAB TUTOR" (bene)
- **Reazione emotiva**: Pulita, professionale, ma fredda. Manca calore per bambini 8-14
- **Scopo chiaro?**: SI — "inserisci chiave e entra"
- **Problema**: "Chiave univoca" — un docente al primo avvio non ha una chiave. Dove la prende? Non c'e' nessun link "Non hai una chiave? Prova gratis"

### Lavagna (dopo login)
- **Cosa attira l'occhio**: UNLIM window (occupa 50% dello schermo su mobile!)
- **Reazione emotiva**: Confuso. Troppi elementi contemporaneamente
- **Scopo chiaro?**: NO — il docente non capisce se deve parlare con UNLIM o guardare il circuito

---

## 2. Usability

| Finding | Severity | Recommendation |
|---------|----------|----------------|
| UNLIM window copre il simulatore all'apertura | CRITICA | UNLIM deve partire minimizzato o come chip in basso |
| "Gia Montato / Passo Passo / Percorso" non spiegati | ALTA | Tooltip al hover o micro-testo sotto i bottoni |
| Toolbar icone senza label (Seleziona/Filo/Elimina) | MEDIA | Aggiungere testo sotto le icone in modalita desktop |
| Pannello componenti (sx) copre il canvas su mobile | ALTA | Collassare a icona, aprire on demand |
| Campo chat UNLIM troppo grande rispetto al canvas | MEDIA | Ridurre altezza finestra UNLIM default |
| Homepage: nessun modo di provare senza chiave | CRITICA | Aggiungere "Prova gratis" o "Demo" come CTA secondario |
| Back browser da lavagna = pagina vuota (bug GF07) | ALTA | Gestire popstate per tornare alla home |
| Nessun breadcrumb o indicatore di posizione | MEDIA | "Volume 1 > Cap. 6 > Esp. 1" sopra il canvas |

---

## 3. Visual Hierarchy

- **Cosa attira l'occhio primo**: UNLIM window (errato — dovrebbe essere il circuito)
- **Flusso lettura**: Header → UNLIM → si perde (il simulatore e' sotto)
- **Enfasi corretta?**: NO — UNLIM domina visivamente ma il docente dovrebbe prima vedere il circuito
- **Whitespace**: Buono nell'header, carente nel canvas (troppi overlay sovrapposti)

### Problemi specifici
1. **Build mode buttons** ("Gia Montato", "Passo Passo", "Percorso") sono in alto a destra ma non hanno gerarchia visiva — tutti uguali, nessuno e' il default visivo
2. **Manuale e Video** nell'header competono con il nome dell'esperimento
3. **Toolbar bottom** (Play, Wire, Delete, Undo, Redo, Pen) — le icone sono troppo piccole su mobile

---

## 4. Consistency

| Element | Issue | Recommendation |
|---------|-------|----------------|
| Font header | "Accendi il tuo primo LED" troncato con "..." | Usare titolo piu corto o font piu piccolo |
| Bottoni build mode | Emoji + testo misto | Sostituire emoji con ElabIcons (regola CLAUDE.md) |
| UNLIM window | Glassmorphism (blur 16px) vs header opaco | Scegliere uno stile: o tutto glass o tutto solido |
| Toolbar | Icone SVG custom vs bottoni con testo | Uniformare: tutte icone con label sotto |
| Colori bottoni | "ENTRA" verde (#4A7A25) vs toolbar grigia | OK — i colori sono coerenti con la palette |

---

## 5. Accessibility

- **Contrasto header**: Testo bianco su Navy rgba(30,77,140,0.85) — ~4.2:1 — BORDERLINE AA
- **Contrasto UNLIM**: Testo scuro su bianco trasparente — PASS
- **Touch targets**: Header buttons 48x48px OK, toolbar 44x44px OK
- **Font size**: Body 16px OK, label secondarie 13px BORDERLINE (regola: min 13px)
- **Aria labels**: Presenti sui bottoni principali (verificato con snapshot)
- **Focus trap**: UNLIM dialog ha focus trap (verificato E2E)

---

## 6. Mobile (375x812)

| Finding | Severity |
|---------|----------|
| UNLIM window occupa 70% dello schermo | CRITICA |
| Simulatore quasi invisibile dietro UNLIM | CRITICA |
| Header troncato: "Accendi il t..." | MEDIA |
| Toolbar in basso coperta dalla tastiera quando si chatta | ALTA |
| Pannello componenti non visibile | MEDIA |

---

## 7. Tablet (768x1024 — iPad)

| Finding | Severity |
|---------|----------|
| Layout OK — simulatore visibile accanto a UNLIM | BASSA |
| "Gia Montato" button potrebbe essere piu grande | MEDIA |
| Header titolo completo: PASS | OK |

---

## 8. What Works Well

1. **Palette coerente** — Navy/Lime e' professionale e riconoscibile
2. **Mascotte UNLIM** — simpatica, riconoscibile, dà personalita
3. **Font Oswald** per titoli — autorevole ma non intimidatorio
4. **Glassmorphism UNLIM** — moderno, non copre completamente il canvas
5. **Build mode tri-bottone** — concetto valido (3 modalita' chiare)
6. **Circuito SVG** — breadboard realistica, LED che si illumina
7. **Chat disclaimer** — "le risposte potrebbero non essere accurate" e' onesto

---

## 9. Priority Recommendations for Monday Demo

### P0 — Deve essere fixato (impatto sulla vendita)

1. **UNLIM deve partire MINIMIZZATO** — Al primo carico, mostrare solo il chip mascotte in basso. Click per espandere. Il docente deve PRIMA vedere il circuito, DOPO chiedere aiuto. Questo e' il Principio Zero: il prodotto guida senza essere invadente.

2. **Aggiungere "Prova gratis" sulla homepage** — Giovanni Fagherazzi testera' il prodotto. Se non ha una chiave, deve poter provare. Un bottone "Prova senza chiave" che carica Vol1 Cap6 Esp1 direttamente.

3. **Back browser da lavagna** — Bug GF07: premere back = pagina vuota. Fix: `window.onpopstate` handler.

### P1 — Importante per impressionare

4. **Breadcrumb sopra il canvas** — "Volume 1 / Cap. 6 - LED / Esp. 1 - Accendi il tuo primo LED" — da' contesto immediato al docente.

5. **Tooltip sui build mode** — "Gia Montato: il circuito e' pronto, esplora!" / "Passo Passo: segui le istruzioni step by step" / "Percorso: segui il lesson path completo"

6. **Rimuovere emoji dai bottoni build mode** — Usare ElabIcons SVG come da regola CLAUDE.md

### P2 — Nice to have

7. **Header non troncare titolo** — Font piu piccolo o wrapping
8. **Mobile: UNLIM come bottom sheet** — Non window flottante ma drawer dal basso
9. **Guided tour primo avvio** — 3 tooltip: "Questo e' il circuito", "Qui scegli la modalita", "Qui chiedi aiuto"
