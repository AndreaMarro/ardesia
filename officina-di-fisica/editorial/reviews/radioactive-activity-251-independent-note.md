# Revisione indipendente radioactive-activity-251

Primaria prompt-only 51439933fe3974da7552b58de5f9929aecd44ed758e84ab1e1a0c379c47515d2, congelata prima dei candidati. Cinque modelli numerici implementati ed eseguiti prima delle chiavi: 58e478edc733fb198a7711e2a5fdfa8c7f46d3537f331562cf531737f04ed4bc. Nessuna esposizione precedente alle risposte. Lettura integrale individuale dei sedici record finali alla revisione 65fb52b17dca66e9e5afd2dbae94e5c486eef242, separata dalle prove automatiche.

Il catalogo C5 effettivo è stato letto al pin 5d1dc8dc7b601aef959d10d564c75462be74708d; C5-L08 copre popolazioni, attività, emivita e trasformazioni α/β/γ; C1-L001 offre le fondazioni dimensionali effettive. I prerequisiti della lezione L08 nel catalogo sono vuoti.

XML e PNG indipendente 640×1600 letti per intero. Venti cerchi nel primo pannello. Grafico discreto a T2s: x150+8N,y1000−20A_m, punti N5,10,…,40 con A_m=7N/20; origine aperta per N>0. Barre a scala40 per Bq:280/28/154 per7,7/10,77/20. La distinzione tra legge fisica e coefficiente numerico è visibile.

Le immagini indipendenti sono prove asset-only realmente concluse con exit 0 e lette a piena altezza. UI del prodotto e approvazione umana NOT_RUN; contenuti DRAFT. Le firme congelano soltanto i byte finali letti. La guardia dei testi SVG è una verifica della versione quantitativa riletta, non un interprete generale di semantica grafica.

I modelli pre-key restano preservati con i loro 25 controlli fonte e 600 rifiuti finiti/esatti reali. Dopo la lettura è stato aggiunto soltanto strict=True a sympify nel guardiano numerico per respingere stringhe senza valutarle: formule costitutive, inverse e taratura restano identiche in AST. La primaria originale non viene riscritta; la sua parola bilineare in25012 è corretta nella nota finale come lineare in N₀ ed esponenziale nel tempo. Nei25411–15 i nuovi dati del candidato sono ricalcolati separatamente, conservando i diversi risultati della fonte originale nella primaria.

## AR-u7-radioactive-activity-01

Ipotesi: Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.

Derivazione manuale: La relazione fisica èA=(ln 2)N/T½. Soltanto nella convenzione numerica assegnata sostituisco ln 2≈7/10: A≈(7/10)·20/2=7 Bq. Il razionale è esatto nel modello di calcolo approssimato, non un’identità ln 2=7/10.

Distrattori: 14 omette la divisione per T; 10 omette η e 20 copia il conteggio. Sette Bq è un tasso medio istantaneo, non sette eventi certi in un secondo.

Didattica: Legge motivata e valore medio distinto da singolo esito.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma c0775baff6ea8407ed9d1d1a46ca2cb40c32a99f0c8d1b4b86580b48e504b884.

## AR-u7-radioactive-activity-02

Ipotesi: Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.

Derivazione manuale: L’attività ha dimensione tempo⁻¹ e unità Bq=s⁻¹, accompagnata dal significato trasformazioni medie per secondo. Non è il numero di nuclei e non è energia.

Distrattori: Bq ha dimensione s⁻¹. s, J, C e m indicano tempo, energia, carica e lunghezza; nessuna è un’unità di attività.

Didattica: Unità ricostruita e conteggio distinto dal tasso.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 60194985fad5cff9f8f032461e8d7e47772aac7bcd1bd3a32b3529d2e921cf4b.

## AR-u7-radioactive-activity-03

Ipotesi: Caso autonomo β⁺ energeticamente consentito nel nucleo. Un protone diventa neutrone con emissione di positrone e neutrino elettronico: A invariato, Z diminuito di uno. Non si afferma il decadimento di un protone libero e non si usa il modello numerico η=7/10.

Derivazione manuale: Nel β⁺ un protone nucleare si trasforma in neutrone emettendo un positrone e un neutrino elettronico: p→n+e⁺+ν_e. A resta invariato e Z diminuisce di 1. Per nuclei isolati la possibilità energetica richiede una transizione consentita, non segue dal solo bilancio.

Distrattori: Il β⁻ converte un neutrone, α espelle quattro nucleoni e γ non cambia Z. Un elettrone orbitale espulso non descrive il β⁺ nucleare consentito.

Didattica: Caso autonomo o legge riconosciuta senza risposta già anticipata.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 4aecb7309bc7e64788aca006f7ed55d45c2091498afe0fa05cfa807086253069.

## AR-u7-radioactive-activity-04

Ipotesi: Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.

Derivazione manuale: A emivita fissata A è proporzionale a N. Da 20 a 40 nuclei l’attività raddoppia da 7 a 14 Bq nella convenzione 7/10.

Distrattori: 7/2 inverte la dipendenza da N; 28 introduce il quadrato; 7 ignora la nuova popolazione e 40 copia N senza il fattore temporale.

Didattica: Confronto controllato a un parametro fissato.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 88536cef72af76b101f407bdcd30112fef1c2dfa76112a89fabebc851bf1f4ec.

## AR-u7-radioactive-activity-05

Ipotesi: Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.

Derivazione manuale: Isolo N=AT½/(7/10). Sostituendo 7 Bq e 2 s ottengo 14·10/7=20 nuclei, conteggio intero positivo.

Distrattori: 10 omette T; 14 omette la divisione per η e darebbe 49/10 Bq; 49/5 moltiplica invece di dividere per η.

Didattica: Prima inversa reinserita nella relazione diretta.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma e4d6047fd69b31d28fb7233dbf6563827d7480840bcebacb4243e7c60c85617b.

## AR-u7-radioactive-activity-06

Ipotesi: Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.

Derivazione manuale: Isolo T½=(7/10)N/A. Con 20 nuclei e 7 Bq ottengo 14/7=2 s, positivo e con unità s.

Distrattori: Mezzo secondo darebbe 28 Bq; quattro secondi darebbero 7/2 Bq. Venti copia N come se fosse una durata.

Didattica: Seconda inversa con denominatori e domini verificati.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 402fa418231093472da64af6be6e7f56d044fd8c2c2644fd554e98e44134c60e.

## AR-u7-radioactive-activity-07

Ipotesi: Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.

Derivazione manuale: N resta 20 ma l’emivita passa da 2 a 4 s. Il rapporto A_B/A_A è 2/4=1/2; B ha 7/2 Bq nel modello numerico.

Distrattori: Due rende diretta la dipendenza da T; un quarto quadra il fattore, quattro ne inverte il quadrato e uno ignora il parametro.

Didattica: Due uscite calcolate prima del rapporto.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma b8992da4a9b77ed90ad4c1c94febba910a5b866284f51b8e048bd28eb94eef0b.

## AR-u7-radioactive-activity-08

Ipotesi: Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.

Derivazione manuale: A corretto 7 Bq, proposto 14 Bq: lo scarto proposto−corretto è+7 Bq. Il proposto ha omesso il dimezzamento dovuto a 2 s.

Distrattori: −7 Bq inverte lo scarto; due è il rapporto; 14 Bq ripete la proposta e zero la accetta senza verifica.

Didattica: Differenza ordinata distinta dal rapporto puro.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 2b862c0bf043dff7eb3e1b1a7f85330824ed94cd3cf4c5a798a67463261f1ec1.

## AR-u7-radioactive-activity-09

Ipotesi: Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.

Derivazione manuale: La forma fisica inversa èN=AT½/ln 2; usando la sola approssimazione prescritta diventa N≈10 AT½/7. Il prodotto A T½ è un conteggio e deve produrre un intero positivo se N è trattato come conteggio esatto.

Distrattori: Moltiplicare per η ripete la riduzione. Dividere ancora per T dà dimensione s⁻²; introdurre T² lascia una durata non richiesta.

Didattica: Inversa simbolica e dimensioni esplicite.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 3f94edddee85b712607250755ed5de7ce7cde1c725f662328a03a7652cd4a828.

## AR-u7-radioactive-activity-10

Ipotesi: Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.

Derivazione manuale: Sostituzione e cancellazione danno A_B/A_A=κ₁/κ₂. Il fattore comune ln 2 cancella anche senza approssimarlo. κ₁N deve restare intero positivo; il solo κ₁>0 non autorizza nuclei frazionari.

Distrattori: Il prodotto rende T diretto e il reciproco scambia gli stati. Il quadrato di κ₁ altera la legge; la somma dà due per prove identiche.

Didattica: Fattori nella legge effettiva, non in un’analogia impropria.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma 697d001ef0f874d656d33f00c1c8abb91401ce97a3a2b56fb848d27d261ff08f.

## AR-u7-radioactive-activity-11

Ipotesi: Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.

Derivazione manuale: A=7 Bq, B=(7/10)·1/1=7/10 Bq. Il rapporto è 1/10: il conteggio diminuisce di 20 volte mentre dimezzare l’emivita raddoppia la costante di decadimento.

Distrattori: Dieci inverte il rapporto; 1/20 segue soltanto N; 1/2 segue T nel verso diretto sbagliato. Uno confonde un evento con un tasso unitario.

Didattica: Entrambi i nuovi ingressi considerati.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma cb7569860544a2e619d86bf887f7d3c2e1cb724162db6b64be14832f2bd4e555.

## AR-u7-radioactive-activity-12

Ipotesi: Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.

Derivazione manuale: La media delle letture è(7+7/10)/2=77/20 Bq. Non sostituisco medie degli ingressi: darebbero 49/10 Bq e N=21/2 non è neppure un conteggio intero ammissibile.

Distrattori: 77/10 somma, 63/20 prende la semidifferenza e 7/10 ripete B. 49/10 è soltanto l’estensione formale agli ingressi medi non interi.

Didattica: Media delle uscite e ammissibilità degli ingressi medi distinte.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma c2795030cc0b8969902549cd79bd45201179960d49e1c6c575d749e166375be3.

## AR-u7-radioactive-activity-13

Ipotesi: Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.

Derivazione manuale: Il rapporto richiesto è 1/10; con N_B/N_A=1/20, l’identità 1/10=(1/20)/(T_B/T_A) impone T_B/T_A=1/2.

Distrattori: Due inverte le durate; 1/10 copia il target del tasso e 1/20 il rapporto dei conteggi. Durate uguali darebbero 7/20 Bq in B.

Didattica: Bersaglio ricostruito prima dell’inversa.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 6b445de19d863355053512a45bd5e6ac03ba8dabe05c622ee9f98a6a1dddffce.

## AR-u7-radioactive-activity-14

Ipotesi: Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.

Derivazione manuale: Il riferimento 7 Bq corrisponde a 21, quindi a=3 unità strumentali/Bq. La lettura 21/10 dàA=7/10 Bq; con T½=1 s, N=(7/10)/(7/10)=1 nucleo.

Distrattori: Tre nuclei omette g e predice D=63/10; due predice D=21/5. Il numero strumentale 21/10 non è un conteggio già decodificato.

Didattica: Guadagno rimosso prima del bilancio fisico.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma b3dde364c199958e72b9661b2b3596cd8263c335da99302e2fc679e3efa72230.

## AR-u7-radioactive-activity-15

Ipotesi: Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.

Derivazione manuale: Le uscite fisiche 7 e 7/10 Bq producono 15 e 12/5. a=(15−12/5)/(7−7/10)=2, b=1. Dalla lettura 29 ricavoA 14 Bq; con 2 s N=14·2·10/7=40 nuclei.

Distrattori: 580/7 omette entrambe le correzioni del display. Ottanta omette g dopo b e predice D=57; venti ripete il riferimento D=15.

Didattica: Due riferimenti distinti identificano guadagno e offset.

Verifica automatica distinta: EXACT_ORACLE; esito del verificatore True. Firma 382640fa3fa45828435cdfbcb212d437db856a095d50e9eb868b08d623b7b02d.

## AR-u7-radioactive-activity-16

Ipotesi: Legge fisica con ln 2 distinta dalla valutazione numerica prescritta η=7/10. Conteggi N interi positivi, emivite finite positive costanti entro ogni prova. Attività media istantanea in Bq; β⁺03 autonomo consentito energeticamente e famiglia 16 discreta.

Derivazione manuale: Il vincolo dimensionato èN=(10 s⁻¹)T½. Nel modello 7/10 l’attività diventa 7 Bq indipendente da N: tutte le coppie (N, T½)=(k, k/10 s), k intero positivo, soddisfano i dati. Infinite numerabili, non un continuo di conteggi; con ln 2 esatto non sarebbe esattamente 7 Bq.

Distrattori: Una o due coppie non esauriscono le scelte intere. L’opzione «Nessuna coppia» è confutata dagli esempi; un continuo includerebbe N frazionario, escluso.

Didattica: Vincolo o caso autonomo risolto prima di decidere unicità e dominio.

Verifica automatica distinta: AI_CONCEPTUAL; esito del verificatore True. Firma a959573c72b2c6b729660af922ba373d321d79a0d47cb1deb5e74e342547be85.
