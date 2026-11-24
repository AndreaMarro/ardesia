# Audit visuale indipendente AI — assi con percorsi composti

Ambito circoscritto: cinque SVG, sei elementi `path` con più sottopercorsi e `marker-end`, usati da otto ID registrati. Letti XML completi, prompt e blocchi/didascalie degli otto record; viste individualmente cinque rese Chromium complete a dimensioni native, generate fuori dal repository e chiuse con il solo browser di prova. Nessuna modifica a figura, contenuto, firma scientifica, runtime, registro o checkpoint. Nessuna approvazione umana o pubblicazione.

Elenco di ingresso `/private/tmp/cric-marker-audit-registered800.json`, SHA256 `83b9b17ac2764bb7f06ada7a280b34ab8182dc35c0809e1a1378b63167637bf7`.

**Esito: nessun finding fisico concreto.** I sei percorsi segnalati sono coppie di assi cartesiani. La punta mancante sull'ultimo estremo verticale è una scelta di resa del percorso composto, non la perdita del verso di un vettore forza, velocità o spostamento. Etichette delle grandezze, zero, valori numerici e segni rendono univoca la lettura. Le frecce fisiche nei pannelli distinti hanno elementi e punte proprie.

| Asset esatto | Record pertinenti | Lettura dei percorsi segnalati |
|---|---|---|
| uniform-displacement-progressive.svg | AR-u2-uniform-displacement-01 | Assi v–Delta_t: 0 alla base, 2m/s sopra, 2s a destra; area4m. Il pannello precedente esplicita +x e la freccia di velocità è separata. |
| uniform-position-progressive.svg | AR-u2-uniform-position-01 e -03 | Assi x–t: livelli3m e7m ordinati verso l'alto, tempo0→2s verso destra; pendenza2m/s. Il secondo esempio è dichiarato distinto dalla partenza2m. Freccia di spostamento nel pannello precedente separata dagli assi. |
| vertical-flight-progressive.svg | AR-u2-vertical-flight-01 | Due coppie di assi y–t e vy–t. Nel primo: zero e quota1m sopra, t0/1/2 a destra. Nel secondo: +2 sopra,0 al centro,−2 sotto; aree+1m e−1m. Il verso+y fisico è esplicito nel primo pannello. I segni non dipendono da una punta verticale. |
| oblique-work-progressive.svg | AR-u2-oblique-work-01 e -03 | Assi Fparallela–s, zero, livello1N sopra,2m a destra; area2J. Forza obliqua, componente e spostamento sono frecce distinte nei primi due pannelli e conservano le punte. Scale N e m separate esplicitamente. |
| mechanical-power-progressive.svg | AR-u2-mechanical-power-01 e -03 | Assi P–t,zero,4W sopra,2s a destra; area8J della sola forza scelta. Forza e velocità concordi sono frecce distinte, con scale di dimensioni diverse. L'esempio della figura2N/2m/s è distinto dai5N del quesito03. |

Nessuno dei grafici richiede che una punta verticale, da sola, definisca il segno. Non ho equiparato le lunghezze di frecce di dimensioni diverse né interpretato gli assi come vettori di modulo uguale. Il controllo non giustifica invalidazioni scientifiche o una modifica di stile a questi asset.

Hash SHA256 degli SVG letti e resi:

- uniform-displacement-progressive.svg: `2efc95e2aa57c1b4266f85eb38b94bad92c0a81b8bf5a8ff83879f6d2e632d81`.
- uniform-position-progressive.svg: `cad5dcb8b708cdf6bda946934a3d2f0bfae10adf4805704d4e2577955385e25e`.
- vertical-flight-progressive.svg: `bb568c15f1e05bdb413b87cc468986f1f84a31e4715d679e0335f3a41c1cc5da`.
- oblique-work-progressive.svg: `c7edff368af80c950fb7477d5ffd930eb171a3eec28def4cae76e51b9616d080`.
- mechanical-power-progressive.svg: `ed4a45d7a67bcb9603682eaf7560fc5caf0d71581020a7785751ef5501e2b560`.

Le prime miniature QuickLook erano quadrate e tagliavano la parte inferiore di alcuni SVG verticali: non sono state accettate come lettura completa. Le successive screenshot Chromium hanno le dimensioni600×890,600×1000,600×1000,640×1230,640×1330, coprono integralmente i grafici segnalati e sono state tutte viste. Nessuna prova browser di importazione o dell'intero corpus è rivendicata da questo audit.

Limite: giudizio AI sull'ambiguità fisica di questi sei percorsi nei rispettivi otto contesti. Non è una nuova revisione scientifica di tutti gli 800 quesiti, una verifica generale dell'accessibilità o una calibrazione didattica con studenti. Le precedenti firme non sono state riscritte.
