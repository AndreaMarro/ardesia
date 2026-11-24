# Note dell’autore · accelerated-final-speed-014

Letti singolarmente i sorgenti `u2-accelerated-final-speed-01` … `16` dal file
`packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-01.json`
alla SHA `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`: consegna, convenzioni,
alternative, chiave e passaggi specifici. La chiave sorgente non è una prova.

Queste sono note di calcolo dell’autore per il reviewer indipendente, senza
PASS scientifici o firme di approvazione. Tutti i candidati DRAFT; review
scientifica indipendente NOT_RUN; approvazione umana NOT_RUN.
Competenza C1-L004 e prerequisiti C1-L001/L002/L003/L004 esistenti, riuso C6.

Ogni quesito specifica riferimento inerziale, asse e componenti orientate,
accelerazione costante +2 m/s². I dati v₀>0,t≥0 mantengono V>0, perciò in questi
casi il valore del modulo coincide con quello della componente: non è una
regola estesa a velocità negative o inversioni.

| ID | Calcolo proposto e punto da confutare |
|---|---|
| 01 | V=v₀+at=2+2·2=6 m/s; 4 m/s è solo l’incremento. |
| 02 | (L/T²)T=L/T: il contributo at si somma a v₀. |
| 03 | V=v₀+at, con a=2 m/s² esplicito, t≥0 e controllo t=0. |
| 04 | Incremento 4 m/s in entrambe le prove; V da 6 a 8 m/s, rapporto 4/3. |
| 05 | v₀=V−at=6−4=2 m/s; condizione v₀>0 soddisfatta. |
| 06 | t=(V−v₀)/a=4/2=2 s; V≥v₀ per durata futura, V<v₀ incompatibile. |
| 07 | Durata da 2 a 4 s, v₀ fissa: V da 6 a 10 m/s; rapporto 5/3 esatto. |
| 08 | Scarto con ordine dichiarato: 12−6=+6 m/s. |
| 09 | v₀=V−at; condizione V>at per il ramo v₀>0. |
| 10 | Rapporto (κ₁v₀+aκ₂t)/(v₀+at), a costante comune e denominatore positivo. |
| 11 | V da 6 a 12 m/s perché entrambi gli addendi raddoppiano: rapporto 2. |
| 12 | Semisomma (6+12)/2=9 m/s, distinta da una velocità media durante una prova. |
| 13 | Obiettivo V₂=12, v₀₂=4: t₂=(12−4)/2=4 s, rapporto t₂/t₁=2. |
| 14 | T puro, g=3 s/m; T=36 ⇒ V=12 m/s ⇒ v₀=12−8=4 m/s. |
| 15 | Riferimenti V=6,12 m/s: g=2 s/m,c=1; T=17 ⇒ V=8 ⇒ v₀=4 m/s. |
| 16 | Vincolo dimensionale v₀=(1 m/s²)t: V=(3 m/s²)t ⇒ t=2 s e v₀=2 m/s. |

Nel 16 il vincolo seleziona i dati della prova, non descrive una velocità
iniziale variabile durante il moto. Coefficiente e unità sono espliciti.

L’SVG originale in tre tappe conserva la scala di 120 unità SVG/s e 40 unità
SVG/(m/s); la retta continua è qui la vera legge v–t perché a è costante. La
figura distingue valore iniziale, incremento per due secondi e lettura finale.
Ispezionata la miniatura locale Quick Look; il lettore a 320 px resta da provare.

Controllo tecnico in SQLite temporaneo con importatore canonico: 16 nuove bozze,
reimport senza nuove revisioni e 16 invariate, nessun nuovo ID live; byte dei
991 materiali pubblicati invariati. Assemble e binding riproducibili; digest
sorgenti, candidati, asset locali e base64 coerenti. Questo non è un PASS scientifico.

Riproduzione: `python -m tools.corpus_engineering.accelerated_final_speed_authoring`
con `--repo .. --source-ref 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`
e `--destination editorial/batches`, dalla directory Officina.

Prossimi passi: review scientifica indipendente per ID e SHA; collaudo del
lettore e della figura; integrazione canonica; valutazione umana separata.
Nessuna pubblicazione autorizzata da queste note.
