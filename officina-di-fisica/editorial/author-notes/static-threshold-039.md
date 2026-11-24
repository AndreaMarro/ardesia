# Note d’autore — soglia statica039

Letti individualmente i16 originali u2-static-threshold-01..16 nel commit
5cfbdcb055ba3ba136f97fb56e997f06e6cf3605, questions/U2-03.json. Riutilizzati
assembly, pipeline e importatore astra/1 esistenti. Competenza C1-L006 e
prerequisiti C1-L001/L002/L005/L006 del catalogo già presente. Queste sono
soluzioni e scelte d’autore: DRAFT, revisione indipendente e umano NOT_RUN,
nessun PASS scientifico o pubblicazione.

Riferimento inerziale, piano orizzontale e trazione puramente orizzontale:
N=mg>0 perché le altre azioni verticali sono assenti e il contatto permane.
Il modello statico ammette −μ_sN≤f_s≤μ_sN lungo l’asse orizzontale. La quiete
seleziona f_s=−P se |P|≤μ_sN; solo alla soglia |f_s|=μ_sN. Non si prosegue
questa legge oltre soglia come se fornisse anche l’attrito dinamico. g10m/s²
è un parametro esatto assegnato. μ_s può essere1 o maggiore: non è una probabilità.

| ID | Calcolo proposto e cautela |
| --- | --- |
| 01 | N20N;μ1/2⇒F_max10N. La capacità non coincide con ogni attrito effettivo. |
| 02 | μ adimensionale; mg forza, unitàN. |
| 03 | P4N, massimo10N⇒f_s−4N, modulo4N. Nessuna massa o normale numerica viene inventata per questo sorgente speciale. |
| 04 | μ1/2→1/4 conN20N⇒massimo10→5N, dimezzamento. |
| 05 | μ=F_max/(mg)=10/20=1/2; la misura deve essere al limite, non soltanto sotto soglia. |
| 06 | m=F_max/(μg)=10/5=2kg; normale positiva20N. |
| 07 | m2→4kg aμ1/2⇒massimi10→20N, rapporto2. Sotto una stessa spinta4N entrambe le forze effettive sarebbero4N. |
| 08 | Proposta20N meno massimo10N⇒+10N; proposta confonde normale e massimo statico. |
| 09 | Inversaμ=F_max/(mg); una forza sotto soglia darebbe soltantoμ≥|f_s|/(mg). |
| 10 | Massimo_B/massimo_A=κ₁κ₂, stesso g; nessun quadrato aggiuntivo. |
| 11 | (μ,m)=(1/2,2kg)→(1,3kg):10→30N, rapporto3. |
| 12 | Media(10+30)/2=20N; ingressi medi3/4 e5/2kg danno75/4N, diverso da80/4N. |
| 13 | Target30N,μ_B1⇒m_B3kg; rapporto3/2. |
| 14 | c30/(10N)=3N⁻¹;S90⇒massimo30N;N30N⇒μ1. Display continuo adimensionale. |
| 15 | c(61−21)/(30−10)N⁻¹=2N⁻¹,d1;S11⇒massimo5N;N20N⇒μ1/4. |
| 16 | μ=m/(4kg)⇒m²=(4kg)F_max/g=4kg²; radici±2kg in blocchi separati, solo positiva fisica. |

Figura progressiva collegata03: sole proiezioni orizzontali P4N e f_s−4N,
entrambe40px a10px/N. Nel grafico dei moduli, origine100,760; punto4N220,640
e limite10N400,460, scala30px/N su entrambi gli assi. Non è disegnata una
forza statica costante oltre10N: la regione oltre la soglia è solo indicata
come incompatibile con la quiete. L’intervallo delle componenti−10..+10N è
lungo400px a20px/N; f_s−4N è la freccia300→220. La normale numerica non è
necessaria al03 e non è attribuita dal disegno.

Anteprima d’autore con il harness canonico browser-drafts:48casi sui16ID a1440,
768e320px, processo concluso exit0, nessun overflow di pagina/formule e nessuna
violazione axe fra i criteri eseguiti. Ogni formula e figura è presente e
l’accesso ospite agli asset resta negato. Non è una review scientifica indipendente
né una prova con studenti; nessun CSS o gate è stato modificato. Il report
riporta hash del pacchetto, runtime e test sui byte finali.
