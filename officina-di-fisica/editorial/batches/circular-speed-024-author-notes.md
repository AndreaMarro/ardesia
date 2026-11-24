# Note dell’autore · circular-speed-024

Letti individualmente i 16 sorgenti `u2-circular-speed-01` … `16` alla SHA
`5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, file
`packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-02.json`.
La chiave sorgente non è presentata come prova. I binding conservano il digest
del sorgente e del candidato, il riferimento Git, l’envelope della provenienza
e il suo digest, oltre agli asset effettivamente usati.

Queste sono note di calcolo dell’autore per il revisore distinto. Non sono
un verificatore indipendente o un PASS scientifico. Tutte le schede DRAFT;
review indipendente e approvazione umana NOT_RUN. Nessuna pubblicazione.

| ID | Calcolo proposto e punto da esaminare |
|---|---|
| 01 | C=2π m, T=π s ⇒ V=2 m/s. Distinto dalla velocità media vettoriale nulla sul giro. |
| 02 | [V]=L/T; 2π è puro, T è una durata. |
| 03 | V=2πr/T; diametro, semicirconferenza e spostamento netto non sono il giro percorso. |
| 04 | Raggio da 1 a 2 m a T=π s: V da 2 a 4 m/s. Raggio fisso all’interno di ogni prova. |
| 05 | VT=2πr ⇒ r=VT/(2π)=1 m, con π esatto. |
| 06 | VT=2πr ⇒ T=2πr/V=π s; non si introduce una risposta decimale. |
| 07 | Stesso r, periodo π→2π s: V=2→1 m/s, rapporto 1/2. |
| 08 | Scarto con ordine esplicito 4−2=+2 m/s. |
| 09 | r=VT/(2π); alternative distinguono fattore due e dimensioni. |
| 10 | Nuovo/vecchio=κ₁/κ₂ con r,T,fattori positivi; nessuna variazione durante il giro. |
| 11 | V₁=2 m/s,V₂=4π m/s ⇒ rapporto 2π puro. |
| 12 | Semisomma (2+4π)/2=(1+2π) m/s. Si mediano uscite, non ingressi. |
| 13 | Obiettivo V₂=4π m/s,r₂=2 m ⇒ T₂=1 s, rapporto T₂/T₁=1/π. |
| 14 | S puro,g=3 s/m; S=12π ⇒ V=4π m/s ⇒ r=2 m per T=1 s. |
| 15 | Riferimenti V=2 e4π m/s; h=4π−2>0,ΔS=2h,ΔV=h m/s ⇒ g=2 s/m,c=1. S=9 ⇒ V=4 m/s ⇒ r=2 m con T=π s. |
| 16 | k=(1/π)m/s,r=kT ⇒ V=2πk=2 m/s per ogni T>0. Infinite coppie; dati della prova costanti, non raggio crescente nel tempo. |

La figura SVG originale procede da lunghezza del giro a tangenti e poi al
rapporto C/T. Raggio grafico100 px per1 m; frecce di velocità80 px per2 m/s,
scala40 px per m/s. Le due scale e le due dimensioni sono dichiarate: non
si confrontano le lunghezze grafiche come se fossero la stessa grandezza.
Due frecce tangenti corrispondono a istanti diversi dello stesso moto antiorario.
La miniatura locale è stata ispezionata; il collaudo nel lettore a320 px resta
all’integratore e non è rivendicato dall’autore.

Controlli tecnici con l’importatore canonico in SQLite temporaneo: 16 bozze al
primo import, zero nuove revisioni/16 invariate al secondo, nessuna nuova head
live e byte dei 991 materiali pubblicati invariati. Assemble riproducibile
tramite CLI e import del modulo; digest delle fonti, dei candidati e degli
asset locali/base64 coerenti. Non si è aperto un database degli studenti.

Riproduzione: `python -m tools.corpus_engineering.circular_speed_authoring`
con `--repo .. --source-ref 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`
e `--destination editorial/batches`, dalla directory Officina.

Prossimi passi: confutazione scientifica indipendente per ID e per byte;
lettura delle formule e figura sul consumer; integrazione canonica con i gate;
valutazione umana separata. Queste note non autorizzano promozione editoriale.
