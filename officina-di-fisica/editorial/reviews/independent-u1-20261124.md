# Revisione indipendente AI — 64 quesiti U1 — 24 novembre 2026

## Identità, giudizio e ambito

Revisore: agente AI `/root/review_corpus_increment`, distinto dall'agente autore/integratore dei tre lotti. Questo agente ha letto e risolto i quesiti, esaminato le opzioni e segnalato le correzioni riportate sotto; non ha scritto i pacchetti, i verificatori o le correzioni del coordinatore. Le revisioni sono state svolte senza modificarli. Questa è una revisione tecnica/scientifica AI, **non un'approvazione umana**, né un'autorizzazione alla pubblicazione. `humanApproval=NOT_RUN`; `publication=DRAFT`.

Giudizio finale: nessun difetto bloccante residuo individuato nei **64 ID unici** dei lotti `units-001` (32), `scale-002` (16) e `vectors-003` (16), limitatamente alle esatte edizioni identificate dagli hash sotto. Le precedenti osservazioni sono state corrette e rilette. Non si estende questo giudizio agli altri quesiti del corpus o ai nuovi lotti degli autori paralleli.

Nell'ultima lettura precedente al salvataggio il worktree era sul branch `feat/cric-u1-scientific-scale`, HEAD `0509876b03fe8d5418651b83e9ad8b066fdbf538`, con modifiche non ancora tutte committate. La HEAD da sola **non identifica** i pacchetti esaminati: fanno fede gli hash dei file e del contenuto qui registrati.

Sorgente Ardesia verificata per tutti i 64 binding: commit immutabile `5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, file `packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U1-01.json`. Per ciascun ID sono stati ricalcolati il digest del record originale e quello del candidato, verificando `id=AR-<sourceId>`, `sourceRef`, `sourceSha256` e `candidateSha256`. Sono stati verificati anche gli allegati Base64 e la corrispondenza con i byte SVG locali.

## Identità delle edizioni esaminate

I digest canonici usano `pipeline.digest`: SHA-256 del JSON UTF-8 normalizzato da `pipeline.canonical`. Gli hash file identificano invece i byte esatti su disco, inclusa la formattazione.

| File sotto `editorial/batches/` | Digest canonico | SHA-256 del file |
|---|---|---|
| `units-001.json` | `8f23c52cf23aa8103781781e833400353a1fd637951911de7b5dadeac7542e17` | `c14695f422ecdded6798cb0d68af3337417f86fd41aeb25cb75f416de9cc9735` |
| `units-001-bindings.json` | `c489932e94e5588d9fe1a1db096c04f0e0613250c6b5032f9b38840a609f95df` | `064f72b2f3515e7bf366bd94ecc9ec6a8d539df2d740fb786751443043a12e56` |
| `scale-002.json` | `e59930e4a40ca14a16e8b94ea5e739ed58c64fa17d70d468a58739155c8c8558` | `1737170d4925544e02f9225305822c22a0e87a526b56393cd25f5ebaa76fbcce` |
| `scale-002-bindings.json` | `7dcc038b87ecd36d1b640901d7a435d9eb57cfa154c11c3cae8a87cd329fd758` | `219ca87cf35a9b3657563be474279c2892e245f41d197f9e9aed45f1432c9418` |
| `vectors-003.json` | `d0fe631afa4b08d1e106653693cbd246ab0ed0341d54c991f48e768957f8f51d` | `b20319cf4ffa7c90c4c32e53170831b53acf6483ef6dcba77dbf0903045bc6da` |
| `vectors-003-bindings.json` | `76a6bedf23ee614b983cf0edbfcd9d676e647bf2054fe57bef13948abc83360a` | `6a3600be87c112dd1249e4bceba4089d34bffaa2619f2866211fd4f91029f0e0` |

Registro `editorial/batches/registry.json`, SHA-256 file: `945aedf3a4e76a75d2bc24671ff06c10d43e9225d41d00e4e1296fecbaf97f27`.

Fingerprint del runtime delle anteprime verificato: `710c7491ce1d2e18773d201fb7023c61d25a6254cbbd86a3a9f5e5852b7077da`.

Una modifica a enunciati, opzioni, feedback, unità, metadati rilevanti, binding o figure richiede una nuova verifica dell'edizione interessata; questo documento non rinnova automaticamente le firme.

## Verifica individuale: area e conversioni

Gli ID di questa tabella hanno prefisso completo `AR-u1-area-conversion-`. `A`, `B` e `c` sono valori numerici; le aree fisiche conservano dimensione `L²`. Sono state lette tutte le opzioni, non soltanto la chiave.

| ID finale | Risultato e controllo effettivamente esaminato |
|---|---|
| 01 | `8`: due caselle iniziali, ciascuna divisa in `2×2`; inversa `8/4=2`. La superficie fisica resta invariata. |
| 02 | `1`: `B=S/u²`, dunque `L²/L²=1`; `m²` appartiene a `S`, non al solo numero `B`. |
| 03 | `B=A c²`: il rapporto lineare interviene in due direzioni; `A c` omette una direzione e `A/c²` inverte il verso. |
| 04 | Raddoppia: con `c=2` fissato si passa da `2×4=8` a `4×4=16`; non si deve elevare al quadrato anche la variazione di `A`. |
| 05 | `2`: `A=8/2²=8/4`; la divisione per il solo fattore lineare darebbe una conversione errata. |
| 06 | `2`: `c²=8/2=4`; rapporto fra lunghezze positivo, quindi radice positiva. |
| 07 | `4`: `(4/2)²`; cambia il conteggio delle unità, non la superficie fisica. |
| 08 | `3000 kg/m³`: `(6×10⁻³)/(2×10⁻⁶)=3×10³`; volume finale assegnato. Concentrazione del soluto distinta dalla densità della soluzione. |
| 09 | `A=B/c²`: divisione lecita per `c>0`; sostituzione nell'originale restituisce `B`. |
| 10 | `κ₁κ₂²`: sostituzione nei due stati e cancellazione di `A₁c₁²`; caso `κ₂=1` restituisce `κ₁`. |
| 11 | `8`: `(4/2)(4/2)²=2×4`; controllo diretto `64/8=8`. |
| 12 | `36`: `(8+64)/2`; sono indicazioni numeriche con unità di uscita diverse, non una superficie media. L'uscita alle medie degli ingressi sarebbe `27`, operazione diversa. |
| 13 | `2`: tolto il raddoppio di `A`, resta un fattore `4` nell'uscita; rapporto lineare positivo `√4`. |
| 14 | `4`: guadagno `24/8=3`, poi `192/3=64`, infine `64/16=4`; guadagno costante e offset nullo dichiarati. |
| 15 | `4`: guadagno `(129−17)/(64−8)=112/56=2`, offset `1`, poi `(33−1)/2/4=4`. Un rapporto fra letture non elimina l'offset. |
| 16 | `2`: con `A=c>0`, `8=c³`. Senza il vincolo ci sarebbero più coppie, per esempio `A=8,c=1`. |

## Verifica individuale: volume e grandezze

Gli ID hanno prefisso completo `AR-u1-volume-conversion-`. Sono distinti il volume fisico, di dimensione `L³`, e i suoi valori numerici. Tutte le opzioni sono state lette.

| ID finale | Risultato e controllo effettivamente esaminato |
|---|---|
| 01 | `16`: due cubi, ciascuno con due strati da quattro cubetti; inversa `16/8=2`. |
| 02 | `1`: `W=Q/u³`, dunque `L³/L³=1`; `m³` sarebbe unità del volume fisico. |
| 03 | Massa e volume raddoppiano, densità invariata: `2m/(2V)=m/V`. Valido per stessa sostanza omogenea, stessa temperatura/pressione e volume additivo; non affermato per miscele arbitrarie. |
| 04 | Raddoppia: `16→32` con `c³=8` invariato. Il cubo riguarda `c`, non `V`. |
| 05 | `2`: `16/2³=16/8`; l'incognita `V` è lineare, quindi non serve una radice. |
| 06 | `2`: `c³=16/2=8`; controllo `2×2³=16`. |
| 07 | `8`: `(4/2)³`; due direzioni darebbero soltanto il fattore areale `4`. |
| 08 | `750 mL`: `3/4 dm³=3/4 L`, quindi `(1000/4)×3`; controllo fra `500` e `1000 mL`. |
| 09 | `V=W/c³`: sostituzione ricostruisce `W`; denominatore non nullo per `c>0`. |
| 10 | `κ₁κ₂³`: sostituzione nei due stati; con entrambi i fattori uguali a due si ottiene `16`. |
| 11 | `16`: `(4/2)(4/2)³=2×8`; controllo diretto `256/16=16`. |
| 12 | `136`: `16/2+256/2=8+128`; media delle sole indicazioni numeriche. Inserire nella legge `V=3,c=3` darebbe `81`, non la media richiesta. |
| 13 | `2`: tolto il fattore `2` di `V`, resta `8`, cubo del rapporto lineare. |
| 14 | `4`: guadagno `48/16=3`, indicazione corretta `768/3=256`, poi `256/64=4`. |
| 15 | `4`: guadagno `(513−33)/(256−16)=480/240=2`, offset `1`, poi `(65−1)/2/8=4`. |
| 16 | `2`: con `V=c>0`, `16=c⁴`; la radice negativa viola il dominio fisico positivo. Senza il vincolo il solo totale non determina entrambi gli ingressi. |

## Verifica individuale: notazione scientifica

Gli ID hanno prefisso completo `AR-u1-scientific-scale-`. Rapporti e coefficienti sono adimensionali salvo le richieste esplicite di pressione/lunghezza. Sono state controllate tutte le opzioni e le categorie del diario errori aggiornate per 02/04/07/08.

| ID finale | Risultato e controllo effettivamente esaminato |
|---|---|
| 01 | `20`: `2×10¹`; l'esponente non si somma al coefficiente. |
| 02 | `1`: rapporto fra due tempi in secondi, `T/T=1`; classificazione `unità` coerente. |
| 03 | `20`: `(4/2)10^(−3−(−4))=2×10`; riscrittura indipendente `40×10⁻⁴ / (2×10⁻⁴)`. |
| 04 | Raddoppia: `20→40` a esponente fisso; classificazione `concetto` coerente. |
| 05 | `2`: `20/10`; si distingue la normalizzazione della notazione dai passaggi intermedi. |
| 06 | `1`: `20/2=10=10ⁿ`; nessun logaritmo numerico necessario. |
| 07 | `40 nPa`: `4×10⁻⁸ Pa / (10⁻⁹ Pa)`; prefisso nano e verso della conversione controllati; categoria `unità`. |
| 08 | `10⁵ m` **con la convenzione logaritmica dichiarata**: `3²=9<10`, quindi `3<√10`. Non assunto come convenzione universale; categoria `concetto`. |
| 09 | `a=R/10ⁿ`: la potenza è positiva anche per esponenti zero/negativi; dividere per `n` sarebbe diverso. |
| 10 | `κ₁·10^[n₁(κ₂−1)]`: sottrazione degli esponenti; `n₂` deve restare intero. Le formule sono confrontate come relazioni generali, non su un solo caso speciale. |
| 11 | `20`: `(4/2)10^(2−1)`; controllo `400/20`. |
| 12 | `210`: `(20+400)/2=10+200`; non si mediano separatamente coefficienti ed esponenti. |
| 13 | `2`: tolto il fattore `2` del coefficiente resta `10`, quindi `n₂−1=1`, `n₂=2`, `n₂/n₁=2`. Distinti pedice, differenza e rapporto degli esponenti. |
| 14 | `4`: guadagno `60/20=3`, poi `1200/3=400`, coefficiente `400/100`. Offset nullo dichiarato. |
| 15 | `4`: guadagno `760/380=2`, offset `1`, poi `(81−1)/2/10=4`; ricostruzione `2×40+1=81`. |
| 16 | `7`: `(4×10ⁿ)²/(2×10^(n+3))=8×10^(n−3)`; `n−3=4`. Controllo `16×10¹⁴/(2×10¹⁰)=8×10⁴`; parentesi dell'esponente al denominatore essenziali. |

## Verifica individuale: somma di spostamenti

Gli ID hanno prefisso completo `AR-u1-vector-sum-`. Sono state controllate tutte le opzioni, la distinzione posizione/spostamento, le dimensioni del guadagno e l'esplicitazione delle direzioni in tutte le prove.

| ID finale | Risultato e controllo effettivamente esaminato |
|---|---|
| 01 | `4 m`: due spostamenti consecutivi concordi `+2+2`; distanza e modulo coincidono qui perché non vi sono inversioni. |
| 02 | `m`: dimensione di lunghezza per componenti e modulo; vettorialità distinta dall'unità di misura. |
| 03 | `D=a+b`: moduli positivi, stessa retta e stesso verso; differenza per versi opposti e Pitagora per componenti perpendicolari non si applicano qui. |
| 04 | `4 m→6 m`: cambia un solo addendo. Dopo correzione, cinque esiti distinti; `3 m` è il distrattore della media indebita dei nuovi tratti. Direzioni conservate esplicitamente. |
| 05 | `2 m`: `4−2`; un modulo negativo contraddirebbe le ipotesi concordi. |
| 06 | Coordinata `+5 m`: `−2+3=1`, poi `1+4=5`. Lo spostamento è invece `5−(−2)=+7 m`; il distrattore `7` risponde a un'altra domanda. |
| 07 | `3/2`: totali `6 m` e `4 m`, non rapporto fra i soli secondi tratti; unità cancellate. |
| 08 | `+4 m`: scarto definito come proposto meno corretto, `8−4`; cambiando l'ordine cambierebbe il segno. |
| 09 | `a=D−b`: dominio `D>b>0`; la sottrazione mantiene la dimensione di lunghezza, a differenza di `D/b` e `Db`. |
| 10 | `(κ₁a+κ₂b)/(a+b)`: rapporto fra somme, media pesata dei fattori. La media semplice vale solo per `a=b`; direzioni fissate in entrambe le prove. |
| 11 | `2`: `8/4`; raccoglimento `2a+2b=2(a+b)`, non prodotto di due raddoppi. |
| 12 | `6 m`: `(4+8)/2`; mediare prima i tratti dà anche `3+3=6` per linearità e direzioni/unità comuni. |
| 13 | `2`: totale iniziale `4 m`, nuovo `8 m`, tratto mancante `8−4=4 m`, quindi `4/2`. Esplicita concordanza in tutte le prove: senza di essa il controesempio `b₂=12 m` opposto sarebbe possibile. |
| 14 | `4 m`: `g=12/(4 m)=3 m⁻¹`, `D=24/g=8 m`, primo tratto `8−4`. Conteggi adimensionali e guadagno inverso di lunghezza; senza concordanza nella nuova prova esisterebbe anche il tratto opposto da `12 m`. |
| 15 | `4 m`: `g=(17−9)/[(8−4) m]=2 m⁻¹`, offset `c=1`, poi `D=(13−1)/g=6 m`, primo tratto `6−2`. Il precedente enunciato ammetteva anche l'opzione `8 m` con tratti opposti, poiché `|8−2|=6`; la condizione aggiunta in tutte le prove esclude il controesempio. |
| 16 | `2 m`: `a=b>0`, quindi `4 m=2b`; senza uguaglianza esistono altre coppie, come `1 m` e `3 m`. |

## Figure e presentazione matematica

- Area: due vecchie caselle con due suddivisioni per ciascun lato, otto nuove caselle; bordo e superficie invariati.
- Volume: due cubi, due strati da quattro cubetti per cubo, sedici cubetti complessivi.
- Tempi: `4×10⁻³ s=40×10⁻⁴ s`, contro `2×10⁻⁴ s`; barra da venti celle contro una, alla stessa scala, con cella da `2×10⁻⁴ s`.
- Coordinate: su tutti e tre gli assi, `−2,0,+1,+5` si trovano rispettivamente alle ascisse grafiche `32,100,134,270`; scala `34 px/m`. Le frecce misurano `102 px=3 m` e `136 px=4 m`. Coordinata finale `+5 m`, spostamento totale `+7 m`.
- L'ordine delle tappe è verticale e le didascalie lo dichiarano. La scomposizione delle catene di uguaglianze/implicazioni in blocchi brevi è stata riletta: non cambia i risultati o le ipotesi.

## Findings precedenti e verifica della risoluzione

| Finding | Controprova o rischio esaminato | Esito riletto |
|---|---|---|
| Verificatore accettava batch vuoto/parziale | `verify({'records': []}, bindings)` restituiva lista vuota; `all([])` poteva dare successo. | Insieme completo e unico degli ID obbligatorio; vuoto, subset e duplicati rifiutati. |
| Binding generato poteva rinnovare una lettura scientifica | Cambiato il fattore lineare di area-01 da due a tre e rigenerato il binding: prima passava ancora con risposta otto invece di diciotto. | Firma indipendente congelata su record, figure e provenienza; rebinding non rinnova la firma. |
| Provenienza copiata senza controllo | ID sorgente inventato, commit alterato e hash originale tutto zero passavano. | Provenienza inclusa nella firma e confrontata con il ledger sorgente. |
| Byte SVG esclusi dall'identità | Cambiare l'immagine lasciava invariato il semplice `src`. | Hash dei byte locali/caricati compresi nell'identità scientifica; allegati mancanti/non recensiti rifiutati. |
| Materiali DRAFT distribuibili | Codice autore incluso da `tools/package_release.py`; figure sotto la route statica pubblica. | Tool editoriali e relativi test esclusi dal pacchetto; figure spostate nell'area editoriale e caricate come asset protetti. |
| Cache precedente non verificata | Shard modificabile prima del riuso delle vecchie decisioni. | Verifica dei checksum completi, del puntatore e dell'indirizzo di contenuto prima del riuso. |
| Precisione decimale persa | `exact('1.00000000000000001')` restituiva uno passando dal float AST. | Lettura del letterale originale: frazione esatta distinta da uno. |
| Limite esponenti aggirabile con underscore | `1e1_01` accettava l'equivalente di `1e101`, rifiutato senza underscore. | Underscore rifiutato; controllo riletto con controprova in memoria. Derivata seconda controllata; ordine cinque rifiutato. |
| Cache reintroduceva tassonomia ritirata | Stato ritornava `ACCOUNTED`, ma famiglia/competenza restavano quelle della bozza rimossa. | Ricostruzione dei metadati dalla sorgente, riuso della sola aritmetica; nel caso avverso la voce cached coincide con quella pulita. |
| Output scientifici non vincolati al registro | Un verificatore poteva restituire un subset o duplicare risultati senza controllo del coordinatore. | Unicità/completamento degli ID e confronto di hash, modalità e stati obbligatori. |
| Prova browser non legata al renderer | Un cambio CSS/server lasciava valido il solo hash di pacchetto e script. | Fingerprint del runtime e delle dipendenze di audit confrontato con la prova. |
| Canonicalizzazione JSON diversa tra JS e Python | `1e-6` e `1.0` producevano byte diversi pur rappresentando gli stessi numeri. | La prova browser usa SHA-256 dei byte esatti del file, senza canonicalizzazione numerica fra linguaggi. |
| vectors-003/04: due distrattori equivalenti | «Si dimezza da 4 m a 2 m» e «Diventa 2 m» erano lo stesso esito. | Secondo esito sostituito con la media indebita `3 m`; opzioni rilette. |
| vectors-003/13–15: direzioni non mantenute esplicitamente | Controesempi opposti da `12 m` e, per 15, opzione `8 m` compatibile con il display. | Concordanza e stessa retta dichiarate in tutte le prove; aggiornati anche 04/10/11. |

È stata inoltre svolta una revisione separata della correzione HTTP per figure d'esame: gli alias con punto/slash codificato potevano passare dal ramo statico pubblico. La prima correzione lasciava un bypass reale su APFS: richiesta guest `/FIGURES/C6-impulso.svg` con risposta `200`, riprodotta in un DB temporaneo. La correzione finale normalizza il primo segmento protetto e controlla con `samefile` gli antenati del target del ramo statico. Il test HTTP mirato è stato rieseguito indipendentemente con successo: guest negato, owner autorizzato con byte identici, route pubbliche leggibili. Non è stata eseguita una prova nativa Windows; i casi con dot/spazio sono copertura di diniego, non una certificazione di quella piattaforma.

## Prove eseguite e limiti

Nell'ultima verifica dei 64 ID questo agente ha eseguito `validate_batch` per tutti e tre i lotti. La verifica scientifica corrente coincide con i report congelati; ciascun lotto è stato importato due volte in un nuovo SQLite temporaneo tramite l'importatore canonico, verificando idempotenza e identità dei materiali pubblicati prima/dopo. Le prove browser salvate risultano complete e vincolate ai byte dei pacchetti, allo script e al runtime sopra: 96 casi per units, 48 per scale e 48 per vectors, totale 192, alle larghezze 1440/768/320; allegati protetti e condizioni automatiche senza violazioni/overflow oltre soglia.

Questo agente ha validato i report browser e i loro vincoli; **non ha eseguito personalmente tutti i 192 rendering**. Le esecuzioni browser sono state effettuate dall'integratore. Nessun DB reale o server di produzione è stato modificato durante queste revisioni. Prima di questo salvataggio il revisore non aveva modificato alcun file; questo verbale è il suo unico file di persistenza autorizzato.

Limiti espliciti:

- Nessuna approvazione umana, pubblicazione o accettazione empirica da parte di studenti è attestata.
- L'esame manuale di testi, distrattori, ipotesi e fattibilità aritmetica è una valutazione AI; non equivale a calibrazione psicometrica o revisione professionale firmata da una persona.
- Le verifiche automatiche e axe non certificano da sole WCAG, UDL o usabilità con persone DSA/ADHD.
- Nessuna certificazione dell'intero corpus da 4.606 quesiti: questo giudizio riguarda soltanto i 64 ID elencati.
- I 199 risultati recuperati sono una selezione upstream distinta. Non si afferma che identifichino il lotto Pro100 richiesto, né che questo revisore abbia riletto scientificamente tutti i 199 quesiti.
- Nessun nuovo lotto degli autori paralleli è incluso implicitamente. Richiede lettura e controprove indipendenti, poi una propria attestazione con hash.
- Non è stata rieseguita da questo agente l'intera CI né verificato un merge finale di questo incremento. Il giudizio vale per gli artefatti identificati, non per una futura SHA non esaminata.

Stato finale di questo verbale: **AI_REVIEWED_EXACT_EDITION / HUMAN_APPROVAL_NOT_RUN / DRAFT / NO_NEW_BLOCKER_FOUND_WITHIN_SCOPE**.
