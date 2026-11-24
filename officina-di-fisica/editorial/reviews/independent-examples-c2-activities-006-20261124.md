# Revisione indipendente C2-E005–C2-E012 e nuova bozza E005

Questa lettura è svolta da un revisore AI distinto sia dall'autore storico sia dall'integratore che ha scritto la nuova edizione E005. Letti integralmente gli otto originali, i cinque SVG storici e la nuova bozza con SVG; immagini anche visualizzate con rendering Quick Look locale. Il revisore ha modificato soltanto verificatore, report, nota e test assegnati, mai originali o nuova edizione. Nessun import del modulo autore nell'oracolo.

**Giudizio sugli originali:7 PASS_AI,1 FAIL (C2-E005).** Il FAIL originale rimane tale. **Giudizio misto per integrazione:7 originali validi più1 nuova bozza E005 valida nel suo modello esplicito,8/8 accettati.** La nuova bozza è versione2/base1; non sostituisce in memoria il giudizio dell'edizione pubblicata, conservato separatamente con `ok=false` e controesempio. DRAFT per la nuova edizione,NONE per gli altri sette;HUMAN_APPROVAL_NOT_RUN ovunque,nessuna pubblicazione.

Fonte storica Cric `5d1dc8dc7b601aef959d10d564c75462be74708d:officina-di-fisica/content/C2.json`, SHA-256 file `7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23`. Hash e figure confrontati con effettivi byte Git; nessuna approvazione ereditata da una chiave originale o dal vecchio report preliminare PASS, che è superato dal finding documentato qui.

## C2-E005 — Originale FAIL; nuova bozza separata

SHA originale `20ad8b54dc2f2361a5f3b5c64fd757847abb7ae4e0db69841617ce4a27447c94`, versione1. All'istante iniziale i pistoni sono alla stessa quota: rapporto aree60/5=12, pressione aggiuntiva40N/(5cm²)=80000Pa,forza iniziale480N. Conservazione volume dà corsa grande `(5/60)×12cm=1cm`, corretta. La moltiplicazione40×0,12=480×0,01=24/5J è eseguibile a mano, ma il suo uso come bilancio della corsa verticale finita ha un'ipotesi fisica non dichiarata.

Il piccolo scende12cm mentre il grande sale1cm;il dislivello passa da0 a13cm. Liquido ideale incomprimibile e assenza attrito non ne annullano il peso. Controesempio ammissibile con densità1000kg/m³,g10m/s² e forza entrante40N costante: se il grande sale y,il piccolo scende12y;la differenza idrostatica èρg13y. Quindi

`F₂(y)=480−13ρgA₂y`, con A₂=60/10000m² e y finale1/100m.

Forza finale `2361/5=472,2N`; integrando sulla corsa, lavoro uscita `4761/1000=4,761J`, diverso da input24/5J. L'aumento di energia gravitazionale del fluido è `39/1000=0,039J`, verificabile anche come `(ρg/2)(A₁s₁²+A₂s₂²)`. Somma4,761+0,039=4,8J esatta: nessuna dissipazione necessaria al controesempio. La figura originale è uno schema iniziale senza scala e non risolve l'assenza dell'ipotesi durante la corsa. **L'originale non viene attestato PASS.**

L'integratore ha scritto una nuova edizione;il revisore l'ha letta separatamente nel pacchetto effettivo `examples-c2-revisions-035.json`, non soltanto nell'authoring. L'enunciato ora assegna esplicitamente di trascurare la variazione idrostatica durante gli spostamenti;atmosfera esterna comune,fluido incomprimibile,nessun attrito/inerzia dei pistoni. La conclusione spiega che il bilancio non è esatto conservando il peso del liquido in una corsa finita. I pistoni sono alla stessa quota soltanto inizialmente. Questa definizione del modello rende coerenti forza costante480N,corsa1cm e lavori24/5J al suo interno;non pretende di misurare il dispositivo reale senza errore.

Procedure manuali della bozza:60/5=12;40×12=480;volume5×12=60cm³=60×1;12cm=12/100m,1cm=1/100m;40×12/100=24/5J e480/100=24/5J. Verifica indipendente con pressione×volume:80000Pa×60×10⁻⁶m³=24/5J. Otto controlli esatti separati per questa approssimazione,tutti PASS. Rapporti inversi ricostruiscono ingresso;errore di moltiplicare insieme forza e corsa per12 darebbe144volte il lavoro,non12. Nessuna calcolatrice necessaria.

Nuovo SVG `example-piston-model.svg`,SHA-256 `885323d0f54308d4575f441dd8aac5ea92d1d38f6b9b11d055b2d563edeaa814`:tre tappe esplicitamente non in scala,force40/480N,corse opposte12/1cm,volume60cm³,lavori24/5J. Testi dichiarano sia variazione idrostatica trascurata sia pistoni che non restano alla stessa quota. XML e rendering integrali letti;asset locale,uploadBase64 e `/asset/hash` concordano. Nessun'altra scala numerica inferita dalle larghezze o dalle frecce schematiche.

Firma della nuova bozza,congelata soltanto dopo lettura di questi byte: `6c1ca118088b01b7005fb6049afe39b08a3f624f5cfb061bf00597e885f5d8d1`. SHA candidato `2f3331667ec4f7c9f5a1327e46ea29ffc1a71657f0b20880c8b73fd266dbd812`. Il report della bozza conserva `publishedEditionReview.ok=false`, `failedPublishedEdition=true`, `sourceVersion=1,candidateVersion=2,baseVersion=1`, `publicationAction=DRAFT`, `originalEditionRetained=true`. Quest'ultimo significa storia preservata,non approvazione dell'originale.

## C2-E006 — Un pistone posto più in alto

SHA `eeadaa695d742b80ea3d0a4b693acff2db19f8cf58496543461a2dd95aa5fa64`. Acqua ferma conρ1000,g10 e uscita0,40=2/5m più alta. PerdeρgΔh=1000×10×2/5=4000Pa=4kPa;pressione relativa18−4=14kPa. Area20cm²=2/1000m²;forza14000×2/1000=28N. Atmosfera esterna comune e pistoni leggeri sono dichiarati. Pascal trasmette un incremento,non cancella la differenza idrostatica preesistente. Sommare invece4kPa darebbe44N;ignorare quota darebbe36N. Nessuna figura. PASS.

## C2-E007 — La parte che emerge

SHA `2331004f4682ba4d7fe08d140d9a106f3090d4a3a593068b3a59e1b87734fe51`. Galleggiamento libero in equilibrio:ρ_f g V_i=ρ_b g V. g si cancella;800/1000=4/5;450×4/5=360cm³ immersi e450−360=90cm³ emersi. Densità uniforme e impermeabilità del blocco nel modello,nessun sostegno esterno;spinta aria/capillarità trascurate.360risponderebbe al volume immerso,non alla domanda. Figura distingue parti e forzeS/P uguali/opposte;schema qualitativo senza quote numeriche,non una misura grafica di4/5. PASS.

## C2-E008 — Una lettura sotto la superficie

SHA `6cb57405419bdfbb86ad438be8c4f270f543b040653cae20e4580bf83c29d8e6`. Oggetto fermo completamente immerso e senza contatto col recipiente;aria trascurabile. Peso5N,tensione3N,spinta5−3=2N. V=2/(1000×10)=1/5000m³,m=5/10=1/2kg,densità(1/2)/(1/5000)=2500kg/m³. Dimensioni di spinta/(ρg) sono volume. Lettura3N in acqua è tensione,non peso;usare3/g darebbe1500kg/m³ errato. Densità maggiore dell'acqua coerente con sostegno verso l'alto. Nessuna figura. PASS.

## C2-E009 — Dalla sacca al tubo

SHA `b3bd6cec744f7c20e480c93120e57742cbf6c2478afbd4fdfc6288baafe957c0`. Regime stazionario:Q=120/40=3mL/s=3×10⁻⁶m³/s. Area15mm²=15×10⁻⁶m²=3/200000m². Velocità mediaQ/A=3/15=1/5m/s. Controcontrollo15×10⁻⁶m²×(1/5m/s)×1s=3mL. Area del prefisso va convertita al quadrato;nessuna ipotesi di profilo locale uniforme per la media sulla sezione. Nessuna figura. PASS.

## C2-E010 — Molti rami,un bilancio

SHA `0e40bb3454fa75f94c31dd1064d5278f02ed19df44f2da3e9141cc63d736abd7`. Fluido stazionario incomprimibile,stessa portata nei quattro rami,nessun accumulo. Q_in=πr_i²v_i=4πr_b²v_b. π e le unitàmm² si cancellano nel rapporto: `(9/20)×4/[4×(9/4)]=1/5m/s`. Area totale9πmm² maggiore dell'ingresso4πmm²,quindi velocità media minore. Dimenticare i quattro rami darebbe4/5m/s. Figura ha esattamente quattro usciteQ₁..Q₄;spessori schematici non usati per misurare raggi. PASS.

## C2-E011 — Leggere i due tubicini

SHA `7630e860561223ed106dfc09bac6ecd7f7c98f907788e1a13659ab54f1db4914`. Bernoulli ideale stazionario incomprimibile tra punti alla stessa quota:Δp=(1000/2)(3²−1²)=500×8=4000Pa. Piezometri aperti alla stessa atmosfera e liquido fermo nelle colonnine:Δh=4000/(1000×10)=2/5m. Pressione statica maggiore nella parte larga più lenta. Usare3−1 anziché9−1 darebbe1000Pa,non4000. Figura mette livello1 sopra2 e misuraΔh fra superfici libere,non fra bocche a quote diverse;geometria schematica senza scala quantitativa. PASS.

## C2-E012 — Efflusso da un grande recipiente

SHA `7222b1f1d0f3fe515c30281bdb8c1335dd0a61c399ad298c52cde53b5d112989`. Superficie libera e getto esterno alla stessa atmosfera;grande area del recipiente,piccolo foro,velocità superficiale trascurata e quasi stazionarietà esplicite. Bernoulli cancella pressione atmosferica eρ: v²=2gh=2×10×4/5=16m²/s²;radice uscente4m/s. Verificaenergia per massa v²/2=8m²/s²=gh. h è dislivello superficie–foro,non altezza intera del contenitore. Figura ha parete aperta al foro e freccia verso esterno. Stima ideale distinta da efflusso reale con contrazione/resistenze. PASS.

## Figure storiche e integrità

Cinque SVG confrontati byte per byte con Git e con le impronte congelate,interi XML letti e rendering locali visionati. Le illustrazioni storiche restano inalterate,anche quella dell'originale E005 FAIL. Nessuna misura quantitativa di raggi,sezioni o frazioni ricavata da schemi senza scala.

|SVG storico|SHA-256|
|---|---|
|C2-pressa.svg|`fb80bdf658d0cfc13979a52d2565a71c06f4788e49d6e6b921d746782d8808eb`|
|C2-spinta.svg|`2ecac15c1e05af22a89873203a18b57b63ba18235f8c9fd10acc52628b6a132f`|
|C2-dirama.svg|`7a3295a71362d746c67346fead28e7e41f30322499db9cbc0ea065b121095e6e`|
|C2-bernoulli.svg|`cf0bdde00128d3ba1f7d84cedc7062963a565dcd3b263873fb08d7dcec7efa63`|
|C2-efflusso.svg|`c317f8b741114f2cd273b5b0bed1acb11a43c5674802f2d0ede4296c78b466ee`|

## Hash dello snapshot e controprove

|Artefatto|SHA-256 canonico|SHA-256 byte|
|---|---|---|
|package nuova edizione035|`ddbbe9c47076c422d89c946d00a7bc5455c951afef711ae3fe13d38251c949f4`|`41d58e052965915c5480eb23a8cee8c843741145812a665f74cd6618da91216d`|
|bindings035|`e9fd11293fd0ba4020c070991a99355af905066275944728398dfdd3cf35a88a`|`662775394ff77ba3a1fac4d84c11832f5fda176f202253eeed629b9e7aea7f66`|
|originals006:7PASS/1FAIL,28checks|`f2174285e6153ab76d8b73a10de7d493f129a7e99cf60cace3675b40fe95fdc4`|`4d3df7b206fdf8269d8227fb9aa93eda0bcabc653b8d11b0188882d460c40453`|
|mixed006:7originali+1draft,30checks|`7ab0fbd44b2323f76ce5bfa62a7dc291db9b765a01ecc0fdc163f67ab7522b29`|`a10e15375531b445efc00c34f438b4e162cd63d231d25c9b5413f54e3ac1a7cb`|

`examples_c2b_activity_verifier.py` SHA-256 byte `b49251e2e9dc31097c2ee2481d5d0a2d8d386fbab14c0312c26d9c348a2bd73b`. Il report originals include il controesempio al lavoro non qualificato;il report misto lo mantiene nested come giudizio dell'edizione storica. Il nuovo modello non viene chiamato soluzione esatta del dispositivo con gravità del liquido inclusa.

Test riproducibile `tests/corpus/test_examples_c2_review.py`: **8/8 PASS in0,300s**, eseguito con runtime temporaneo `/private/tmp/cric-recovery-venv/bin/python` e prefisso cache separato dopo blocco iCloud del vecchio ambiente. Copre7/1originali;energia del controesempio esatta;8accettati con historicalFAIL e versioni1/2;modifica di ciascuna sorgente;formula nuova modificata+binding rigenerato rifiutata dal freeze;base/versione/fonte sbagliate rifiutate anche con token rinnovato solo in memoria;asset nuovo o storico mancante blocca la bozza;pacchetti vuoti/duplicati rifiutati. DRAFT/NONE/NOT_RUN e storia preservata verificati.

Il token sul testo/TeX/asset richiede nuova lettura indipendente se quei byte cambiano: il verificatore non è presentato come risolutore generale della fisica in linguaggio naturale. Gli esempi non hanno campo risposta da trattare come quesito;nessuna risposta inventata per adattarli al contratto. Tutti richiedono calcoli manuali effettivi;nessun `NO_STUDENT_CALCULATION`. Nessun test con studenti,pubblicazione,approvazione umana o prova browser completa attestati. Le impronte sono datate:report rigenerati con contratti condivisi aggiornati devono dichiarare la nuova dipendenza senza attribuire a questa nota contenuti non riletti.
