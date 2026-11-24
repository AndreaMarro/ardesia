# Note dell’autore · rest-accelerated-distance-015

Letti singolarmente i sorgenti `u2-rest-accelerated-distance-01` … `16` dal file
`packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-01.json`
alla SHA `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, con consegne, condizioni,
alternative, chiavi e passaggi specifici. La fonte non certifica la riscrittura.

Appunti di calcolo dell’autore, senza PASS scientifici, firme reviewer o
approvazioni. Ogni candidato resta DRAFT; review indipendente e umana NOT_RUN.
Competenze e prerequisiti C1-L001/L002/L003/L004, riuso C6 già esistenti.

Tutti i casi hanno partenza da fermo, moto rettilineo in riferimento inerziale,
accelerazione positiva costante nella singola prova e tempo non negativo.
Non ci sono inversioni: lo spostamento positivo coincide con la distanza, ma
la legge generale usata resta quella dello spostamento dal punto iniziale.

| ID | Calcolo proposto e attenzione per la review |
|---|---|
| 01 | D=(1/2)at²=(1/2)·2·4=4 m; area triangolare nel grafico v–t. |
| 02 | (L/T²)T²=L; il quadrato comprende anche l’unità del tempo. |
| 03 | D(1 s)=1 m ⇒ D(2 s)=4 m ⇒ solo secondo secondo=3 m, non 4. |
| 04 | a raddoppia a durata fissa: D da 4 a 8 m. |
| 05 | a=2D/t²=8/4=2 m/s²; non serve radice nell’incognita a. |
| 06 | t²=2D/a=4 s²; t=2 s sul ramo futuro t≥0, radice negativa esclusa. |
| 07 | t raddoppia a fissa: D₂/D₁=(4/2)²=4. |
| 08 | a=4 m/s², x₀=v₀=0: x=(2 m/s²)t², v(0)=0, x(1)=2 m,x(2)=8 m; parabola verso l’alto. |
| 09 | a=2D/t² con D,t>0: positività e denominatore non nullo espliciti. |
| 10 | κ₁κ₂², accelerazione alla prima potenza e durata al quadrato. |
| 11 | D₁=4 m,D₂=32 m ⇒ rapporto 8. |
| 12 | Media uscite (4+32)/2=18 m; uscita alle medie 3·3²/2=27/2 m, diversa. |
| 13 | Obiettivo D₂=32 m, a₂=4 ⇒ t₂²=16 s² ⇒ t₂=4 s, rapporto 2. |
| 14 | T puro, g=3 m⁻¹; T=96 ⇒ D=32 m ⇒ a=64/16=4 m/s². |
| 15 | Riferimenti D=4,32 m ⇒ g=2 m⁻¹,c=1; T=17 ⇒ D=8 m ⇒ a=4 m/s². |
| 16 | k=1 m/s³, a=kt costante nella prova scelta: D=kt³/2 ⇒ t³=8 s³ ⇒ t=2 s e a=2 m/s². |

Nel 16 il vincolo a=kt collega l’accelerazione costante scelta e la durata
totale scelta **prima** di iniziare: non è la legge temporale a(τ)=kτ durante
la prova, per la quale l’integrazione darebbe una legge diversa. Questa
interpretazione e le unità del coefficiente sono scritte nel prompt autonomo.

Due asset SVG originali progressivi, con didascalie e descrizioni:
- `rest-accelerated-area.svg`: scala 120 unità SVG/s e 60 unità SVG/(m/s),
  triangolo totale di 4 m per a=2 m/s² e suddivisione 1 m + 3 m.
- `rest-accelerated-parabola.svg`: scala 120 unità SVG/s e 25 unità SVG/m,
  per a=4 m/s². Bezier quadratico esatto: x SVG lineare in t, quota in t²;
  punti a un secondo e due secondi danno 2 e 8 m. La tangente iniziale è
  l’asse orizzontale; incrementi 2 m e 6 m in intervalli uguali.

Miniature Quick Look ispezionate localmente dopo aver riallineato la tangente
iniziale all’origine. Il lettore a 320 px resta da verificare dall’integratore.

Controlli tecnici: assemble e binding riproducibili, digest delle fonti e dei
candidati corretti, asset locali/base64/digest allineati. Importatore canonico
in SQLite temporaneo: 16 bozze, reimport zero nuove revisioni/16 invariate,
zero nuove head live e byte dei 991 materiali pubblicati invariati. Nessun
verificatore scientifico scritto dall’autore e nessun database privato aperto.

Riproduzione: `python -m tools.corpus_engineering.rest_accelerated_distance_authoring`
con `--repo .. --source-ref 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`
e `--destination editorial/batches`, dalla directory Officina.

Prossimi passi: review indipendente per ID sui byte finali; collaudo del lettore
e delle figure; integrazione canonica; review umana distinta. Nessuna promozione
o pubblicazione deriva da questi controlli dell’autore.
