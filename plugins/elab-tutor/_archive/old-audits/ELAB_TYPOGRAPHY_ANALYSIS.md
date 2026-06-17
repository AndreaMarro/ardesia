# ELAB - Analisi Tipografica e Layout Completa

## 📐 STRUTTURA PAGINA (A5 landscape spread)

### Layout a Due Pagine
```
┌─────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │            PAGINA SINISTRA            │SPIRALE│            PAGINA DESTRA              │ SIDEBAR │
│  BLU    │                                       │       │                                       │  VERDE  │
│  12mm   │              Contenuto                │ 15mm  │              Contenuto                │  18mm   │
│         │                                       │       │                                       │  + PCB  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Misure Precise (da foto)
- **Sidebar sinistra blu**: 10-12mm, testo verticale "Laboratorio di elettronica: impara e sperimenta"
- **Sidebar destra verde lime**: 15-18mm, con tracce PCB decorative + "CAPITOLO X" verticale
- **Margini contenuto**: 15-20mm da ogni lato
- **Spirale centrale**: ~15mm, rappresentata con clip-like shapes alternate

---

## 🔤 GERARCHIA TIPOGRAFICA

### 1. TITOLI CAPITOLO (Sidebar verticale)
```css
font-family: 'Oswald', sans-serif;
font-weight: 700;
font-size: 14px;
letter-spacing: 0.25em;
text-transform: uppercase;
writing-mode: vertical-rl;
text-orientation: mixed;
color: #FFFFFF;
```

### 2. TITOLI SEZIONE PRINCIPALI
Es: "COS'È UN RESISTORE?", "LA LEGGE DI OHM"
```css
font-family: 'Oswald', sans-serif;
font-weight: 700;
font-size: 22-26px;
letter-spacing: 0.08em;
text-transform: uppercase;
color: #1B315E; /* Navy */
line-height: 1.2;
margin-bottom: 16px;
```

### 3. SOTTOTITOLI SEZIONE
Es: "COME FUNZIONA?", "DOVE LO TROVIAMO?"
```css
font-family: 'Oswald', sans-serif;
font-weight: 600;
font-size: 16-18px;
letter-spacing: 0.1em;
text-transform: uppercase;
color: #1B315E;
margin-bottom: 12px;
border-bottom: 2px solid #7CB342; /* Opzionale: linea verde sotto */
```

### 4. ETICHETTE BOX (NOTE, ESERCIZI, RICORDA)
```css
font-family: 'Oswald', sans-serif;
font-weight: 700;
font-size: 12-14px;
letter-spacing: 0.2em;
text-transform: uppercase;
color: #FFFFFF;
background: #1B315E; /* Navy per NOTE */
background: #F59E0B; /* Arancione per RICORDA */
background: #2E7D32; /* Verde per ESPERIMENTO */
padding: 8px 16px;
```

### 5. CORPO TESTO
```css
font-family: 'Open Sans', sans-serif;
font-weight: 400;
font-size: 11-12px; /* ~14-15px screen equivalente */
line-height: 1.6;
color: #374151;
text-align: justify; /* Giustificato in alcune sezioni */
```

### 6. PAROLE CHIAVE nel testo
```css
font-weight: 700;
color: #1B315E; /* Stesse parole evidenziate in grassetto */
```

### 7. DIDASCALIE IMMAGINI
```css
font-family: 'Open Sans', sans-serif;
font-weight: 400;
font-size: 10px;
font-style: italic;
color: #6B7280;
text-align: center;
```

---

## 🎨 PALETTE COLORI ESATTA

### Colori Primari
| Nome | Hex | Uso |
|------|-----|-----|
| Navy Blue | `#1B315E` | Sidebar sx, titoli, testo importante |
| Lime Green | `#C5E063` | Sidebar dx, accenti |
| Orange | `#F59E0B` | Numeri capitolo, warning |
| White | `#FFFFFF` | Sfondo pagina principale |

### Colori Secondari
| Nome | Hex | Uso |
|------|-----|-----|
| Cream | `#FFF9E8` | Sfondo box contenuto |
| Mint | `#E8F5E9` | Sfondo esperimenti |
| Mint Dark | `#C8E6C9` | Bordo esperimenti |
| Experiment Green | `#2E7D32` | Header esperimenti |
| PCB Green | `#4CAF50` | Tracce PCB decorative |
| Text Gray | `#374151` | Testo corpo |
| Light Gray | `#9CA3AF` | Testo secondario |

### Colori PCB Traces
| Elemento | Colore |
|----------|--------|
| Traccia principale | `#C5E063` (lime) |
| Pad circolare | `#A0C853` (lime scuro) |
| Via | `#7CB342` (verde) |
| Sfondo PCB | `#E8F5E9` (mint chiaro) |

---

## 📦 BOX E CONTENITORI

### 1. Box NOTE (Folder Tab Style)
```
┌──────────────┐
│    NOTE      │ ← Tab navy 
├──────────────────────────────────┐
│                                  │
│  Contenuto con righe             │
│  ───────────────────────         │
│  ───────────────────────         │
│  ───────────────────────         │
│                                  │
└──────────────────────────────────┘
```
- Tab: bg navy, testo bianco uppercase
- Corpo: sfondo bianco/crema, bordo 2px navy
- Righe orizzontali distanziate ~8mm

### 2. Box ESPERIMENTO
```
┌─────────────────────────────────────────┐
│ 🤖 ESPERIMENTO 5                        │ ← Header verde scuro
├─────────────────────────────────────────┤
│                                         │
│  Descrizione esperimento...             │ ← Sfondo mint
│                                         │
│  Per questo esperimento abbiamo         │
│  bisogno di:                            │
│  • Componente 1                         │
│  • Componente 2                         │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │    [Schema circuito]            │    │
│  └─────────────────────────────────┘    │
│                                         │
│  1 ➜ Primo passaggio...                 │
│  2 ➜ Secondo passaggio...               │
│                                         │
└─────────────────────────────────────────┘
```

### 3. Box RICORDA (Warning)
```
RICORDA: testo in arancione, sfondo crema, bordo arancione
```

### 4. Tabella Codice Colori
- Bordo arrotondato verde lime
- Sfondo bianco
- Righe alternate leggermente colorate

---

## 📏 SPAZIATURE (spacing scale)

```
Base unit: 4px

xs:  4px   (0.25rem)
sm:  8px   (0.5rem)
md:  12px  (0.75rem)
lg:  16px  (1rem)
xl:  24px  (1.5rem)
2xl: 32px  (2rem)
3xl: 48px  (3rem)

Margine tra blocchi: 24-32px
Padding interno box: 16-24px
Interlinea testo: 1.5-1.6
Spacing lista: 8-12px tra items
```

---

## 🔧 ELEMENTI GRAFICI SPECIFICI

### Spirale Binding
- Serie di rettangoli verticali (~8x3mm)
- Alternati grigio chiaro / grigio scuro
- Ombra leggera verso destra
- Spaziatura uniforme ~12mm

### PCB Traces Pattern
- Linee orizzontali e verticali a 90°
- Curve a 45° agli angoli
- Pad circolari ai nodi
- Colore lime su sfondo verde chiaro
- Spessore linea: 2-3px

### Mascotte Robot
- Posizionata top-right nei box esperimento
- Dimensione: ~50x50px
- Sovrapposizione parziale al bordo (-20px top)
- Drop shadow leggera

### Numeri Pagina
- Font: Oswald Bold
- Dimensione: 12-14px
- Posizione: dentro sidebar (bottom)
- Colore: bianco su navy/verde

### Bullet Points
- Cerchio pieno piccolo (~6px)
- Colore navy o verde
- Spacing: 8px dal testo

---

## 📱 DENSITÀ CONTENUTO

### Testo per riga
- Corpo testo: 10-14 parole/riga (ottimale 12)
- Larghezza colonna: ~55-65 caratteri

### Rapporto testo/immagini
- Pagine teoria: 60% testo, 40% visual
- Pagine esperimenti: 40% testo, 60% visual
- Pagine esercizi: 30% istruzioni, 70% spazi compilabili

### Whitespace
- Generoso tra sezioni (24-32px)
- Margini interni box: 16-20px
- Respiro attorno immagini: 12-16px

---

## 🖼️ STILE ILLUSTRAZIONI

### Componenti Elettronici (vettoriali)
- Stile: cartoon/flat design
- Colori: saturi ma non fluorescenti
- Contorno: 1-2px grigio scuro
- Ombre: nessuna o molto leggera

### Resistori
- Corpo: azzurro/blu chiaro (#64B5F6)
- Terminali: grigio metallico
- Bande: colori codice reale

### LED
- Corpo: trasparente con colore interno
- Terminali: argento
- Luce: effetto glow leggero

### Breadboard
- Vista top-down
- Fori visibili come cerchi
- Linee bus rosso/blu per alimentazione
- Etichette righe (a-j) e colonne (1-30)

---

## 🔄 ELEMENTI INTERATTIVI (per app)

### Spazi Compilabili
```
R = _________ Ω ± _____ %
```
- Linea sottile 1px grigio
- Lunghezza proporzionale al contenuto atteso
- Spaziatura: 4px sopra/sotto linea

### Quiz/Domande
- Checkbox quadrato o cerchio vuoto
- Dimensione: 16x16px
- Bordo: 2px navy
- Spazio risposta: linee orizzontali
