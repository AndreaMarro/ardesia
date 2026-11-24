# Revisione indipendente AI — mean-acceleration-013 — 24 novembre 2026

Revisore `/root/author_vectors_b`, **distinto dall’autore** `/root/author_vectors_a`
per questi 16 ID. Il cambio di ruolo è esplicito: questa review riguarda soltanto
le schede A sulla media dell’accelerazione. Non attribuisce indipendenza a verifiche
dei lotti B scritti in precedenza dal medesimo revisore.

Sono stati letti individualmente tutti gli enunciati, le cinque alternative ove
presenti, gli svolgimenti, gli indizi, i feedback, le ipotesi e i riferimenti
sorgente. Nessun modulo authoring è stato importato. Soluzioni primarie ricavate
prima da variazioni di velocità orientate e intervalli positivi, poi controllate
con SymPy e Pint esatti. **16/16 PASS nell’edizione finale qui identificata**, dopo
un finding nei distrattori rilevato e corretto dall’autore. DRAFT; approvazione
umana NOT_RUN. Nessuna pubblicazione, firma umana o integrazione dichiarata.

Sorgente letta e ricalcolata da Git:
`5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, file
`packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U2-01.json`.
Tutti i binding `sourceId`/`sourceRef`/`sourceSha256` sono stati confrontati con i
record originali della SHA. Il verificatore ripete questo confronto e non si limita
ad accettare una dichiarazione nei binding.

Edizione autore recensita: `5c55689a8e30e13a400e118806d9986433586886`.
La prima lettura era su `1c6b1571e105b75dd0c22e8045e0b4d8a3ef4717`; sono state
confrontate le due edizioni e l’unico record cambiato è 08. Quel record è stato
riletto integralmente prima del congelamento definitivo.

| Artefatto | Digest SHA-256 |
| --- | --- |
| Pacchetto JSON canonico | `23387a5350c5f4e95fa439145b63bace79c47ad28cd422b9658ef8c4401ed13d` |
| Binding JSON canonico | `d364c5108e23dc660e11e8d467dd1149a615c4fc0b9bf4610b7b2cff50b35282` |
| Asset SVG | `2bc28078e2cb9d0a8307ed3bd1aa80e17dc2e649409526db4d439291e4d6b99f` |
| Verificatore indipendente | `6151a87987e72242943828881fe22df7831dc2236bb93d6b85b5f658ace7d953` |
| Contratto comune della review | `00211f6ea0ede79ed107463286ef85e78a0b885ce3f819d0158aae5ba4ed215a` |
| Rapporto scientifico JSON, file | `179fb0154e7c8f526ed76d99a6b710bb7788d8d0465ef8782179fcc7b89046da` |
| Rapporto mutation test, file | `d5c430e93168ab85afd19a9be43c48260306b6c779d08a8263e392a2036ce75f` |

## Derivazione e lettura dei 16 ID

Prefisso completo `AR-u2-mean-acceleration-`. A=(v_f−v_i)/Δt è la definizione della
media orientata su un intervallo positivo, non l’ipotesi che l’accelerazione
istantanea sia costante. La cornice inerziale dichiarata è mantenuta in tutte le
prove cinematiche; la conversione 08 richiede soltanto le unità dichiarate.

| ID | Chiave verificata | Soluzione indipendente, ipotesi e distrattori |
| --- | --- | --- |
| 01 | +2 m/s² | Variazione 6−2=4 m/s su 2 s: media +2 m/s². Il segno positivo indica aumento della componente; qui cresce anche il modulo perché entrambe le velocità sono positive. Dividere 6 per 2 ignorerebbe il valore iniziale e darebbe la media sbagliata 3 m/s². Non si ricostruiscono velocità intermedie dai due estremi. |
| 02 | m/s² | (L/T)/T=L/T². Il secondo della durata aggiunge un fattore al denominatore, non cancella quello della velocità. m/s rimane velocità, m lunghezza, s tempo; 1 richiederebbe un rapporto omogeneo, assente qui. |
| 03 | A=(v_f−vᵢ)/(2 s) | Finale meno iniziale, diviso la durata con unità. Le alternative somma, solo finale e differenza invertita non descrivono la variazione dichiarata. Moltiplicare Δv per 2 s dà dimensione L, non L/T². Il dominio v_f>v_i>0 rende positiva la media senza imporre costanza istantanea. |
| 04 | Raddoppia da +2 a +4 m/s² | Le variazioni sono 6−2=4 e 10−2=8 m/s in uguali 2 s. L’aumento della media è un fattore 2. Il distrattore 3 m/s² richiederebbe una variazione 6, non 8; media invariata, nulla o negativa contraddice gli estremi. Non viene attribuita una storia istantanea alla prova. |
| 05 | 6 m/s | La definizione dà Δv=AΔt=4 m/s, poi v_f=2+4=6 m/s. Valida anche per accelerazione variabile nell’intervallo. Quattro è l’incremento e non la velocità finale; sommare direttamente velocità e accelerazione sarebbe inhomogeneo. |
| 06 | 2 m/s | v_i=v_f−AΔt=6−4=2 m/s. Aggiungere l’incremento darebbe v_i=10 m/s e quindi una media negativa da 10 a 6, incompatibile con +2 m/s². Durata e segno non sono alterati nell’inversa. |
| 07 | 1/2 | La prima prova ha Δv=4 m/s e A₁=2 m/s²; la seconda Δv=2 m/s e A₂=1 m/s². Rapporto secondo/primo 1/2. Il 2 confronta velocità iniziali; 1 ignora il cambiamento, 1/4 dimezza due volte, −1/2 è incompatibile con due medie positive. Alternative numericamente distinte. |
| 08 | +5/2 m/s² | Il centimetro è alla prima potenza: 250 cm/s² × (1 m/100 cm)=5/2 m/s². Il secondo resta invariato. 25000 converte nel verso errato, 25 usa dieci, 250 non converte. 1/40=250/100² applica cento due volte: è un distrattore sul quadrato del fattore lineare, non un reciproco. Il segno resta positivo. |
| 09 | v_f=vᵢ+A(2 s) | Moltiplicare la media per la durata dà una velocità, poi aggiungere v_i. Sottrazione e omissione di v_i cambiano rispettivamente segno dell’incremento e grandezza richiesta. Una divisione extra per 2 non segue dall’equazione; A/(2 s) ha dimensione L/T³ e non si somma a una velocità. |
| 10 | (κ₁v_f−κ₂vᵢ)/(v_f−vᵢ) | La durata comune si cancella, non le velocità dentro le differenze. Il dominio richiede entrambi gli incrementi positivi, così il denominatore non è nullo. κ₁κ₂ fallisce al raddoppio comune; κ₁−κ₂ fallisce all’identità; i segni più sostituirebbero la variazione con una somma. Controllata l’identità simbolica generale, non soltanto un esempio numerico. |
| 11 | 3/2 | Incrementi 4 e 6 m/s sulla stessa durata: rapporto 6/4=3/2. 2/3 è inverso, 5/3 confronta solo finali, 2 solo iniziali. 1/2 è l’aumento relativo (A₂−A₁)/A₁ e non A₂/A₁. |
| 12 | 5/2 m/s² | Medie 2 e 3 m/s², pesi statistici uguali: (2+3)/2=5/2. Cinque omette la divisione e cinque quarti la ripete; 7/2 e 3/2 stanno fuori da [2,3]. La durata comune rende qui lineare il calcolo nelle velocità; non viene estesa la proprietà a durate arbitrarie. |
| 13 | 2 | A₁=2 m/s², obiettivo A₂=3 m/s². In 2 s occorrono 6 m/s di incremento; da finale 10 si ricava iniziale 4 m/s, poi 4/2=2. Il nuovo dato rispetta 0<4<10. Applicare 3/2 direttamente all’iniziale darebbe 3 m/s e media 7/2, diversa dal bersaglio. |
| 14 | 10 m/s | Riferimento A=2 m/s², g=6/A=3 s²/m; lettura 9 dà A=3 m/s². L’incremento 6 m/s si aggiunge alla nuova iniziale 4: finale 10 m/s. Guadagno dimensionato perché le tacche sono un conteggio. Controllo completo T=g(10−4)/(2 s)=9. |
| 15 | 10 m/s | I riferimenti A=2,3 m/s² danno g=2 s²/m e offset 1. Lettura 9 corretta: A=(9−1)/g=4 m/s². Finale 2+4·2=10 m/s. Le altre finali 9,5,11,20 ricostruiscono conteggi 8,4,10,19: nessuna produce 9. Occorre sottrarre l’offset prima della divisione. |
| 16 | 2 m/s | Vincolo v_f=3v_i: Δv=2v_i, quindi v_i=AΔt/2=(2 m/s²)(2 s)/2=2 m/s e v_f=6 m/s. Il coefficiente puro 2 è distinto dalla durata 2 s. Alternative 1,3,4 danno medie 1,3,4 m/s²; −2 viola il dominio positivo. |

## Finding conservato e correzione riletta

Nella prima edizione l’ID 08 affermava che il distrattore 1/40 fosse ottenuto
scambiando numeratore e denominatore del fattore complessivo. È falso:
(250/100)⁻¹=2/5, mentre 250/100²=1/40. La chiave +5/2 era già corretta ma la
spiegazione del distrattore non lo era. Il finding è stato inviato ad autore e
coordinatore; nessun candidato è stato modificato dal revisore.

L’autore ha corretto testo dello svolgimento e feedback, rigenerando il binding
nel commit 5c55689a. La spiegazione finale parla ora di fattore cento applicato due
volte. I byte nuovi sono stati riletti prima di congelare firme; il confronto Git
conferma che gli altri 15 record sono identici. Nessuna firma precedente è stata
riciclata sul nuovo testo.

## Oracolo, figura e controprove

L’oracolo costruisce autonomamente due profili compatibili con gli stessi estremi:

- v₁(τ)=v_i+(v_f−v_i)τ/T;
- v₂(τ)=v_i+(v_f−v_i)(τ/T)².

Le accelerazioni istantanee sono diverse, ma per entrambi l’integrale medio
T⁻¹∫₀ᵀa(τ)dτ vale (v_f−v_i)/T. Questo controllo evita di attribuire al segmento
secante il significato di legge oraria intermedia. Le inverse, il rapporto dei
fattori, il vincolo e le tarature sono ricavati con SymPy; Pint a razionali esatti
controlla conversione 250 cm/s² e dimensioni del guadagno s²/m.

SVG riletto e confrontato con l’allegato Base64. Nei tre pannelli le origini sono
(100,340), (100,700), (100,1060). Le ascisse t=1,2 sono x=220,340, quindi 120 px/s.
La velocità v=2 si trova 80 px sopra ciascuna origine e v=6 a 240 px, quindi
40 px/(m/s). Il salto 160 px è 4 m/s, la durata 240 px è 2 s. Solo la secante è
tratteggiata e la didascalia dichiara che le velocità intermedie non sono assegnate.
Nessuna area del grafico viene usata per dedurre spostamento non determinato.

Sono state eseguite 22 controprove riproducibili mediante `mutation_audit()`:

- per ciascuno dei 16 ID, una chiave errata ribindata con firme individuali e token
  globali deliberatamente sostituiti soltanto nel contesto di test: l’oracolo
  indipendente la rifiuta comunque, oltre al normale vincolo di lettura;
- chiave corretta ma aggiunta di una prova plausibile falsa che deduce accelerazione
  costante dalla media: la nuova spiegazione ribindata è rifiutata dalle firme;
- ripristino della falsa spiegazione del reciproco in 08, con chiave corretta:
  i nuovi byte sono rifiutati;
- lotto vuoto, parziale o duplicato: rifiuto della completezza e unicità;
- SHA originale alterata: rifiuto anche dal confronto con Git sorgente.

Il test dei token non sostituisce la lettura editoriale: il verificatore non
pretende di comprendere una nuova spiegazione arbitraria. Le firme statiche
impediscono di trasferire la review a testi diversi; l’oracolo separato impedisce
che una nuova firma faccia passare una chiave errata. Le patch di test sono
ripristinate prima del rapporto finale.

Limiti: questa review non prova browser, importazione, CI, merge, comprensione
con studenti o accessibilità empirica. Non aggiorna registro, checkpoint o stato
di pubblicazione. Il contratto può essere aggiornato dal coordinatore senza
modificare firme di contenuto; in quel caso `report()` deve produrre nuovamente
il metadato `contractSha256` e i controlli pertinenti vanno rieseguiti.
