# Revisione indipendente — droplet-fragmentation-129

Revisore distinto dall’autore. Tutti gli 80 prompt originali B125–129 di U3-05 letti individualmente dal pin 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605; derivazioni salvate prima di aprire i pacchetti candidati. Gli handoff dell’autore fornivano SHA, file e ipotesi generali, senza anticipare risultati numerici o chiavi. Nessuna chiave originale usata per la derivazione. Successivamente letti tutti i 16 record di questo lotto, ogni opzione, blocco, formula, hint, feedback, didascalia e metadato. Nessuna importazione di authoring e nessuna modifica ai candidati.

La competenza primaria C2-L010 è reale e tratta tensione superficiale, Laplace, capillarità ed energia di superficie. I prerequisiti C2-L001/L002/L004 appartengono al corso; non sono competenze inventate. Le ipotesi ideali esplicite delle schede delimitano ciascuna applicazione.

Edizione finale riletta: 9c323c14289df414068355b30f729ef760cc2508. Package SHA256 bbdad31f77cc50c7f015dbbb4efbe183d7881c5a13e08b899a62b62becc8a643; binding SHA256 1014e5fcf4df2b2eb434031faf2d49ab0d30fc725dceb7798b5f6786a9d73b2a. Oracolo indipendente SymPy, unità esatte con Pint e Fraction; aritmetica di risposta con AST limitato, senza eval né sympify di testo candidato. π e radicali restano simbolici. Valori del contratto: EXACT_ORACLE e AI_CONCEPTUAL; il secondo conserva la specifica prova fisica e non equivale ad assenza di ragionamento.

Ipotesi del lotto: Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.

Figura: XML e rendering completo letti. Un cerchio raggio 50 px e otto figlie raggio 25 px a 50 px/mm: sfere viste in sezione centrale, non dischi conservanti area. Volumi 8·(1/2)³=1, aree 8·(1/2)²=2. Barre d’area 100/200 px a 100 px/A₀; barre energetiche 100/200/100 px per E_i/E_f/ΔE alla scala 100 px per π/25 µJ. Lavoro minimo associato soltanto all’incremento e con ipotesi reversibili esplicite.

## AR-u3-droplet-fragmentation-01

Nr³=R³ con N=8 dà r=R/2=1/2 mm. A_f=8·4π(R/2)²=8πR²; γ=1/100 N/m,R²=10⁻⁶ m² danno E_f=8π·10⁻⁸ J=2π/25 µJ. E_i=π/25 µJ.

Ipotesi applicate: Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.

Alternative e feedback: π/25 è iniziale e anche incremento per N=8, non finale;8π/25 conserva raggio eccessivo;π/50/16π/25 non rispettano area finale e volume.

Esito AI: PASS_AI. Risultato esatto: 2*pi/25. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 6535a485cd2951223db548edd1b974a1f7ba13a7a1cf08b373438c650aba60eb; candidato SHA256 5d419fd4dca544fd1802adfa1fa92c87de30718980f850ff924aec377cb3764d; firma di lettura 17604896edefdef70ede25a652ec8c105b23e8503d6e97f187269ca1c811566b.

## AR-u3-droplet-fragmentation-02

(N/m)m²=N·m=J e 1 µJ=10⁻⁶ J. Nessun calcolo numerico autonomo richiesto; la dimensione energetica è provata.

Ipotesi applicate: Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.

Alternative e feedback: N/m tensione,Pa pressione,mm² area,N forza. µJ misura energia senza alterare dimensioni.

Esito AI: PASS_AI. Risultato esatto: µJ. Ambito del calcolo: NO_STUDENT_CALCULATION. Source SHA256 71232183b00fdda664d2cc6e9e96ffcae8640aaed80d7198ed3d19eee01c7bad; candidato SHA256 ce67f49b08f8c565374869c99c9a1f484848cb6046d7f37e7ec0dde76228c82d; firma di lettura 2e2b01a25acee1ae79af5d43b4d414ab96b8201e5c6a81e322e34f11a2fad964.

## AR-u3-droplet-fragmentation-03

r=R/∛N, A_f=4πNr²=4πR²∛N, E_f=γA_f. Incremento invece E_i(∛N−1); a N=1 E_f=E_i>0 ma ΔE=0.

Ipotesi applicate: Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.

Alternative e feedback: N diretto conserva troppo raggio;1/∛N diminuisce area;4πγr² conta una figlia;∛N−1 dà incremento. Per N=1 alcune alternative coincidono numericamente, ma non sono leggi generali.

Esito AI: PASS_AI. Risultato esatto: E_f = 4 π γ R² ∛N. Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 e272669564c6c55f4eb471e17ea1d40a26a3ae1e87f80e4484db1da9f13c96a7; candidato SHA256 9022eb3d8a25c3c7258f4b8f733a9670cd1607d796f7686d0d93db0fd92e0a14; firma di lettura 4ac88ee6efcb7b7a09d1e13f80ae55bfd16022004b32e115c24ea52e1cd675af.

## AR-u3-droplet-fragmentation-04

R doppio a N=8 fisso: area quadrupla, E_f da 2π/25 a 8π/25 µJ. Il volume cresce invece di otto.

Ipotesi applicate: Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.

Alternative e feedback: 4π/25 segue lunghezza,16π/25 segue volume;costante e dimezzato non rispettano R².

Esito AI: PASS_AI. Risultato esatto: Da 2π/25 a 8π/25 µJ. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 ce02621d653b0011fee4ea4d554bd60c78a35665e773558424ff7df203f3a8e2; candidato SHA256 9f0fe01fe6d3c944f7c78b4b46e696c59687174e5586b970ea9f74da7f8586bd; firma di lettura be6bee0fd2368758200714321a23f7b2016e93c338a64e07b150d54bab3d3782.

## AR-u3-droplet-fragmentation-05

Con N=8, R²=E_f/(8πγ)=10⁻⁶ m². Radice fisica R=10⁻³ m=1 mm, distinta da r=1/2 mm.

Ipotesi applicate: Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.

Alternative e feedback: Negativo non è raggio;1/2 mm è raggio figlio, non iniziale. π si cancella esattamente.

Esito AI: PASS_AI. Risultato esatto: 1. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 7a5d719d44b3c0600f4a8ac75b197a0d81f84d1e27f4f3b7185c966a95a9ff6f; candidato SHA256 0237d06f293c5a2a4f0677c619920c559296a06d4a4de622e25fc5f1bea9aec0; firma di lettura 07cf149c033677a2139f8b8bdfed97d2616c2a35958342157f88b2b268ab1079.

## AR-u3-droplet-fragmentation-06

E_f/E_i=2=∛N; elevare al cubo dà N=8 intero positivo. Un dato che producesse cubo non intero sarebbe incompatibile, non da arrotondare.

Ipotesi applicate: Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.

Alternative e feedback: 2 radice cubica,4 quadrato di quella radice, non numero di figlie; non arrotondare un conteggio incompatibile.

Esito AI: PASS_AI. Risultato esatto: 8. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 1bd39ea53fd27a4dbd1af50498f150fe3b75fa9470d773cc414b8c0e02c9a9e0; candidato SHA256 39facb612b9e99f17c52ff32d1fb638bae4e19761e64188f4fa854aead467b52; firma di lettura e98c8cb963712a0aa38a9ce9b281a767850e3ac742f7a4eaa9a4df00eb459710.

## AR-u3-droplet-fragmentation-07

A R fisso, ∛27/∛8=3/2: rapporto E_f,B/E_f,A=3/2.

Ipotesi applicate: Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.

Alternative e feedback: 27/8 rapporto conteggi,9/4 quadrato del rapporto corretto,2/3 reciproco,1 confonde conservazione di volume e area.

Esito AI: PASS_AI. Risultato esatto: 3/2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 ef94884279e8fce0bbf16896d6f4d55befaed1fe90f766eb484a133cc99c526b; candidato SHA256 1a7fd435e68c59b018fcd1685ec871a39f9a4fa9c43973a8cbf5fe2f7313fd6e; firma di lettura c367694c87d640e2508cb48557c6ca6148b1334a5e93fab0267566b655093cf8.

## AR-u3-droplet-fragmentation-08

Proposta 4π/25 meno finale corretto 2π/25 dà +2π/25 µJ. L’incremento fisico rispetto a E_i sarebbe invece π/25.

Ipotesi applicate: Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.

Alternative e feedback: Segno negativo inverte ordine;4π/25 proposta,6π/25 somma,zero accetta. Incremento è quantità ancora diversa.

Esito AI: PASS_AI. Risultato esatto: 2*pi/25. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 866edd62db99627e296ee35f793f5f81067ef520140c40bc89e480f8b7be1655; candidato SHA256 988a234b87964a5fb7ddbe93b7e6e16e1cc62b71abb5430a465e4f2314074a60; firma di lettura df1be2a90e88457d9346b8e3dcc4a2c06821e9f7a955aac419136f2fa26b9c33.

## AR-u3-droplet-fragmentation-09

R²=E_f/(4πγ∛N) è un’area. R=√[E_f/(4πγ∛N)] è l’unica radice positiva; nessuna radice cubica di R nell’energia.

Ipotesi applicate: Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.

Alternative e feedback: Senza radice resta area;reciproco lunghezza inversa;∛N al numeratore inverte il conteggio;radice cubica finale confonde conservazione volumetrica e energia.

Esito AI: PASS_AI. Risultato esatto: R = √[E_f / (4 π γ ∛N)]. Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 c9d40f546662accae05bcc0f68815304b881cf2635469d9990de158ba6a761ff; candidato SHA256 d133817437608ee00ce73328d4c664f4c3a2fa209f90970a22aa26017ba959af; firma di lettura 91fcbb9312b60bf9e7ed8c81c21eb387afd86e3b42ba4c27a2d6f958e1d9d9d7.

## AR-u3-droplet-fragmentation-10

R_B=κ₁R_A,N_B=κ₂N_A producono rapporto κ₁²∛κ₂. κ₂N_A dev’essere intero positivo: il fattore può essere razionale, non il conteggio.

Ipotesi applicate: Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.

Alternative e feedback: κ₁ segue lunghezza,κ₁³ volume;κ₂ diretto ignora riduzione delle figlie e divisione per radice inverte la tendenza.

Esito AI: PASS_AI. Risultato esatto: κ₁² ∛κ₂. Ambito del calcolo: SYMBOLIC_MANUAL_DERIVATION. Source SHA256 bc4b52c180bfe7c569c45807e6de9e154d3f9babbd6535dca3a3da7245b42ada; candidato SHA256 75480a43e9d6479be0a1f8e496df6eddbe098ae1c5c86007992232de9407597f; firma di lettura 8133fe8628cc1d27e392e199aa0d4811b1119aab630c3e1d2bce23ea17baf479.

## AR-u3-droplet-fragmentation-11

B R=2,N=27 dà E_f=12π/25 µJ. Rapporto con 2π/25: 6=4·3/2.

Ipotesi applicate: Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.

Alternative e feedback: 3/2 solo N,4 solo R,27/2 usa conteggio diretto,1/6 reciproco.

Esito AI: PASS_AI. Risultato esatto: 6. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 8d491439809196506e446594cb08ab2157c8ebd000867ce967d99474ff3a9cdf; candidato SHA256 3000bd96a2aef8dd80b2220921cd43926d4b07a48dd2bb47aa0290373ced968c; firma di lettura 87b2cf7e78956140896e7ab835d418119b3337f7be7a52bfff7e9b6c04200dfb.

## AR-u3-droplet-fragmentation-12

Media (2π/25+12π/25)/2=7π/25 µJ. N medio 35/2 non è intero e non descrive una prova ammessa; non occorre valutare alcun radicale non notevole.

Ipotesi applicate: Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.

Alternative e feedback: 14π/25 somma,5π/25 semidifferenza,12π/25 sola B,π/25 iniziale A. La media statistica non richiede un conteggio medio fisico.

Esito AI: PASS_AI. Risultato esatto: 7*pi/25. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 30d49d0f6f44591e89e29a51a5a484943da97a7ec5b9f2ba5c05c9e84ac8b5db; candidato SHA256 ced85dd6492d81815aed873d70e084a3432d987898f0f9935a43870b955d99c8; firma di lettura b20ec50f640844a4329ec9b46c3c060b7618554075681afb78457fd3110ac0d5.

## AR-u3-droplet-fragmentation-13

Target rapporto 6 e R doppio: ∛(N_B/N_A)=6/4=3/2. Cubo 27/8, N_B=(27/8)·8=27 intero.

Ipotesi applicate: Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.

Alternative e feedback: 3/2 è la radice cubica del rapporto,9/4 suo quadrato,8/27 reciproco,6 ignora R.

Esito AI: PASS_AI. Risultato esatto: 27/8. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 e1450bf5c748131329f0c4f54d77cdf496a0e8be17302d022dc4c171bbe46338; candidato SHA256 1df01bd7223f85ff0450986d9a50e0781f412ce9c9feca921f016c315663a1a0; firma di lettura ad8ae18cb3a91b71456a9e69d941e652dc39ac689839d5b74f29dcb4eac960b4.

## AR-u3-droplet-fragmentation-14

A E=2π/25,S=6π/25: q=3 µJ⁻¹. B S=36π/25 dà E=12π/25; N=27 porta R²=4 mm²,R=2 mm.

Ipotesi applicate: Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.

Alternative e feedback: Sei è il rapporto di letture; eliminare fattore 3/2 della frammentazione lascia R² relativo quattro, poi radice due.

Esito AI: PASS_AI. Risultato esatto: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 61df1ec8789dfbc6ef75f4b501a6f2e38563be6113ab7fc41b448fa77e687c0e; candidato SHA256 f9b0757dd66644481d81900e7948045b525880334704d21176644b8c341eee82; firma di lettura b9138f4f3cfad66415455f66d0aedf80d0c330bd7f24eeef033b99d342471e0d.

## AR-u3-droplet-fragmentation-15

A/B E=2π/25,12π/25 e display 1+4π/25,1+24π/25 danno q=2 µJ⁻¹,z=1. C E=8π/25 con N=8 implica R²=4 mm²,R=2 mm.

Ipotesi applicate: Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.

Alternative e feedback: 4 confonde rapporto energie e raggi;1 riproduce A;1/2 dà quarto di energia;√2 dà doppio invece del quadruplo.

Esito AI: PASS_AI. Risultato esatto: 2. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 042189a18bbc11dc2463e92d36811904e865bd184116927365e8a712fb5634cd; candidato SHA256 884a5b45e305b3d1b41a034b2fcf1b531d28049fba3d49be44b35c005b83ade6; firma di lettura d466198873881ede92ab5ff91abb7086d7c500c339fe3d80a224695b481af14c.

## AR-u3-droplet-fragmentation-16

R=cN,c=1/8 mm. Porre x=∛N>0: E_f=4πγc²x⁷=(π/1600 µJ)x⁷. Dato 2π/25 implica x⁷=128=2⁷; monotonia positiva dà x=2,N=8,R=1 mm.

Ipotesi applicate: Sfera iniziale R>0, N intero positivo, figlie uguali sferiche separate a singola interfaccia; Nr³=R³. γ=10 mN/m costante, niente evaporazione né variazioni di temperatura/composizione, gravità trascurata. E_f finale distinto da ΔE; N=1 ammesso senza divisione. W_min=ΔE solo reversibile con nessun altro cambiamento energetico. Nuovi N restano interi.

Alternative e feedback: c ha dimensione lunghezza per conteggio; fermarsi a quadrato/cubo perde il fattore N^(1/3). La settima potenza è crescente su x>0 e la soluzione soddisfa N intero.

Esito AI: PASS_AI. Risultato esatto: 8. Ambito del calcolo: EXACT_MANUAL_CALCULATION. Source SHA256 f994291fc59722986975544d7eda0f80e6b61f358fa05ef65ab3d9a2d4bf5103; candidato SHA256 2d19b73c1cd7752271783b45884c07a19e2abed47f8fb06c06297728817f9908; firma di lettura 85f47a8892ec87a6b3eb8d1d89cdec13030200409d1abc294411c2ba438b0580.

Controprove riproducibili: 24 per questo lotto. Tutte le 16 chiavi errate sono respinte anche dopo rinnovo del binding, dei token e di ogni guardia d’edizione esclusivamente in memoria nel test: resta attivo l’oracolo distinto. Prove aggiuntive coprono fonte falsa, unità errata, lotti vuoti/parziali/duplicati, testo fisico falso a chiave corretta e SVG incorporato o locale mutato. Le guardie di testo/figura certificano l’edizione letta, non una comprensione semantica universale delle mutazioni.

Identità canonica verificata con assert_record_identity sui report fresh e salvati contro package e binding reali ROOT. I test Hypothesis esplorano ulteriori configurazioni dei cinque modelli; i controlli geometrici leggono i cinque XML. La suite generale e le anteprime finali spettano all’integratore. DRAFT, human NOT_RUN, publicationAction NONE. Nessuna approvazione umana o pubblicazione simulata.
