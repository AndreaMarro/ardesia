# Note dell’autore · mean-acceleration-013

Letti individualmente i sorgenti `u2-mean-acceleration-01` … `16` dal file
`packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-01.json`
alla SHA `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`: prompt e convenzioni,
alternative, risposta, passaggi specifici. Il testo candidato è una riscrittura;
la chiave sorgente non costituisce prova di correttezza.

Note di calcolo dell’autore da confutare indipendentemente, senza PASS o firma
reviewer. Tutti i candidati DRAFT; review indipendente e umana NOT_RUN.
Collegamento C1-L003, prerequisiti C1-L001/L002/L003 e riuso C6 già esistenti.

| ID | Calcolo proposto e attenzione per la review |
|---|---|
| 01 | (6−2) m/s /(2 s)=+2 m/s²; media degli estremi, senza postulare a costante. |
| 02 | (L/T)/T=L/T². |
| 03 | A=(v_f−vᵢ)/(2 s); tutte le scelte mantengono esplicita la durata con unità. |
| 04 | Stessa vᵢ=2 e durata: A da 2 a 4 m/s² per v_f da 6 a 10 m/s. |
| 05 | AΔt=v_f−vᵢ ⇒ v_f=vᵢ+AΔt=6 m/s; vale anche senza a costante. |
| 06 | vᵢ=v_f−AΔt=2 m/s, non una variazione con segno invertito. |
| 07 | Medie 2 e 1 m/s²: rapporto 1/2 esatto tramite scelta. |
| 08 | +250 cm/s²=+250/100 m/s²=+5/2 m/s²; il quadrato riguarda solo il secondo. |
| 09 | v_f=vᵢ+A(2 s); non si sommano accelerazioni e velocità. |
| 10 | Rapporto (κ₁v_f−κ₂vᵢ)/(v_f−vᵢ); vincoli positivi in entrambe le prove e durata comune. |
| 11 | Variazioni 4 e 6 m/s, medie 2 e 3 m/s²; rapporto 3/2. |
| 12 | Semisomma delle due medie: 5/2 m/s²; durata comune rende anche la legge degli estremi lineare. |
| 13 | Obiettivo A₂=3 m/s²; vᵢ₂=10−3·2=4 m/s, fattore 2; vincolo 0<vᵢ₂<v_f₂. |
| 14 | T puro e g=3 s²/m; T=9 ⇒ A=3 m/s² ⇒ v_f=10 m/s. |
| 15 | Riferimenti A=2,3 m/s²; g=2 s²/m,c=1; T=9 ⇒ A=4 ⇒ v_f=10 m/s. |
| 16 | v_f=3vᵢ ⇒ AΔt=2vᵢ ⇒ vᵢ=2 m/s, v_f=6 m/s. |

La figura originale usa assi velocità-tempo, stessa scala nei tre pannelli e
secante tratteggiata. Dichiara di non ricostruire le velocità intermedie. Le due
misure danno Δv=4 m/s e Δt=2 s: il rapporto è medio, non automaticamente istantaneo.
La velocità è sempre una componente orientata; nei casi positivi crescenti il
modulo aumenta, ma non si estende questa conclusione a segni arbitrari.

Controllo tecnico in SQLite temporaneo tramite importatore canonico: 16 bozze,
reimport con zero nuove revisioni e 16 invariate, nessun nuovo ID live; tutti i
991 materiali pubblicati conservano i byte. Assemble riproducibile e binding
sorgente/candidato/asset verificati. Nessun database privato aperto.

Riproduzione: `python -m tools.corpus_engineering.mean_acceleration_authoring`
con `--repo .. --source-ref 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`
e `--destination editorial/batches`, dalla directory Officina.

Prossimi passi: review indipendente dei 16 candidati effettivi; lettore e figura
sul viewport mobile; integrazione canonica; review umana separata. Queste note
non approvano o pubblicano la banca.
