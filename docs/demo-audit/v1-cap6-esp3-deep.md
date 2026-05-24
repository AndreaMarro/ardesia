# Deep Analysis — `v1-cap6-esp3` (Andrea 17-checkpoint)

**Sorgente**: visual PNG Vol1 pag.33 + textual vol1.txt + repo. Andrea NON COMPIACERMI.

---

## Identità

| Campo | Valore |
|-------|--------|
| Esp libro | ESPERIMENTO 3 — Cos'è il diodo LED? |
| Pagine | 33 |
| Reference PNG | reference/vol1/v1-cap6-esp3/page-033.png |
| Tipo | Variante R per luminosità (parte da esp1 layout) |

## Critical visual correction da Sprint A audit

**Sprint A audit dichiarava**: "R=220Ω default, swap 220→470→1k"

**Libro pag.33 verbatim corretto**:
> "Per rendere il led più luminoso ci basta partire dal circuito che abbiamo realizzato. Basta cambiare il resistore di 470 Ohm con uno da 220 Ohm. Ti ricordi i colori delle resistenze?"
>
> [ILLUSTRAZIONE 1 — R=220Ω, LED brillante]
>
> "Con un resistore più basso, passa più corrente quindi il LED si illumina di più."
>
> "**Rendiamo il LED meno luminoso**. Per rendere il led meno luminoso, ci basta partire dal circuito che abbiamo realizzato. Basta cambiare il resistore di 220 Ohm con uno da 1 kOhm. Ti ricordi i colori?"
>
> [ILLUSTRAZIONE 2 — R=1kΩ, LED meno brillante]
>
> "Prova ora a cambiare il valore del resistore, ma NON scendere mai al di sotto dei 100 Ohm."

**Corretto**:
- Default esp1 = **470Ω**
- Variante 1 esp3 = **220Ω** (più luminoso)
- Variante 2 esp3 = **1kΩ** (meno luminoso)
- Range valido: 100Ω-1kΩ (libro warning "NON sotto 100Ω")

**Sprint A audit era ERRATO** dichiarare "R=220 default". Audit doc da correggere.

## Andrea 17-checkpoint

### 1. Breadboard
- Orizzontale half-size (stesso esp1) ✅

### 2. Batteria 9V
- Verticale sinistra clip-right (stesso esp1) ✅

### 3. Arduino
- N/A Vol1

### 4. Orientamento componenti

**Libro pag.33 visivo (2 illustrazioni)**:
- Layout IDENTICO esp1 in entrambe le illustrazioni
- bb destra, batteria sinistra, R+LED nel mezzo
- LED rosso verticale (gambe divaricate)
- R orizzontale o verticale (visibile body color = match valore: rosso-rosso-marrone per 220, marrone-nero-rosso per 1k)
- **Differenza tra le 2 illustrazioni**: SOLO il color del corpo R + bande (220 vs 1k)

### 5. Dimensioni relative
- Stessi esp1 ✅

### 6. Compatibilità SVG

**App attuale**:
- Resistor.jsx dynamic bands per valore (handoff: "220Ω=red-red-brown-gold, 470Ω=yellow-violet-brown-gold, 1kΩ=brown-black-red-gold")
- Swap UX TBD — properties panel vs lesson-paths?

**Decisione**:
- Verify R swap UX: user click sul R → properties panel select dropdown 220/470/1k?
- OR lesson-paths step `setComponentValue(r1, 220 | 470 | 1000)` automatic?
- Andrea ratify

### 7. Numero cavi visibili libro

**Libro pag.33** entrambe illustrazioni:
- Stesse **2 wire** visibili esp1 final (rosso + nero)
- Nessuna variazione wiring

### 8. Colori cavi
- Rosso + nero ✅

### 9-12. Punto partenza/arrivo, curve, angoli, sovrapposizioni
- IDENTICO esp1 (eredita layout) ✅

### 13. Compattezza
- Stessi esp1 ✅

### 14. Compattezza su transform
- Eredita esp1 (TBD verify)

### 15. Funzionamento elettrico

**Libro 3 varianti**:
- Default esp1: R=470Ω → I = (9-2.0)/470 ≈ 14.9mA → LED brightness medio
- Esp3 var.1: R=220Ω → I = (9-2.0)/220 ≈ 31.8mA → LED brightness alto (vicino max 20mA — leggera overcurrent ma transitoria OK)
- Esp3 var.2: R=1kΩ → I = (9-2.0)/1000 = 7mA → LED brightness basso

**Solver app**:
- MNA dovrebbe calcolare brightness LED in funzione di I attraverso
- Rendering visivo: opacity/glow proportional a I (verify implementation)

### 16. Coerenza codice
- N/A Vol1

### 17. Classificazione P0/P1/P2

#### P0 bloccante
- **P0-1**: Wire visibility 4→2 (eredita esp1)
- **P0-2**: LED switch led-bridge → led standard (eredita esp1)
- **P0-3**: **R swap UX** — verify implementation (lesson-path step automatic vs user-driven properties panel)
- **P0-4**: **LED brightness rendering dinamico** in funzione di R (current calc → opacity/glow). Verify solver event + SVG update
- **P0-5**: R color bands SVG aggiornate dinamicamente quando R cambia (220→1k swap bands)

#### P1 importante
- **P1-1**: 3 stati R visualization step-by-step lesson-path (NON solo "default 470" + comparison)
- **P1-2**: UNLIM TTS commentary su brightness change ("Vedete? Con 220Ω il LED è più luminoso perché passa più corrente.")
- **P1-3**: Warning UI "non sotto 100Ω" se user tenta input <100

#### P2 rifinitura
- P2-1: Side-by-side comparison view (470 + 220 + 1k visibili insieme)
- P2-2: Animation transition R-swap

## Verdetto

**NON PRONTO**.

**Discrepanze critiche corrette in deep analysis**:
1. R default esp3 = 470 (eredita esp1), NON 220 come Sprint A audit dichiarava ❌→✅
2. esp3 mostra 2 varianti specifiche: 220 (luminoso) + 1k (meno luminoso) — NON 3 varianti generiche
3. Range valido R: 100-1000Ω (libro warning)

**Priorità refactor**:
1. R brightness dynamic rendering
2. R swap UX flow
3. Bands dynamic update SVG
4. Update Sprint A audit con corrections (esp3 default = 470 NON 220)
