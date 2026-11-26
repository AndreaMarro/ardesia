# Revisione indipendente radioisotope-mixture-253

Primaria prompt-only 51439933fe3974da7552b58de5f9929aecd44ed758e84ab1e1a0c379c47515d2, congelata prima dei candidati. Cinque modelli numerici implementati ed eseguiti prima delle chiavi: 58e478edc733fb198a7711e2a5fdfa8c7f46d3537f331562cf531737f04ed4bc. Nessuna esposizione precedente alle risposte. Lettura integrale individuale dei sedici record finali alla revisione 29f65ee547627d10b0cca687b3fe19d3f05b4a32, separata dalle prove automatiche.

Il catalogo C5 effettivo è stato letto al pin 5d1dc8dc7b601aef959d10d564c75462be74708d; C5-L08 copre popolazioni, attività, emivita e trasformazioni α/β/γ; C1-L001 offre le fondazioni dimensionali effettive. I prerequisiti della lezione L08 nel catalogo sono vuoti.

XML e PNG indipendente 640×1600 letti per intero. Primo pannello scala20 coordinate/Bq:8+8 iniziali,4+2 finali. Grafico a A₂8Bq: x150+20A₁,y1000−30A_tot, retta A_tot=A₁/2+2, punti(8,6),(16,10), intercetta2 aperta al bordo A₁0. Barre finali scala25 per Bq:150/300/225 per6/12/9. Pesi e legende corretti.

Le immagini indipendenti sono prove asset-only realmente concluse con exit 0 e lette a piena altezza. UI del prodotto e approvazione umana NOT_RUN; contenuti DRAFT. Le firme congelano soltanto i byte finali letti. La guardia dei testi SVG è una verifica della versione quantitativa riletta, non un interprete generale di semantica grafica.

I modelli pre-key restano preservati con i loro 25 controlli fonte e 600 rifiuti finiti/esatti reali. Dopo la lettura è stato aggiunto soltanto strict=True a sympify nel guardiano numerico per respingere stringhe senza valutarle: formule costitutive, inverse e taratura restano identiche in AST. La primaria originale non viene riscritta; la sua parola bilineare in25012 è corretta nella nota finale come lineare in N₀ ed esponenziale nel tempo. Nei25411–15 i nuovi dati del candidato sono ricalcolati separatamente, conservando i diversi risultati della fonte originale nella primaria.

## AR-u7-radioisotope-mixture-01

Ipotesi: Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.

Derivazione manuale: In 1 h il primo compie una emivita e il secondo due. Le attività residue sono 8/2=4 e 8/4=2 Bq, che sommo perché indipendenti e senza contributi dei figli: 6 Bq.

Distrattori: Otto dimezza entrambi una volta, 16 omette il decadimento e quattro o due conserva una sola specie. Le emivite non si sommano.

Didattica: Legge motivata e valore medio distinto da singolo esito.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma ae884c4712f00d96c778e57d86aa09d03b09892b95b8e41ab2d746e0e459ba84.

## AR-u7-radioisotope-mixture-02

Ipotesi: Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.

Derivazione manuale: La somma di attività ha unità Bq=s⁻¹; non si sommano emivite né si interpreta la somma come numero di nuclei.

Distrattori: J, s, C e m misurano altre grandezze. La somma di attività conserva Bq e non rivela da sola energia o popolazione totale.

Didattica: Unità ricostruita e conteggio distinto dal tasso.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma c8bbc7550ae63259709778c55ae3e76be6537a84deb49138b27e7d4b5a765a26.

## AR-u7-radioisotope-mixture-03

Ipotesi: Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.

Derivazione manuale: La legge a 1 h èA_tot=A₁/2+A₂/4. I fattori diversi appartengono alle due emivite; un’unica emivita efficace costante non descrive in generale tutta la miscela.

Distrattori: Un denominatore comune imporrebbe uguali emivite. Il prodotto ha dimensione Bq²; scambiare due e quattro assegna le frazioni alla specie sbagliata.

Didattica: Caso autonomo o legge riconosciuta senza risposta già anticipata.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma bf37c468a0dfb3cf29f796d589c4651296be6b0be4d614a992489946930c2e14.

## AR-u7-radioisotope-mixture-04

Ipotesi: Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.

Derivazione manuale: A₁ passa da 8 a 16 Bq iniziali: la sua parte finale passa da 4 a 8, mentre la seconda resta 2. A_tot passa da 6 a 10 Bq, aumenta di 4 Bq e non raddoppia.

Distrattori: 12 raddoppia anche il secondo contributo, tre dimezza il totale, sei ignora il nuovo ingresso e venti raddoppia ancora l’uscita nuova.

Didattica: Confronto controllato a un parametro fissato.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma bbb1f1b6beee35444ced093e82f7c89e28e893459cbf0f90262eab3c50c4571a.

## AR-u7-radioisotope-mixture-05

Ipotesi: Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.

Derivazione manuale: Sottraggo il contributo noto A₂/4=2 Bq dalla misura 6: A₁/2=4, quindi A₁=8 Bq. La positività richiede A_tot>A₂/4.

Distrattori: Quattro è la parte finale del primo; 12 gli attribuisce tutto il totale e 16 duplica l’inversa. Il residuo noto va sottratto prima della ricostruzione.

Didattica: Prima inversa reinserita nella relazione diretta.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 59a46d2a46b0bb5981df7508eec5224920d6e3d240915c7fc64ef3ed6735d3c3.

## AR-u7-radioisotope-mixture-06

Ipotesi: Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.

Derivazione manuale: Sottraggo A₁/2=4 Bq: A₂/4=2, quindi A₂=8 Bq. La positività richiede A_tot>A₁/2.

Distrattori: Due è la parte finale del secondo, quattro usa una sola emivita e 24 ignora il primo. Occorre totale>A₁/2, non soltanto totale positivo.

Didattica: Seconda inversa con denominatori e domini verificati.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 7104ad456156b49f4aeee2d3f86d33af200aa9492b9ffee99124e3dd8705b15f.

## AR-u7-radioisotope-mixture-07

Ipotesi: Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.

Derivazione manuale: A_tot, A=6; con A₂, B 16 la seconda parte vale 4 e la prima 4, dunque B 8 Bq. Rapporto 8/6=4/3.

Distrattori: 3/4 inverte il confronto; due raddoppia anche il primo, 1/2 fa calare una somma con ingresso crescente e uno ignora la modifica.

Didattica: Due uscite calcolate prima del rapporto.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 7a665fd12e4df0b4a7bb5631f4c419b5f9e34273191cb27b8b5aa669dd8055ca.

## AR-u7-radioisotope-mixture-08

Ipotesi: Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.

Derivazione manuale: Il proposto 12 meno il corretto 6 vale+6 Bq. Raddoppiare il risultato non è giustificato dalla somma delle attività iniziali.

Distrattori: −6 inverte lo scarto, due è rapporto, 12 la proposta e zero non la verifica. Il totale iniziale 16 Bq è diverso da quello a un’ora.

Didattica: Differenza ordinata distinta dal rapporto puro.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 7493dd0bc376f4f8d437750056da9961dfec99fe83c5be49d15529769cf59a9a.

## AR-u7-radioisotope-mixture-09

Ipotesi: Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.

Derivazione manuale: Isolo A₁=2(A_tot−A₂/4)=2 A_tot−A₂/2. Non distribuisco il fattore 2 in modo asimmetrico e impongo la differenza positiva.

Distrattori: Il segno più riaggiunge il contributo noto; dividere per due ripete la perdita. 4 A_tot−A₂ usa il peso sbagliato e 2 A_tot omette la seconda specie.

Didattica: Inversa simbolica e dimensioni esplicite.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma e9df2808f6dfa3415573b9ff15c4fd0343a9791605bcc24ac3c18567d5c010e3.

## AR-u7-radioisotope-mixture-10

Ipotesi: Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.

Derivazione manuale: Il quoziente è(κ₁A₁/2+κ₂A₂/4)/(A₁/2+A₂/4), equivalente a(2κ₁A₁+κ₂A₂)/(2 A₁+A₂). Nessuna cancellazione autorizza κ₁+κ₂.

Distrattori: Prodotti e quozienti dei soli κ non sono somme. La loro media semplice e il rapporto senza peso due ignorano i contributi al tempo finale.

Didattica: Fattori nella legge effettiva, non in un’analogia impropria.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma cd0d116126c7060395110889b3e757ba66385bdd2b4ae96ced2017610195820c.

## AR-u7-radioisotope-mixture-11

Ipotesi: Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.

Derivazione manuale: Raddoppiano entrambe le attività iniziali. Per linearità la somma finale passa da 6 a 12 Bq e il rapporto è 2.

Distrattori: Un mezzo è reciproco, quattro moltiplica i due raddoppi come contributi moltiplicativi. Uno ignora la modifica e 3/2 non ricostruisce 12/6.

Didattica: Entrambi i nuovi ingressi considerati.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 24eef1b8b9ee9a37eb3d47917a39db4c8cc2652f3dcd4fb74f215a621ac9d0fe.

## AR-u7-radioisotope-mixture-12

Ipotesi: Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.

Derivazione manuale: Medio le due letture 6 e 12: 9 Bq. Qui la legge è lineare in entrambi gli ingressi, quindi coincide anche con la lettura agli ingressi medi 12 e 12 Bq; questa coincidenza ha una ragione strutturale, non vale per ogni modello.

Distrattori: 18 somma, tre prende la semidifferenza e sei o dodici ripete una sola prova. Qui la linearità giustifica la coincidenza con gli ingressi medi.

Didattica: Media delle uscite e ammissibilità degli ingressi medi distinte.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma d7705e3d6f38c71a4b4bf58487ca0680dd533e0e1742b1b2e40bf1ea4cd0ff65.

## AR-u7-radioisotope-mixture-13

Ipotesi: Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.

Derivazione manuale: Il target è 12 Bq. Il nuovo primo contributo è 16/2=8, perciò il secondo deve essere 4 e A₂, B=16 Bq. Rispetto agli 8 iniziali il rapporto richiesto è 2.

Distrattori: Rapporto uno darebbe 10 Bq, quattro ne darebbe 16 e 3/2 ne darebbe 11. Un mezzo inverte il rapporto richiesto.

Didattica: Bersaglio ricostruito prima dell’inversa.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 107486517becd34d8813d69e9cae01d6330b13587452f805279515ad28d4c3c7.

## AR-u7-radioisotope-mixture-14

Ipotesi: Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.

Derivazione manuale: Dal riferimento 6 Bq→18 ricavo a=3. La lettura 36 dà 12 Bq; noto A₂ 16, sottraggo 4 e moltiplico per 2: A₁=16 Bq.

Distrattori: 64 usa D come totale e predice D=108; otto copia la parte finale e 24 omette il secondo contributo, predicendo D=48.

Didattica: Guadagno rimosso prima del bilancio fisico.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma bb9639cbbed86f43b9863792a5e7d82b4e7b77b56c6105766b73669f34c8c384.

## AR-u7-radioisotope-mixture-15

Ipotesi: Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.

Derivazione manuale: Riferimenti 6 e 12 Bq: a=(25−13)/(12−6)=2 e b=1. La lettura 21 dà 10 Bq; con A₂ 8, A₁=2(10−2)=16 Bq.

Distrattori: 17 omette b e predice D=22; 36 omette g dopo b e predice D=41. Otto lascia il primo contributo al tempo finale.

Didattica: Due riferimenti distinti identificano guadagno e offset.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 64a76c3de957c07b195192755cce8ee28c52f010bef93687dd93bb2fd6008b20.

## AR-u7-radioisotope-mixture-16

Ipotesi: Due genitori indipendenti con emivite 1 h e 30 min; uscite dopo 1 h. Nessun contributo dei figli o nuova produzione. Attività iniziali finite positive e uscita continua, inverse con residuo positivo, display e preparazioni distinti; nessuna emivita media inventata.

Derivazione manuale: Il vincolo A₁=A₂=x dàA_tot=3 x/4. Da 6 Bq ricavo x=8 Bq, soluzione positiva unica. Le attività sono medie continue, non conteggi interi di nuclei.

Distrattori: Sei darebbe totale 9/2, quattro darebbe tre e 12 darebbe nove Bq. L’uguaglianza iniziale non implica contributi finali uguali.

Didattica: Vincolo o caso autonomo risolto prima di decidere unicità e dominio.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma b34f86f713a9749f58e4872eecb67c210b4b3327029b91823fc340bdb0db2c3d.
