# Authoring DRAFT — heating-with-losses-168

Letti individualmente tutti gli 80 prompt assegnati A168–172 dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, source U5-03 SHA256 417d221f47f7e8e3b1f3af5f9a38fb9eebc7f344371b9e64b699e3892039fe6b. Riletti i testi reali delle lezioni C3-L01/L03/L04/L06. I casi speciali03 di170/171/172 sono preservati; i rapporti di letture Celsius saranno dichiarati come numerici e non assoluti.

Autore soltanto: DRAFT, revisione scientifica indipendente NOT_RUN, human NOT_RUN e publicationAction NONE. Queste sono note dell’autore, non un oracolo distinto né una firma scientifica.

Due assembly in processi separati danno package e binding byte identici. Importatore canonico ROOT in SQLite temporaneo:16 nuovi, poi0 nuovi/16 invariati;991 pubblicati e loro versioni storiche invariati, stesso SHA. Asset SVG riletto come XML e nel rendering nativo completo. Nessun runtime, CSS, candidato ROOT, registro o checkpoint modificato.

Stato UI: Per mandato dell’integratore non sono state avviate nuove anteprime del prodotto sul runtime b963 in attesa della correzione comune dei consumer. UI finale NOT_RUN per questo lotto; il gate rimane aperto. Nessun marker è stato creato o copiato da un’altra edizione.

Energia obiettivo120 J fissata, potenze termiche costanti e P>P_d>0. Il bilancio usa la differenza delle potenze, senza trattare la dispersione costante come legge universale. Nel caso 12 la media7s è distinta da48/7s agli ingressi medi; il vincolo 16 lega preparazioni, non genera potenza variabile nel tempo. Guadagno e offset dei display sono espliciti. Figura: potenze 20px/W, energia netta 8/3px/J e tempo 40px/s su assi o pannelli diversi, senza confrontare lunghezze come grandezze omogenee.

## AR-u5-heating-with-losses-01 — Il campione trattiene soltanto la differenza

Un campione chiuso richiede E=120 J netti per raggiungere la temperatura obiettivo; non cambia fase e il lavoro meccanico è trascurabile. Dal riscaldatore entra potenza termica P e verso l’ambiente esce P_d, entrambe costanti durante ciascuna prova, con P>P_d>0. La dispersione costante è un’ipotesi prescritta per questo intervallo, non una legge universale di raffreddamento. Il tempo t parte dall’accensione. Fra prove P e P_d possono cambiare, mentre E resta uguale. P=20 W e P_d=5 W. Quanto vale t in s?

Procedimento d’autore: Ogni secondo entrano venti joule e ne escono cinque: ne rimangono quindici. Per accumulare centoventi joule servono otto secondi. In quel tempo il riscaldatore trasferisce 160 J e l’ambiente ne riceve 40 J, lasciando proprio 120 J nel campione.

Passaggi: P_{\rm net}=P-P_d;  P_{\rm net}=15\,\mathrm W;  t=\frac{E}{P_{\rm net}};  t=8\,\mathrm s.

Distrattori: Sei secondi usa 120/20 e trascura la dispersione. Ventiquattro secondi usa soltanto 120/5. Sommare le potenze darebbe 24/5 s, ma conterebbe un’uscita come ingresso. Il reciproco della durata non è il tempo richiesto.

Fonte canonica SHA256 fd4d23d7589e9abe81e619b96e439d21e2d4e75db0b55543258e6a102b0b755c. Candidato SHA256 c499dcabfd2bd2030c12f69627e87a5513e35abf5d0bcb1d03e7adc5faf88fff. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-heating-with-losses-02 — L’unità del tempo ricavato da energia e potenza

Un riscaldamento richiede energia netta E e riceve potenza netta P_net>0. Quale unità esprime la durata E/P_net?

Procedimento d’autore: Un watt è un joule al secondo. Dividere un’energia per una potenza elimina il joule e lascia il secondo: è una durata, non la quantità di energia o il ritmo con cui arriva.

Passaggi: [t]=\frac{\mathrm J}{\mathrm{J/s}};  [t]=\mathrm s.

Distrattori: W misura la potenza e J l’energia. J/K è una capacità termica; s⁻¹ è una frequenza o un tasso. Nessuna di queste quattro unità equivale a una durata.

Fonte canonica SHA256 93e39ebbc1d76d012139859bfd1b4d5b06cc6c699b9f78e96ccb176c59537335. Candidato SHA256 6bd7cdfb94b62e469d53508c764972fcf93c7d278c15dc88fb0579055376c84c. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-heating-with-losses-03 — Il bilancio prima della divisione

Un campione chiuso richiede E=120 J netti per raggiungere la temperatura obiettivo; non cambia fase e il lavoro meccanico è trascurabile. Dal riscaldatore entra potenza termica P e verso l’ambiente esce P_d, entrambe costanti durante ciascuna prova, con P>P_d>0. La dispersione costante è un’ipotesi prescritta per questo intervallo, non una legge universale di raffreddamento. Il tempo t parte dall’accensione. Fra prove P e P_d possono cambiare, mentre E resta uguale. Quale relazione dà t?

Procedimento d’autore: Il bilancio energetico è E=Pt−P_dt=(P−P_d)t. Le due potenze hanno versi opposti al confine del campione. Poiché la differenza è positiva, si può dividerla e ottenere un tempo positivo e finito.

Passaggi: E=(P-P_d)t;  t=\frac{E}{P-P_d};  P-P_d>0.

Distrattori: La somma attribuisce alla dispersione il verso sbagliato. Il reciproco ha unità s⁻¹. E/P trascura l’uscita e E/P_d trascura l’ingresso. Se P=P_d non si raggiunge l’obiettivo energetico E>0 in un tempo finito.

Fonte canonica SHA256 9624edde0ca875d1ea9c66c5a22a7106c687781a349cb2b9c1f5a47a5036b940. Candidato SHA256 5c4033abeaa114c163c38ae46a0aa645d2b214de6fe896fbcba687605e70a64d. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-heating-with-losses-04 — Più potenza entrante a dispersione invariata

Un campione chiuso richiede E=120 J netti per raggiungere la temperatura obiettivo; non cambia fase e il lavoro meccanico è trascurabile. Dal riscaldatore entra potenza termica P e verso l’ambiente esce P_d, entrambe costanti durante ciascuna prova, con P>P_d>0. La dispersione costante è un’ipotesi prescritta per questo intervallo, non una legge universale di raffreddamento. Il tempo t parte dall’accensione. Fra prove P e P_d possono cambiare, mentre E resta uguale. A ha P=20 W e P_d=5 W. B ha P=30 W e lo stesso P_d=5 W. Come cambia t?

Procedimento d’autore: Le potenze nette sono 15 W in A e 25 W in B. Le durate sono quindi 120/15=8 s e 120/25=24/5 s. Il tempo diminuisce, ma non basta invertire il rapporto 30/20 delle sole potenze entranti: prima va tolta la stessa dispersione.

Passaggi: P_{\rm net,A}=15\,\mathrm W;  P_{\rm net,B}=25\,\mathrm W;  t_B=\frac{120}{25}\,\mathrm s;  t_B=\frac{24}{5}\,\mathrm s.

Distrattori: 16/3 s moltiplica 8 per 20/30 e dimentica la sottrazione. Dodici segue direttamente P, otto ignora il cambiamento e quattro imporrebbe una potenza netta 30 W, superiore ai 25 W effettivi.

Fonte canonica SHA256 27a023eb2bcf949da571f2cfaf5ec58f8d2e36b04ee73d80be0a34c7a6b9902e. Candidato SHA256 5cf56c97fa6b0c804e53a8ed5f7ab0ae60fd2378826bc38e7161736eb4a3f598. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-heating-with-losses-05 — Ricostruire l’ingresso dalle due destinazioni

Un campione chiuso richiede E=120 J netti per raggiungere la temperatura obiettivo; non cambia fase e il lavoro meccanico è trascurabile. Dal riscaldatore entra potenza termica P e verso l’ambiente esce P_d, entrambe costanti durante ciascuna prova, con P>P_d>0. La dispersione costante è un’ipotesi prescritta per questo intervallo, non una legge universale di raffreddamento. Il tempo t parte dall’accensione. Fra prove P e P_d possono cambiare, mentre E resta uguale. Si misura t=8 s e si conosce P_d=5 W. Quanto vale P in W?

Procedimento d’autore: Per trattenere 120 J in 8 s occorrono 15 W netti. L’ingresso deve fornire anche i 5 W che escono: P=15+5=20 W. Il risultato supera la dispersione, come richiede il ramo assegnato.

Passaggi: P-P_d=\frac Et;  P=P_d+\frac Et;  P=20\,\mathrm W.

Distrattori: Dieci watt sottrae 5 dai 15 netti; produrrebbe solo 5 W netti e richiederebbe 24 s. Quindici è la sola potenza netta, cinque la sola dispersione. Non si sommano direttamente secondi e watt.

Fonte canonica SHA256 d2f68052b121aa7682b59f11837f0e116b5ce87a866aae3c13b9e524026939bf. Candidato SHA256 8c0fc97ea58f9af4c51ae7818553e129be55990488191347087586e8f60c5633. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-heating-with-losses-06 — Quanto viene disperso durante il riscaldamento

Un campione chiuso richiede E=120 J netti per raggiungere la temperatura obiettivo; non cambia fase e il lavoro meccanico è trascurabile. Dal riscaldatore entra potenza termica P e verso l’ambiente esce P_d, entrambe costanti durante ciascuna prova, con P>P_d>0. La dispersione costante è un’ipotesi prescritta per questo intervallo, non una legge universale di raffreddamento. Il tempo t parte dall’accensione. Fra prove P e P_d possono cambiare, mentre E resta uguale. Si misura t=8 s e P=20 W. Quanto vale P_d in W?

Procedimento d’autore: Il campione deve ricevere 120/8=15 W netti. Dall’ingresso di 20 W restano 5 W diretti all’ambiente. L’inversa è P_d=P−E/t, e la positività richiede P>E/t, soddisfatto dai dati.

Passaggi: P_d=P-\frac Et;  P_d=(20-15)\,\mathrm W;  P_d=5\,\mathrm W.

Distrattori: Trentacinque somma la potenza netta all’ingresso. Quindici copia ciò che rimane nel campione; meno cinque inverte la sottrazione e cambierebbe il verso della dispersione dichiarata.

Fonte canonica SHA256 76f65066a45c017282ea5e8c390de7c62e5452fdd90f76d0d39049d9271c741d. Candidato SHA256 3b45f7b79140206e7bab0d5d080e4570521670b6316bb365a4cd2b97a71e021b. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-heating-with-losses-07 — Dispersione maggiore, durata maggiore

Un campione chiuso richiede E=120 J netti per raggiungere la temperatura obiettivo; non cambia fase e il lavoro meccanico è trascurabile. Dal riscaldatore entra potenza termica P e verso l’ambiente esce P_d, entrambe costanti durante ciascuna prova, con P>P_d>0. La dispersione costante è un’ipotesi prescritta per questo intervallo, non una legge universale di raffreddamento. Il tempo t parte dall’accensione. Fra prove P e P_d possono cambiare, mentre E resta uguale. A ha P=20 W, P_d=5 W. B mantiene P=20 W e ha P_d=10 W. Quanto vale t_B/t_A?

Procedimento d’autore: A dispone di 15 W netti e dura 8 s; B dispone di 10 W netti e dura 12 s. Il rapporto 12/8 è tre mezzi. Raddoppiare la dispersione non raddoppia la durata, perché l’ingresso resta presente nel bilancio.

Passaggi: t_A=8\,\mathrm s;  t_B=12\,\mathrm s;  t_B/t_A=\frac32.

Distrattori: Due terzi è il reciproco. Due segue soltanto P_d e un mezzo ne prende l’inverso, entrambi ignorando P−P_d. Uno trascura i 5 W netti in meno.

Fonte canonica SHA256 651ce4825c8ddadc76e62b7865c6cf9d46a628b5c42acdd889ff4bd5d24dc108. Candidato SHA256 a347a606cef7f1778e9e890d506bdbceaacd52c5f84a38793e548ad93a724942. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-heating-with-losses-08 — Una proposta doppia del tempo richiesto

Un campione chiuso richiede E=120 J netti per raggiungere la temperatura obiettivo; non cambia fase e il lavoro meccanico è trascurabile. Dal riscaldatore entra potenza termica P e verso l’ambiente esce P_d, entrambe costanti durante ciascuna prova, con P>P_d>0. La dispersione costante è un’ipotesi prescritta per questo intervallo, non una legge universale di raffreddamento. Il tempo t parte dall’accensione. Fra prove P e P_d possono cambiare, mentre E resta uguale. Con P=20 W e P_d=5 W si propone t=16 s. Quanto vale proposta meno durata corretta?

Procedimento d’autore: Il tempo corretto è 120/(20−5)=8 s. La proposta supera quel risultato di 8 s. A 16 s il modello avrebbe trattenuto 240 J, il doppio dell’obiettivo, dunque non è il primo istante in cui lo raggiunge.

Passaggi: t=8\,\mathrm s;  e=(16-8)\,\mathrm s;  e=8\,\mathrm s.

Distrattori: Meno otto inverte l’ordine dello scarto. Sedici copia la proposta, zero la accetta. Due è il rapporto fra proposta e corretta e non una differenza di durate.

Fonte canonica SHA256 68f876243655700c6da8f6c42e2a4de0d5b55027b7c885e101d529ea9baac127. Candidato SHA256 27e7b1387de4ff36cb34936578000dc53a08977d1e2553a55e194f5d5022f530. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-heating-with-losses-09 — L’inversa generale per la potenza entrante

Un campione chiuso richiede E=120 J netti per raggiungere la temperatura obiettivo; non cambia fase e il lavoro meccanico è trascurabile. Dal riscaldatore entra potenza termica P e verso l’ambiente esce P_d, entrambe costanti durante ciascuna prova, con P>P_d>0. La dispersione costante è un’ipotesi prescritta per questo intervallo, non una legge universale di raffreddamento. Il tempo t parte dall’accensione. Fra prove P e P_d possono cambiare, mentre E resta uguale. Sono noti t>0 e P_d>0. Quale formula ricava P?

Procedimento d’autore: Dal bilancio(P−P_d)t=E dividiamo per t e aggiungiamo P_d. I due addendi P_d ed E/t sono entrambi potenze. E>0 e t>0 garantiscono P>P_d, quindi l’inversa conserva automaticamente il ramo fisico.

Passaggi: P-P_d=\frac Et;  P=P_d+\frac Et.

Distrattori: Le due differenze non ricostruiscono la potenza che fornisce entrambe le destinazioni. Et ha unità J·s e non watt. Sommare t e P_d nel denominatore mescola secondi e watt prima ancora di calcolare.

Fonte canonica SHA256 19515a0c283b4d0faff1f3fdb20687532607bd816b7debb7c13c8b02e00c4942. Candidato SHA256 260462fdfb7928a254bc2d77c5d8ca39c64c250c5b1e5ab7adf6a99938fab4b5. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-heating-with-losses-10 — Due fattori nel denominatore netto

Un campione chiuso richiede E=120 J netti per raggiungere la temperatura obiettivo; non cambia fase e il lavoro meccanico è trascurabile. Dal riscaldatore entra potenza termica P e verso l’ambiente esce P_d, entrambe costanti durante ciascuna prova, con P>P_d>0. La dispersione costante è un’ipotesi prescritta per questo intervallo, non una legge universale di raffreddamento. Il tempo t parte dall’accensione. Fra prove P e P_d possono cambiare, mentre E resta uguale. In A scriviamo D=P−P_d. B ha P_B=κ₁P e P_d,B=κ₂P_d; definiamo D_B=κ₁P−κ₂P_d. I fattori sono positivi e D_B>0. Quanto vale t_B/t_A?

Procedimento d’autore: L’energia obiettivo è la stessa: t_A=E/D e t_B=E/D_B. Nel quoziente E si semplifica e resta D/D_B, con entrambe le potenze nette positive. Se κ₁=κ₂=κ, allora D_B=κD e la durata si riduce di un fattoreκ.

Passaggi: t_A=\frac ED;  t_B=\frac E{D_B};  \frac{t_B}{t_A}=\frac D{D_B}.

Distrattori: D_B/D descrive il rapporto delle potenze nette, inverso delle durate. I quozienti dei soli fattori non trattano la differenza fra ingresso e uscita. Il prodotto darebbe κ² per un fattore comune, mentre la legge richiede 1/κ.

Fonte canonica SHA256 cfdeac702154ac5d24c570454b2bd7aaf1862e4dcab26e99e2fae597db77b94c. Candidato SHA256 980162b495e02578712e82cf5c1fb43077737f41c8ba26a220aee8e49902d543. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-heating-with-losses-11 — Cambiano insieme ingresso e dispersione

Un campione chiuso richiede E=120 J netti per raggiungere la temperatura obiettivo; non cambia fase e il lavoro meccanico è trascurabile. Dal riscaldatore entra potenza termica P e verso l’ambiente esce P_d, entrambe costanti durante ciascuna prova, con P>P_d>0. La dispersione costante è un’ipotesi prescritta per questo intervallo, non una legge universale di raffreddamento. Il tempo t parte dall’accensione. Fra prove P e P_d possono cambiare, mentre E resta uguale. A ha P=20 W, P_d=5 W. B ha P=30 W, P_d=10 W. Quanto vale t_B/t_A?

Procedimento d’autore: A ha 15 W netti e dura 8 s. B ha 20 W netti e dura 6 s. Sei su otto si riduce a tre quarti: il nuovo riscaldatore fornisce più potenza netta anche se disperde di più.

Passaggi: t_A=8\,\mathrm s;  t_B=6\,\mathrm s;  t_B/t_A=\frac34.

Distrattori: Quattro terzi è il reciproco. Tre mezzi segue il rapporto degli ingressi e due quello delle dispersioni. Uno richiederebbe potenze nette uguali, mentre 15 e 20 W differiscono.

Fonte canonica SHA256 18381b6990ef23ceeba8a4c31ccaa2e56647e86a929d5ab933d82486310cf7af. Candidato SHA256 0474cd8da1081539bd8e8d97da36f3c3d4b1a8146c2861b07ef2c79d191553b8. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-heating-with-losses-12 — Media di due durate, non durata alla potenza media

Un campione chiuso richiede E=120 J netti per raggiungere la temperatura obiettivo; non cambia fase e il lavoro meccanico è trascurabile. Dal riscaldatore entra potenza termica P e verso l’ambiente esce P_d, entrambe costanti durante ciascuna prova, con P>P_d>0. La dispersione costante è un’ipotesi prescritta per questo intervallo, non una legge universale di raffreddamento. Il tempo t parte dall’accensione. Fra prove P e P_d possono cambiare, mentre E resta uguale. A ha P=20 W, P_d=5 W; B ha P=30 W, P_d=10 W. Qual è la media aritmetica dei due t con uguale peso?

Procedimento d’autore: Le due durate sono 8 e 6 s; la metà della somma è 7 s. Gli ingressi medi sarebbero 25 W e 15/2 W, quindi la potenza netta media 35/2 W e il modello darebbe 120/(35/2)=48/7 s. I due calcoli rispondono a domande diverse perché la durata dipende dal reciproco della potenza netta.

Passaggi: \overline t=\frac{8+6}{2}\,\mathrm s;  \overline t=7\,\mathrm s;  t_{\rm ingressi\ medi}=\frac{48}{7}\,\mathrm s.

Distrattori: 48/7 s applica la legge agli ingressi medi, senza mediare le due uscite. Quattordici è la somma; sei e otto copiano una sola prova. Non sono necessarie durate sperimentali o incertezze per la media statistica assegnata.

Fonte canonica SHA256 0337125266bcf1ce5f9a796c54134d4e7cd2eeca69ef319501984aa7127946f3. Candidato SHA256 c42c1e66ef5f4dfb5e76883766f54a68c96425b478c199807e8359688ae153ca. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-heating-with-losses-13 — Il bersaglio decide quanto si può disperdere

Un campione chiuso richiede E=120 J netti per raggiungere la temperatura obiettivo; non cambia fase e il lavoro meccanico è trascurabile. Dal riscaldatore entra potenza termica P e verso l’ambiente esce P_d, entrambe costanti durante ciascuna prova, con P>P_d>0. La dispersione costante è un’ipotesi prescritta per questo intervallo, non una legge universale di raffreddamento. Il tempo t parte dall’accensione. Fra prove P e P_d possono cambiare, mentre E resta uguale. A ha P=20 W, P_d,A=5 W. B usa P=30 W e deve avere t_B=(3/4)t_A. Quanto vale P_d,B/P_d,A?

Procedimento d’autore: Il bersaglio è 6 s. Per trattenere 120 J in quel tempo occorrono 20 W netti. Dei 30 W entranti,10 W possono disperdersi:10/5=2. La nuova dispersione è positiva e minore dell’ingresso.

Passaggi: t_B=6\,\mathrm s;  P_{d,B}=30\,\mathrm W-\frac{120\,\mathrm J}{6\,\mathrm s};  P_{d,B}=10\,\mathrm W;  P_{d,B}/P_{d,A}=2.

Distrattori: Un mezzo capovolge il rapporto. Tre quarti copia il fattore della durata e tre mezzi quello dell’ingresso. Dieci copia il valore numerico di P_d,B espresso in watt, senza dividerlo per il valore 5 W di P_d,A: l’opzione 10 è un numero puro, ma non il rapporto richiesto.

Fonte canonica SHA256 71722bd80d75cf84180e414943da626c8e2df9ecd17f84e6a7afc0d8e709052b. Candidato SHA256 6b590bfe6a5fa7c3f232b5a7f00e265998a89b6ca0d794f61c056d2aed721cc4. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-heating-with-losses-14 — Un display misura la durata

Un campione chiuso richiede E=120 J netti per raggiungere la temperatura obiettivo; non cambia fase e il lavoro meccanico è trascurabile. Dal riscaldatore entra potenza termica P e verso l’ambiente esce P_d, entrambe costanti durante ciascuna prova, con P>P_d>0. La dispersione costante è un’ipotesi prescritta per questo intervallo, non una legge universale di raffreddamento. Il tempo t parte dall’accensione. Fra prove P e P_d possono cambiare, mentre E resta uguale. Il display continuo adimensionale è S=q t, con q>0 costante. A: P=20 W, P_d=5 W, S=24. B: P_d=10 W, S=18. Quanto vale P_B in W?

Procedimento d’autore: A dura 8 s, quindi q=24/(8 s)=3 s⁻¹. B dura 18/3=6 s e richiede 20 W netti. Aggiungendo i 10 W dispersi si ricostruiscono 30 W entranti. Il display non è una potenza né un conteggio obbligatoriamente intero.

Passaggi: q=3\,\mathrm{s^{-1}};  t_B=6\,\mathrm s;  P_B=P_{d,B}+\frac E{t_B};  P_B=30\,\mathrm W.

Distrattori: Venti W è la sola potenza netta. Usare 18 come secondi darebbe P_B=10+20/3 W, non 30 W. Quaranta W darebbero t_B=4 s e S=12, incompatibili con la lettura 18.

Fonte canonica SHA256 c5d78614598cb5678986d032765386f1183ec46e47506b79b6c6f4e1e93300df. Candidato SHA256 bcc358103f8d67aa4101628756fd8924bef0d1abaaf87ca61bdf9ff6b67bab89. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-heating-with-losses-15 — L’offset non è tempo di riscaldamento

Un campione chiuso richiede E=120 J netti per raggiungere la temperatura obiettivo; non cambia fase e il lavoro meccanico è trascurabile. Dal riscaldatore entra potenza termica P e verso l’ambiente esce P_d, entrambe costanti durante ciascuna prova, con P>P_d>0. La dispersione costante è un’ipotesi prescritta per questo intervallo, non una legge universale di raffreddamento. Il tempo t parte dall’accensione. Fra prove P e P_d possono cambiare, mentre E resta uguale. Il display continuo adimensionale è S=q t+b, con q>0 e b costanti. A: P=20 W, P_d=5 W, S=17. B: P=30 W, P_d=10 W, S=13. C: P_d=5 W, S=53/5. Quanto vale P_C?

Procedimento d’autore: Le durate dei riferimenti sono 8 e 6 s. La differenza delle letture 4 divisa per 2 s dà q=2 s⁻¹; b=1. Per C si toglie uno da 53/5 e si divide per due: t_C=24/5 s. La potenza netta è 120/(24/5)=25 W; aggiungendo 5 W si ottiene 30 W.

Passaggi: q=2\,\mathrm{s^{-1}};  b=1;  t_C=\frac{24}{5}\,\mathrm s;  P_C=5\,\mathrm W+25\,\mathrm W;  P_C=30\,\mathrm W.

Distrattori: Venticinque watt dimentica la dispersione. Trentacinque W darebbero 4 s e S=9; quindici W darebbero 12 s e S=25. 1465/53 W deriva da t_C=(53/5)/2=53/10 s, dimenticando l’offset prima della divisione:5+1200/53=1465/53 W.

Fonte canonica SHA256 deaff900897e72c94b660b2f8bf9d90b9000800fffb5bf1af2bfdddfbf0e239a. Candidato SHA256 2efb6767ee46fc758ad0d7e574ce8bc3f890c98958fab88ff20f5f1219032380. Revisione indipendente NOT_RUN; human NOT_RUN.

## AR-u5-heating-with-losses-16 — Il vincolo collega due potenze della stessa prova

Un campione chiuso richiede E=120 J netti per raggiungere la temperatura obiettivo; non cambia fase e il lavoro meccanico è trascurabile. Dal riscaldatore entra potenza termica P e verso l’ambiente esce P_d, entrambe costanti durante ciascuna prova, con P>P_d>0. La dispersione costante è un’ipotesi prescritta per questo intervallo, non una legge universale di raffreddamento. Il tempo t parte dall’accensione. Fra prove P e P_d possono cambiare, mentre E resta uguale. Fra preparazioni si impone P=4 P_d. Si misura t=8 s. Quanto vale P_d>0?

Procedimento d’autore: Il vincolo lascia P−P_d=3 P_d. Da 120 J=3 P_d·8 s segue P_d=120/24 W=5 W. Quindi P=20 W e la potenza netta 15 W restituisce il tempo misurato. Non è una potenza che cresce nel tempo: i valori sono costanti entro ciascuna preparazione.

Passaggi: P-P_d=3P_d;  P_d=\frac E{3t};  P_d=5\,\mathrm W;  P=20\,\mathrm W.

Distrattori: Quindici watt copia la potenza netta e venti quella entrante.15/4 W divide per 4 anziché per 3 dopo aver omesso la dispersione. Meno cinque viola il verso positivo dichiarato e renderebbe anche l’ingresso negativo.

Fonte canonica SHA256 87f5828b2dd64b715018400eab7a765dd40099acea4cd12e6a61eaf072153d76. Candidato SHA256 d94ba6aff14582e25bba85736f907e461c05baf71530b7a3b8adc6e96f6f040a. Revisione indipendente NOT_RUN; human NOT_RUN.

## Correzione della figura dopo review responsive

Le scritte visibili dichiarano soltanto grandezze, unità fisiche e valori: nessuna lunghezza in pixel. Il confronto XML prima/dopo conferma gli stessi elementi, ordine e tutti gli attributi geometrici e stilistici; cambiano i soli testi delle legende e le didascalie collegate. Tutte le chiavi e formule sono identiche. Le versioni precedenti sono conservate con manifest in author-evidence/thermal-168-172-before-responsive-figure-fix. Le cinque nuove figure sono state lette integralmente in XML e nei rendering nativi completi allegati. Questo è controllo tecnico dell’autore, non revisione scientifica indipendente. UI del prodotto sui byte correnti NOT_RUN, nessun marker corrente.

Coordinate intrinseche del disegno: barre di potenza20 unità/W; grafico energia-tempo40 unità/s in orizzontale e8/3 unità/J in verticale; durate40 unità/s. Questi rapporti sono specifiche geometriche dello SVG prima del ridimensionamento, non pixel CSS del dispositivo.

Restano i due fix testuali già riletti da ROOT: prosa14 usa q=24/(8 s); feedback13 distingue il numero puro10 dal valore numerico della potenza non ancora diviso per5 W. Vecchi raw e completion b963 autentici sono archiviati nel precedente before-review-fix e non sono riferiti al package attuale.
