"""Constrained new editions of two cross-discipline examples; no scientific self-approval."""
import base64
from copy import deepcopy
import json
from pathlib import Path
from .pipeline import canonical,digest,git_bytes,sha
from .units_authoring import text,formula

BATCH='examples-cross-domain-revisions-117'
SOURCE_PATH='officina-di-fisica/content/C6.json'

def assemble(repo,source_ref):
    originals={r['id']:r for r in json.loads(git_bytes(repo,source_ref,SOURCE_PATH))}
    assets=[];records=[];bindings=[]
    def edition(key,name,prompt,blocks,caption):
        raw=(Path(__file__).resolve().parents[2]/'editorial/assets'/name).read_bytes();asset=sha(raw)
        source=originals[key];row=deepcopy(source)
        row.update(version=source['version']+1,baseVersion=source['version'],prompt=prompt,
                   blocks=blocks+[{'type':'figure','src':'/asset/'+asset,'text':caption}])
        records.append(row)
        assets.append({'id':asset,'name':name,'mime':'image/svg+xml','data':base64.b64encode(raw).decode()})
        bindings.append({'id':key,'sourceId':key,'sourceRef':source_ref,'sourceSha256':digest(source),
                         'candidateSha256':digest(row),'assetChecksums':{name:asset}})
    edition('C6-E003','joule-water-exact.svg',
      'Una resistenza ohmica R=8 Ω è percorsa dalla corrente costante i=1/2 A per 120 s. Riscalda 50 g d’acqua: nel modello il 75% dell’energia elettrica dissipata viene effettivamente acquistato dall’acqua come calore sensibile; questa frazione comprende già tutte le perdite. Assumi R e il calore specifico c=4200 J/(kg·K) costanti, senza cambiamenti di stato o altro apporto energetico. Quanto aumenta la temperatura dell’acqua? Esprimi l’aumento come frazione esatta di kelvin.',[
      text('Partiamo dal percorso dell’energia: la resistenza trasforma energia elettrica, ma soltanto una frazione raggiunge l’acqua. Per questo calcoliamo prima l’energia dissipata e poi quella effettivamente assorbita. Con corrente e resistenza costanti la legge di Joule dà una potenza costante P=i²R; la durata trasforma la potenza in energia.'),
      formula(r'P=i^2R'),formula(r'P=\left(\frac12\right)^2\!\cdot8\,\mathrm W'),formula(r'P=\frac14\cdot8\,\mathrm W=2\,\mathrm W'),
      text('Un watt è un joule ogni secondo. In 120 secondi i 2 joule trasferiti ogni secondo diventano 240 joule dissipati. Il quadrato della corrente è essenziale: usare iR darebbe una tensione, non una potenza.'),
      formula(r'E=P\Delta t'),formula(r'E=2\,\frac{\mathrm J}{\mathrm s}\cdot120\,\mathrm s=240\,\mathrm J'),
      text('Il 75% è la frazione 75/100=3/4. Per applicarla a 240 J dividiamo prima per 4, ottenendo 60 J, e moltiplichiamo poi per 3. I 60 J rimanenti non scaldano questo campione nel bilancio assegnato; non dobbiamo sottrarre una seconda volta altre perdite già comprese nella frazione.'),
      formula(r'\eta=\frac34'),formula(r'Q=\eta E=\frac34\cdot240\,\mathrm J=180\,\mathrm J'),formula(r'E-Q=240\,\mathrm J-180\,\mathrm J=60\,\mathrm J'),
      text('La massa va espressa in chilogrammi per essere coerente con c. Cinquanta grammi sono 50/1000 kg=1/20 kg. Moltiplicando m per c troviamo la capacità termica del campione: servono 210 J per aumentarne la temperatura di un kelvin. È la capacità dell’intero campione, distinta dal calore specifico per unità di massa.'),
      formula(r'm=\frac{50}{1000}\,\mathrm{kg}=\frac1{20}\,\mathrm{kg}'),formula(r'C=mc'),formula(r'C=\frac1{20}\,\mathrm{kg}\cdot4200\,\frac{\mathrm J}{\mathrm{kg\,K}}'),formula(r'C=\frac{4200}{20}\,\frac{\mathrm J}{\mathrm K}'),formula(r'C=210\,\frac{\mathrm J}{\mathrm K}'),
      text('Senza cambiamento di stato e con c costante, il calore sensibile è Q=mcΔT. Per isolare l’aumento di temperatura dividiamo entrambi i membri per mc, positivo. Il rapporto 180/210 si riduce dividendo numeratore e denominatore per 30; non occorre una divisione decimale.'),
      formula(r'Q=mc\Delta T'),formula(r'\Delta T=\frac{Q}{mc}'),formula(r'\Delta T=\frac{180}{210}\,\mathrm K=\frac67\,\mathrm K'),
      text('Il risultato è positivo e minore di un kelvin, perché 180 J sono meno dei 210 J necessari per un kelvin. Il controllo esatto ricostruisce il calore: 210·6/7=30·6=180 J. Il valore 0,86 K sarebbe un’approssimazione e richiederebbe il simbolo ≈; la frazione 6/7 K conserva invece il risultato senza arrotondarlo.'),
      formula(r'210\,\frac{\mathrm J}{\mathrm K}\cdot\frac67\,\mathrm K=180\,\mathrm J'),
      text('Se si usassero tutti i 240 J si otterrebbe 8/7 K, in contrasto con la frazione effettivamente assorbita. Se si lasciasse la massa numerica 50 accanto a c espresso per chilogrammo, la capacità risulterebbe mille volte troppo grande e l’aumento mille volte troppo piccolo. Sono errori di bilancio e di unità, non diversi arrotondamenti dello stesso calcolo.'),
      text('La relazione inversa permette di cercare la durata necessaria per un aumento assegnato, mantenendo le stesse condizioni: da mcΔT=ηi²RΔt dividiamo per ηi²R. Il numeratore vale 180 J e il denominatore (3/4)·2=3/2 J/s; dividere 180 per 3/2 equivale a moltiplicare per 2/3 e restituisce 120 s.'),
      formula(r'\Delta t=\frac{mc\Delta T}{\eta i^2R}'),formula(r'\Delta t=\frac{180}{3/2}\,\mathrm s=180\cdot\frac23\,\mathrm s=120\,\mathrm s'),
      ],'Bilancio energetico: 240 J dissipati si dividono in 180 J assorbiti dall’acqua e 60 J destinati altrove; le tre barre hanno la stessa scala di un pixel per joule. La capacità termica del campione è 210 J/K e la frazione esatta dell’aumento è 6/7 K. La figura non rappresenta temperature assolute o un transitorio temporale.')
    edition('C6-E004','signal-distance-filter.svg',
      'Una sorgente puntiforme isotropa emette a potenza costante in un mezzo senza perdite. Nel modello il sensore misura l’intensità locale e fornisce un segnale S=kI, con la stessa costante positiva k nelle due misure, senza saturazione né fondo additivo. Il sensore, di apertura trascurabile rispetto alla distanza, mantiene area e orientazione normale al raggio lungo la stessa direzione radiale. Passa da 1 m a 2 m; davanti viene posto un filtro ideale con trasmissione di potenza 0,60=3/5, senza ulteriori contributi al segnale. Qual è il rapporto esatto tra il nuovo segnale e quello iniziale?',[
      text('La potenza emessa si distribuisce su sfere concentriche. Una sfera di raggio r ha area 4πr²: dividere la potenza per quell’area dà l’intensità locale. Usiamo questa relazione perché il modello assegna una sorgente puntiforme isotropa e nessuna perdita prima del filtro. Spostarsi lungo la stessa direzione mantiene confrontabile anche l’orientazione del sensore.'),
      formula(r'I(r)=\frac{P}{4\pi r^2}'),
      text('Confrontiamo prima le intensità senza filtro. Il rapporto elimina la potenza costante e il fattore 4π: non è necessario calcolare π. Il raggio raddoppia, quindi ogni unità di area della sfera più grande riceve un quarto della potenza che riceveva prima.'),
      formula(r'\frac{I_{\rm prima\ del\ filtro}}{I_1}=\frac{P/(4\pi r_2^2)}{P/(4\pi r_1^2)}'),formula(r'\frac{I_{\rm prima\ del\ filtro}}{I_1}=\left(\frac{r_1}{r_2}\right)^2'),formula(r'\left(\frac{1\,\mathrm m}{2\,\mathrm m}\right)^2=\frac14'),
      text('Il filtro trasmette tre quinti della potenza incidente nel modello assegnato. Il suo 0,60 è una trasmissione di potenza, già equivalente a 3/5: non bisogna elevarlo di nuovo al quadrato come si farebbe con un rapporto di ampiezze. Dopo il filtro rimane tre quinti del quarto iniziale.'),
      formula(r'\tau=\frac35'),formula(r'I_2=\tau I_{\rm prima\ del\ filtro}'),formula(r'\frac{I_2}{I_1}=\frac35\cdot\frac14=\frac3{20}'),
      text('La domanda riguarda il segnale del sensore. La legge S=kI ha lo stesso coefficiente nelle due misure e non contiene un fondo additivo: dividendo i segnali k si cancella. Area, orientazione e risposta lineare restano quelle dichiarate, perciò il rapporto di intensità coincide con il rapporto di segnali. Le unità dei due segnali sono le stesse e il rapporto è adimensionale.'),
      formula(r'\frac{S_2}{S_1}=\frac{kI_2}{kI_1}=\frac{I_2}{I_1}'),formula(r'\frac{S_2}{S_1}=\frac3{20}=\frac{15}{100}'),
      text('Il sensore registra il 15% del segnale iniziale. Questo è minore sia di 1/4 sia di 3/5, come deve accadere moltiplicando due fattori compresi fra zero e uno. Come ripartizione di venti parti uguali del segnale iniziale: dopo il solo allontanamento ne restano cinque, dopo il filtro ne restano tre. È una rappresentazione del rapporto, non un nuovo trasferimento di potenza fra sensori.'),
      formula(r'0<\frac3{20}<\frac14<1'),
      text('Usare un solo rapporto di distanze darebbe (3/5)·(1/2)=3/10 e dimenticherebbe l’area sferica. Usare soltanto 1/4 ignorerebbe il filtro. Sommare 1/4 e 3/5 descriverebbe due contributi alternativi, mentre qui il filtro agisce sul segnale già ridotto dalla distanza. Se cambiasse orientazione o comparisse un fondo, le condizioni per cancellare k o confrontare questi segnali non sarebbero più quelle assegnate.'),
      text('L’inversa controlla la distanza. Posto q=S₂/S₁>0, dalla legge q=τ(r₁/r₂)² si ottiene (r₂/r₁)²=τ/q. Il rapporto (3/5)/(3/20) vale 4: si prende la radice positiva perché una distanza è positiva. Si recupera r₂/r₁=2, quindi r₂=2 m, senza calcolare radici non esatte.'),
      formula(r'q=\tau\left(\frac{r_1}{r_2}\right)^2'),formula(r'\left(\frac{r_2}{r_1}\right)^2=\frac{\tau}{q}'),formula(r'\frac{r_2}{r_1}=\sqrt{\frac{3/5}{3/20}}=\sqrt4=2'),formula(r'r_2=2\cdot1\,\mathrm m=2\,\mathrm m'),
      ],'Tre barre alla stessa scala di 320 pixel per S₁: segnale iniziale 1, dopo il solo raddoppio della distanza 1/4, dopo anche il filtro 3/20. Lunghezze 320, 80 e 48 pixel. Il diagramma separa i fattori del modello; non descrive un transitorio del sensore o intensità misurate in watt.')
    return {'schema':'astra/1','records':records,'assets':assets},bindings

if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser(__doc__);parser.add_argument('--repo',type=Path,required=True);parser.add_argument('--source-ref',required=True);parser.add_argument('--destination',type=Path,required=True)
    args=parser.parse_args();package,bindings=assemble(args.repo,args.source_ref);args.destination.mkdir(parents=True,exist_ok=True)
    for name,value in [(BATCH,package),(BATCH+'-bindings',bindings)]:
        (args.destination/(name+'.json')).write_text(canonical(value)+'\n')
