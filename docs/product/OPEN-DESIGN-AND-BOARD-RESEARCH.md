# OPEN-DESIGN-AND-BOARD-RESEARCH

> Ricerca su **lavagna / open design** per ARDESIA. Companion di
> `docs/product/UI-UX-DESIGN-DIRECTION.md` (170 righe, direzione) — qui i **pattern
> open-source** da valutare. Nota epistemica: licenze/feature = **[VERIFY-WEB]** (Codex).

## Baseline e obiettivo
- **Baseline: GoodNotes.** ARDESIA deve essere **più bella, più leggibile, più fluida** di GoodNotes, con una cosa che GoodNotes non ha: **plugin direttamente sulla carta/foglio/lavagna**.
- **iPad / LIM-first**, poi laptop/desktop. Zoom mobile fluido. Basso carico cognitivo. Microinterazioni. Accessibilità.
- Post-it e **sotto-post-it** come contenitori di plugin/embed sulla board (coerente con MOUNT-CANVAS: l'embed è un oggetto della board).

## Pattern open-source da valutare
| Progetto | Cosa prendere (pattern) | Cautela |
|---|---|---|
| **Excalidraw** [VERIFY-WEB] | canvas infinito, mano libera, scene JSON esportabile, roughjs feel | integrare il **modello**, non forzare lo stile "sketchy" ovunque |
| **tldraw** [VERIFY-WEB] | SDK shapes/tool custom, embed arbitrari, editor estensibile | **[VERIFY-WEB] licenza** (storicamente non-OSI/commercial clause) → trap marketplace |
| **Penpot** [VERIFY-WEB] | design open, componenti, SVG-native | è design-tool, non lavagna didattica; pesante |
| **Fritzing** [VERIFY-WEB] | breadboard/circuito fedele | desktop-app; utile come riferimento SceneForge, non come UI |
| **LibreCAD** [VERIFY-WEB] | precisione tecnica | dominio CAD, overkill |
| **Mermaid / Graphviz** [VERIFY-WEB] | diagrammi da testo (grafo lezioni, circuiti schematici) | rendering, non editing manuale |
| **Logseq** [VERIFY-WEB] | blocchi + backlink (allineato a LessonOS graph) | app intera; prendere il modello |

## Cosa serve ad ARDESIA
- **Canvas infinito estensibile** con oggetti-embed firmati (host) = post-it/plugin sulla carta.
- **Scene serializzabile** (export/import `.lesson`) — pattern Excalidraw/tldraw.
- **Manuale leggibile** come oggetto vivo sulla board, non PDF morto.
- **Diagrammi-da-testo** (Mermaid/Graphviz) per schemi/grafo, generati non disegnati.

## Cosa NON copiare
- App intere (Logseq, Penpot) o stili identificativi — solo modelli/pattern.
- **Codice con licenza copyleft forte o clausole commerciali** che finirebbe nel marketplace ARDESIA. Stesso rischio già segnalato per SceneForge (AGPL = trap). **[VERIFY-WEB]** licenza tldraw/Excalidraw/Penpot prima di riusare codice.

## iPad / LIM-first (requisiti UX)
- Touch/pencil primari; hover secondario. Target tap ampi.
- Zoom/pan a due dita fluido; niente jank su embed pesanti (virtualizzare).
- Palette a basso carico cognitivo; microinterazioni discrete; feedback immediato.
- Accessibilità: contrasto AA, focus visibile, alternative testuali su embed.

## Rischio "god component"
- L'attuale `ToolCanvasEmbeddable.tsx` (1289 righe) è un segnale: definire un
  **contratto embed** stabile prima di aggiungere tipi di plugin, per non far
  crescere un unico componente monolitico.

## Micro-slice realistica (design, non codice)
1. Definire lo **shape "embed firmato"** sulla board (contratto dati).
2. Un post-it che contiene un embed (es. la sim breadboard già presente).
3. Export/import della scena con l'embed → identica.

## TODO web (Codex)
- [VERIFY-WEB] licenze reali: tldraw, Excalidraw, Penpot, Fritzing.
- [VERIFY-WEB] se tldraw SDK è usabile senza vincoli commerciali per il nostro caso.
