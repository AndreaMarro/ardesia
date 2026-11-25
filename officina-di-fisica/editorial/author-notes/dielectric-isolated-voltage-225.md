# dielectric-isolated-voltage-225 — note dell’autore

Fonte immutabile 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605: packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-04.json. Raw SHA256 179bf1cacfb83482e32bb41e99cb78296990faafba1fe9ce3b0e3cbc3a6a09cf. Tutti gli 80 prompt B225–229 letti prima di questi candidati tramite allowlist id/prompt/familyId/lawFamily; nessuna opzione, chiave, soluzione o hint originali. Snapshot allowlist160 SHA256 4aec8d0bacfbd7c9d3b712a5d0d9de7e24a80e66b38bf53ca16cbf484a90f466.

Primarie indipendenti congelate prima delle candidature: propria primaria A220–224 commit 6951ab79682aa638f53cd6e00e5eb14458c63742 SHA 08e1a184ade8bd85a9d6d8f4b919b18105877f0c2007729ba514f0f48f36eb58; primaria del revisore A B225–229 commit 47cb9cbefc0def9db276d2ba106e3f2491b60e7f SHA 1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a. L’autore non ha aperto le risposte della primaria A, né candidati A220–224.

Catalogo Cric 5d1dc8dc7b601aef959d10d564c75462be74708d, content/C4.json SHA256 19d52336dd1024113f45f33a03e4d71e262ee6357477948124c7fecec855c67c. Rilette le lezioni reali C4-L04 (polarizzazione e cariche legate), C4-L07 (capacità, dielettrici, energia e vincoli collegato/isolato), C4-L09 (prodotto vettoriale e lavoro magnetico nullo); fondazioni C1 e C4 già esistenti. Nessuna competenza inventata.

Stessa pipeline assemble_family/astra1, course C4 e unit u6, ID AR-<sourceId>, reuse C6. DRAFT; revisione scientifica indipendente NOT_RUN, humanApproval NOT_RUN, nessuna pubblicazione. Queste sono soluzioni e note dell’autore, non certificazioni indipendenti.

Tecnico reale: due assembly identici, hash source/candidate/provenance e opzioni letterali distinte; import canonico in SQLite temporaneo con 16 nuove bozze, poi 0 nuove e 16 invariate, 991 pubblicati byte-identici, nessuna nuova testa live. Operazioni sotto flock comune e guardia interna almeno 2 GiB liberi. Nessun registro, ledger, runtime o checkpoint modificato.

Render nativo SVG-only realmente terminato exit0 e immagine completa letta; PNG, risultato geometrico e checksum conservati in author-evidence/dielectric-isolated-voltage-225-asset-only. Non è UI del prodotto: axe, formule e overflow a 320 nel lettore NOT_RUN. Non esistono marker sintetici o nuovi giudizi scientifici ricavati dal render.

Geometria per il revisore, in coordinate intrinseche SVG: Tre pannelli. Sezioni iniziale e finale schematiche con identica geometria, generatore assente e stessa Q libera. Esempio aggiuntivo esplicito: C₀=1 μF, V₀=12 V, Q=12 μC; dopo κ=2, C=2 μF, V=6 V. I simboli + e − indicano il segno, non conteggi di cariche. Barre A 6 V, B 3 V e media 9/2 V dal comune x150: larghezze 240/120/180, scala 40 coordinate/V. Grafico finale a κ=2 da (150,1300) a (470,1140), cioè (V₀,V)=(0,0)→(12,6). Scale 80/3 coordinate per volt su ciascun asse e pendenza fisica 1/2. Origini a sinistra degli assi; nessuna interpolazione fra prove con κ diverso.

## 01 — Prima il vincolo di isolamento

L’isolamento conserva il modulo Q della carica libera su ciascuna armatura. Prima Q=C₀V₀, dopo Q=κC₀V: uguagliando le due espressioni si ottiene V=V₀/κ. Raddoppiare la capacità a carica fissata dimezza la tensione: dodici diviso due dà sei volt.

Passaggi: `Q=C_0V_0\qquad Q=\kappa C_0V\qquad V=\frac{V_0}{\kappa}\qquad V=6\,\mathrm V`

Distrattori: Ventiquattro V moltiplica invece di dividere per κ. Dodici V imporrebbe il generatore ancora collegato; tre V dividerebbe due volte per κ. La polarizzazione modifica la capacità senza creare nuova carica libera sulle armature.

## 02 — L’unità della tensione

Una differenza di potenziale è energia per unità di carica, quindi si misura in volt: V=J/C. κ è un rapporto di permittività e non ha unità; dividere V₀ per κ conserva l’unità volt.

Passaggi: `[V]=\mathrm{J/C}\qquad [\kappa]=1`

Distrattori: C misura carica e F capacità. J misura energia, mentre T è tesla, unità del campo magnetico. Nessuna di queste quattro grandezze coincide con la tensione.

## 03 — Che cosa conserva lo scollegamento?

Senza un percorso conduttivo esterno non si trasferisce carica libera da o verso ciascuna armatura. Il modulo Q resta quello iniziale. La carica netta delle due armature insieme è nulla prima e dopo, ma questo fatto da solo non determinerebbe Q: il vincolo riguarda ciascuna armatura isolata.

Passaggi: `Q_f=Q_i\qquad C_f=\kappa C_0\qquad V_f=V_0/\kappa`

Distrattori: Tensione e capacità cambiano se κ>1. Anche l’energia del campo diminuisce a Q fissata: il bilancio completo comprende l’interazione meccanica con il dielettrico. L’isolamento elettrico non significa conservazione dell’energia del solo condensatore.

## 04 — Una preparazione iniziale meno carica

Ogni prova è prima preparata e poi isolata. La tensione finale è metà di quella iniziale in entrambe: A dà 6 V, B dà 1/2 V. Non si sta variando V₀ sul medesimo condensatore già isolato attraverso un generatore nascosto.

Passaggi: `V_A=12/2\,\mathrm V\qquad V_B=1/2\,\mathrm V`

Distrattori: Due V moltiplica il nuovo V₀ per κ. Un V ignora l’inserimento; sei V trasferisce a B il risultato di A. Il fattore fra le due uscite è 1/12, come fra le tensioni iniziali.

## 05 — Risalire alla tensione prima dell’inserimento

Moltiplico V=V₀/κ per κ e ricavo V₀=κV. Due volte sei volt restituisce dodici volt. La tensione prima dell’inserimento deve essere almeno quella finale, perché κ≥1.

Passaggi: `V_0=\kappa V\qquad V_0=2\cdot6\,\mathrm V\qquad V_0=12\,\mathrm V`

Distrattori: Tre V dividerebbe ancora per κ e non ricostruirebbe lo stato iniziale. Sei V ignorerebbe la capacità aumentata. Trentasei copierebbe V² e non avrebbe l’unità di una tensione senza un coefficiente ulteriore.

## 06 — Il rapporto che misura κ

L’inversa è κ=V₀/V. Il rapporto di due tensioni è puro e vale 12/6=2. Il valore è compatibile con il dominio κ≥1; una misura finale maggiore di quella iniziale contraddirebbe questo modello isolato con inserimento completo.

Passaggi: `\kappa=\frac{V_0}{V}\qquad \kappa=2`

Distrattori: Un mezzo inverte il rapporto e viola κ≥1. Sei copia la tensione finale senza normalizzarla. Settantadue moltiplica due tensioni e non ricava una costante relativa.

## 07 — Il riferimento senza aumento di permittività

Il caso κ=1 è ammesso: non aumenta la capacità rispetto a C₀. B conserva quindi 12 V, mentre A termina a 6 V. Il rapporto B/A è due; non si annulla la tensione quando manca l’effetto dielettrico.

Passaggi: `V_A=6\,\mathrm V\qquad V_B=12\,\mathrm V\qquad V_B/V_A=2`

Distrattori: Un mezzo scambia il confronto. Uno trascura la diversa capacità finale; quattro introduce un quadrato assente nella legge di tensione. Zero non soddisfa Q=C₀V₀ con V₀ positivo.

## 08 — Conservare il segno dello scarto

La tensione finale corretta è 6 V. La proposta eccede quel valore di 12−6=6 V. Il rapporto proposta/corretta sarebbe due, ma qui si chiede una differenza con unità volt.

Passaggi: `V=6\,\mathrm V\qquad \delta V=(12-6)\,\mathrm V\qquad \delta V=6\,\mathrm V`

Distrattori: −6 V inverte l’ordine della sottrazione. Dodici V copia la proposta; zero non riconosce la differenza. Due puro cambia l’operazione da scarto a rapporto.

## 09 — L’inversa simbolica mantiene le unità

Dalla conservazione C₀V₀=κC₀V cancello la capacità iniziale, positiva. Rimane V₀=κV. Il fattore κ è adimensionale, perciò il risultato conserva l’unità di V.

Passaggi: `C_0V_0=\kappa C_0V\qquad V_0=\kappa V`

Distrattori: V/κ ripete la trasformazione diretta. κ/V è una tensione inversa e κV² ha unità V²; V−κ somma quantità di dimensioni diverse.

## 10 — Due fattori e due domini

Sostituisco i fattori nella tensione finale: V_B=κ₁V₀,A/(κ₂κ_A). Dividendo per V_A si cancellano le quantità iniziali e resta κ₁/κ₂. I fattori non devono portare κ_B sotto uno; il vincolo vale per entrambe le prove.

Passaggi: `V_B=\frac{\kappa_1V_{0,A}}{\kappa_2\kappa_A}\qquad V_B/V_A=\kappa_1/\kappa_2`

Distrattori: Il prodotto rende diretto anche il fattore della permittività. Il rapporto invertito scambia i ruoli; il quadrato non appartiene alla legge V₀/κ. La somma darebbe due fra prove identiche.

## 11 — Cambiano anche le tensioni iniziali

A dà 6 V; B dà 3 V. Il rapporto è 1/2. La minore tensione iniziale e il maggiore κ riducono entrambi l’uscita; i loro fattori si combinano come (3/4)/(3/2).

Passaggi: `V_A=6\,\mathrm V\qquad V_B=3\,\mathrm V\qquad V_B/V_A=\frac12`

Distrattori: Due inverte il confronto; 3/4 segue soltanto V₀ e 3/2 copia il fattore di κ senza invertirlo. Uno non rispetta nessuno dei due cambiamenti combinati.

## 12 — La media di due tensioni finali

La media delle uscite è (6+3)/2=9/2 V. Le medie degli ingressi, V₀=21/2 V e κ=5/2, darebbero invece 21/5 V. La differenza è 3/10 V: dividere per un ingresso variabile impedisce di scambiare in generale media e legge.

Passaggi: `\overline V=\frac{6+3}{2}\,\mathrm V\qquad \overline V=\frac92\,\mathrm V\qquad V_{\rm dati\ medi}=\frac{21}{5}\,\mathrm V`

Distrattori: 21/5 V usa gli ingressi medi. Nove V somma senza dimezzare, 3/2 V prende la semidifferenza e zero confonde la tensione fra piastre con la carica netta nulla del condensatore.

## 13 — Trovare il dielettrico per il bersaglio

Il bersaglio è 3 V. Con V₀,B=9 V occorre κ_B=9/3=3. Rispetto a κ_A=2 il rapporto è 3/2. Non si dimezza semplicemente κ: una permittività relativa maggiore riduce la tensione finale.

Passaggi: `V_B=3\,\mathrm V\qquad \kappa_B=3\qquad \kappa_B/\kappa_A=\frac32`

Distrattori: 2/3 inverte il rapporto richiesto. Un mezzo copia il bersaglio della tensione; 3/4 segue solo la preparazione iniziale. Due darebbe κ_B=4 e V_B=9/4 V, fuori bersaglio.

## 14 — Uno strumento proporzionale a V

Il riferimento vale V_A=6 V, quindi a_cal=3 V⁻¹. D_B=9 indica V_B=3 V. Ricostruisco la tensione prima dell’inserimento: V₀,B=κ_BV_B=9 V.

Passaggi: `a_{\rm cal}=3\,\mathrm V^{-1}\qquad V_B=3\,\mathrm V\qquad V_{0,B}=9\,\mathrm V`

Distrattori: Ventisette V tratterebbe D=9 come nove volt, saltando il guadagno. Un V dividerebbe 3 V per κ invece di moltiplicare. Tre V copia la tensione dopo l’inserimento.

## 15 — Due riferimenti e un offset

I riferimenti hanno tensioni finali 6 e 3 V. Il guadagno è (13−7)/(6−3)=2 V⁻¹ e l’offset uno. D_C=5 restituisce V_C=(5−1)/2=2 V; prima dell’inserimento servivano V₀,C=4·2=8 V.

Passaggi: `a_{\rm cal}=2\,\mathrm V^{-1}\qquad b_{\rm cal}=1\qquad V_C=2\,\mathrm V\qquad V_{0,C}=8\,\mathrm V`

Distrattori: Dieci V omette l’offset e produrrebbe D=6. Sedici V sottrae l’offset ma non divide per il guadagno. Due V copia l’uscita decodificata senza annullare l’effetto del dielettrico.

## 16 — Un dato che ripete il vincolo

Inserendo il vincolo nella legge, V=(6 V)κ/κ=6 V per ogni κ≥1. La misura ripete dunque un’informazione già contenuta nel vincolo e non fissa la scala. Esempi sono (6 V,1), (12 V,2) e (9 V,3/2).

Passaggi: `V=\frac{(6\,\mathrm V)\kappa}{\kappa}\qquad V=6\,\mathrm V\qquad \kappa\ge1`

Distrattori: Non nasce un’equazione quadratica con due radici. κ è una costante relativa continua, non un conteggio intero; scegliere κ=2 sarebbe una preparazione possibile, non una conseguenza dei dati.
