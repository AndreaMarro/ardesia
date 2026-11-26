from pathlib import Path
import ast,json,hashlib,subprocess,shutil,re
A=Path('/private/tmp/cric-author-a-resident/officina-di-fisica');sha=lambda b:hashlib.sha256(b).hexdigest()
def literal(path,name):
 t=ast.parse(Path(path).read_text());return ast.literal_eval(next(n.value for n in t.body if isinstance(n,ast.Assign)and any(isinstance(x,ast.Name)and x.id==name for x in n.targets)))
manual=literal('/private/tmp/primary_u604_b_a.py','proofs')
refs={225:('dielectric-isolated-voltage','4f908dc4dbbcdba0eebc8ecbd8a249b7c328f789'),226:('dielectric-connected-charge','0e189e8a589fd53f025fd2c84980407db30a339b'),227:('isolated-plate-separation-energy','b455db658158695f249e6baf7949687d5ae7453f'),228:('connected-plate-separation-charge','df0e949226d67d210baa01717d958ee33a636f7c'),229:('lorentz-force','d08b78557da6988f0264890c7c1994789f744533')}
contrasts={225:[
'6 V segue la carica libera fissata. 24 V moltiplica per κ, 12 V impone il generatore, 3 V divide due volte. Non si conserva la sola carica netta zero per dedurre V.',
'V è tensione. C carica, F capacità, J energia e T campo magnetico. J/C=V, mentre κ non porta unità. Le cinque alternative sono state aperte soltanto dopo la primaria.',
'È fissata per isolamento la carica libera su ciascuna armatura. Con κ>1 C e permittività aumentano, V e U del campo diminuiscono. Il limite κ=1 non trasforma quelle grandezze nella quantità fissata dall’isolamento.',
'A dà 6 V e B 1/2 V. Due V applica la dipendenza diretta; uno ignora la divisione di B per κ; sei copia A e dodici è la tensione iniziale A. Il fattore B/A è 1/12.',
'κV=12 V. Tre V ripete la divisione, sei omette il dielettrico; 36 V darebbe 18 V dopo inserimento. V₀≥V perché κ≥1.',
'κ=12/6=2. Un mezzo viola κ≥1; sei copia il valore numerico finale e 72 forma un prodotto di tensioni. Il valore è puro.',
'B con κ=1 ha V=12 V, quindi rapporto due. Mezzo è reciproco, quattro quadra, uno ignora κ. Zero non segue né Q=C₀V₀ positivo né C finita.',
'Proposta12 meno corretto6=+6 V. −6 scambia ordine; due è rapporto; 12 copia proposta; zero confonde netta neutra con tensione nulla.',
'V₀=κV deriva da Q invariata e C=κC₀. V/κ è ancora diretta; κ/V ha V⁻¹, κV² ha V² e V−κ sottrae dimensioni incompatibili.',
'κ₁/κ₂: il primo parametro è al numeratore e il secondo al denominatore. Prodotto e reciproco cambiano dipendenza; κ₂² aggiunge una potenza; somma dà due per prove identiche. κ_B resta≥1.',
'V_A=6 V e V_B=3 V: rapporto1/2. Due reciproco, 3/4 sola preparazione iniziale, 3/2 solo κ senza invertirlo; uno presume compensazione.',
'Media9/2 V, distinta da21/5 V ai dati medi, scarto3/10 V. Nove è somma,3/2 semidifferenza e zero usa netta neutra al posto di una tensione fra piastre.',
'Bersaglio3 V e V₀,B9 V richiedono κ_B3: rapporto3/2. 2/3 reciproco,1/2 copia bersaglio,3/4 segue solo V₀; due darebbe9/4 V.',
'Guadagno3 V⁻¹, lettura9 dà3 V, κ3 ricostruisce9 V iniziali.27 salta il guadagno,1 divide ancora per κ,3 si ferma all’uscita finale.',
'Guadagno2 V⁻¹ e offset1: lettura5 dà2 V, κ4 dà V₀8 V. Dieci omette offset e prediceD6; sedici omette guadagno; due omette l’inversa fisica.',
'Il parametro si cancella: V=6 V per ogni κ≥1. Esempi κ1,3/2,2 con V₀6,9,12 V sono distinti. Nessuna quadratica né conteggio intero; scegliere κ2 senza dato è arbitrario.'
],226:[
'C finale4 μF e Vg2 V danno8 μC su una piastra. Quattro ignora κ; due divide il valore iniziale4 perκ; sedici conta entrambi i moduli. Il generatore trasferisce carica libera.',
'C è l’unità di carica: F·V=C. F,V,J,T sono rispettivamente capacità,tensione,energia,campo. Prefisso micro non cambia dimensione.',
'Con κ>1 il generatore fissa V2 V, C aumenta e Q aumenta. Polarizzazione non crea libera aggiuntiva; quella passa dal circuito. κ1 è il caso limite senza aumento, esplicitamente separato nel prompt.',
'C₀ raddoppia, κ e Vg uguali:8→16 μC. Quattro inverte, otto ignora, trentadue quadra il fattore due; due dimezza ulteriormente senza legge.',
'C₀=8/(2·2)=2 μF. Quattro è C finale, otto copia Q, mezzo ricostruisce solo2 μC e non8. Denominatori non nulli.',
'κ=8/(2·2)=2. Mezzo è reciproco fuori dominio; quattro copia C finale, sedici non forma il rapporto Q/(C₀Vg).',
'κ_B1 dà4 μC contro8 μC A: rapporto1/2. Due reciproco,1/4 quadrato,zero confonde κ1 con capacità nulla,uno ignora il cambio.',
'Scarto+8 μC. −8 inverte, due è rapporto,16 copia proposta,zero non verificaQ=κC₀Vg.',
'C₀=Q/(κVg) ha F. Qκ/Vg non annulla κ; QVg/κ ha energia; κVg/Q è capacità inversa; Q/Vg è C finale.',
'κ₁κ₂ segue il prodotto a Vg fisso. Quozienti invertono un ingresso,κ₂² aggiunge potenza; somma è due per prove identiche. Entrambi κ fisici≥1.',
'Q_A8 e Q_B6 μC:rapporto3/4.4/3 reciproco,mezzo sola C₀,3/2 soloκ,uno presume compensazione completa.',
'Media7 μC, prodotto degli ingressi medi15/2 μC, differenza mezzo.14 è somma,1 semidifferenza,zero carica netta del condensatore.',
'Bersaglio6 μC con C₀1 μF e2 V richiede κ3, rapporto3/2.2/3 inverte,3/4 copia rapporto cariche,2 darebbeκ4 e8 μC. Mezzo non raggiunge il bersaglio.',
'Guadagno3 μC⁻¹, D18 dà Q6 μC, κ3 e2 V danno C₀1 μF. Tre usa DcomeQ; due omette numericamente Vg; sei copiaQ come capacità.',
'Guadagno2 μC⁻¹,offset1,D33→Q16 μC→C₀4 μF.33/8 omette offset e dàD34;8 omette Vg,16 copiaQ con altra dimensione.',
'Q/(1 μC)=2κ² e Q8 impongono κ²4, κ2 con C₀2 μF.−2 viola dominio e capacità positiva,4 copia quadrato,8 copiaQ,nessuna ridondanza.'
],227:[
'C=C₀/s e Q costante: U=Q²/(2C)=sU₀=4 μJ. Uno usa erroneamente V fisso, due conserva U campo,otto usa s². Apporto meccanico possibile distinto dall’isolamento elettrico.',
'J è energia. C²/F=C·V=J; W è potenza,V tensione,C carica,F capacità. Fattore due puro.',
'Q resta costante e U/U₀=C₀/C=s. U₀/s vale con V mantenuta e altro circuito; quadrati non derivano da C∝1/s; Ucostante omette apporto esterno meccanico.',
'A4,B8 μJ per s2 e U₀2,4 μJ. Due divide invece di moltiplicare,quattro ignora preparazione,sedici aggiunge fattore non previsto. Q fisso entro prova non significa stessoQ fra prove.',
'U₀=4/2=2 μJ. Otto usa sU,quattro ignora s,mezzo darebbe U1 μJ. U₀≤U nel dominio s≥1.',
's=4/2=2 e d2d₀. Mezzo è avvicinamento escluso,otto prodotto,quattro copia numero di U finale.',
's_B1 conserva U₀2 μJ; A4 μJ:rapporto1/2. Due reciproco,uno ignora s,1/4 quadrato,zero confonde ΔU0 con U0.',
'Proposta8 meno4=+4 μJ; ΔU rispetto allo stato iniziale è invece2 μJ. −4 inverte,due puro è rapporto,otto copia proposta,zero non verifica.',
'U₀=U/s ha energia e0<U₀≤U. sU è diretta,s/U energia inversa,U−s dimensioni incompatibili,U/s² aggiunge potenza.',
'κ₁κ₂:prodotto delle due variazioni. Quozienti invertono diretta,κ₂² aggiunge potenza,somma fallisce sui fattori unitari. Entrambe le geometrie restano piastre grandi.',
'U_A4,U_B9 μJ→9/4.4/9 reciproco,3/2 solo ingresso,9/2 divide per U₀A invece diUA,uno ignora variazione.',
'Media13/2 μJ distinta da25/4 ai dati medi, scarto1/4.13 somma,5/2 semidifferenza,zero non è media di energie positive.',
'Bersaglio9 μJ e U₀B3 μJ danno sB3, rapporto3/2.2/3 reciproco,9/4 copia rapporto energetico,2 darebbe UB12 μJ;3/4 non raggiunge bersaglio.',
'Guadagno3 μJ⁻¹,D27→U9 μJ,s3→U₀3 μJ. Nove omette divisione fisica,27 copiaD e omette entrambe,uno prediceD9.',
'Guadagno2 μJ⁻¹,offset1,D17→U8 μJ,s2→U₀4 μJ.17/4 ometteoffset eD18;otto copiaUfinale;16 prediceUC32 eD65.',
'U₀=(1 μJ)s porta U/(1 μJ)=s²=4, ramo s2.−2 distanza negativa,4 omette radice,mezzo avvicina e non soddisfa misura; nessuna ridondanza.'
],228:[
'Q=CVg=Q₀/s e Vg fissata durante prova danno6 μC.24 inverte s,12 impone altro isolamento,3 divide due volte. Carica può tornare al generatore.',
'C è carica. s=d/d₀ puro non introduce metri; F capacità,V tensione,J energia,A corrente distinta dalla carica trasferita in intervallo.',
'Q/Q₀=C/C₀=1/s con Vg fissa. sQ₀ inverte geometria,Q₀ costante è altro circuito,quadrati non derivano da C=εA/d.',
'A6 e B1/2 μC:rapporto1/12. Due moltiplica nuovoQ₀1 per s2,uno ignora separazione,sei copiaA,dodici ignora nuova preparazione. Non imposto identiciV eC₀ fra prove.',
'Q₀=sQ=12 μC≥Q. Tre ripete divisione,sei ignora geometria,24 ricostruisceQ12non6.',
's=Q₀/Q=2, puro. Mezzo inverte,seicopiaQ,settantadue prodotto invece rapporto. s≥1 e regimepiano anche nello stato finale.',
'B s1 rimaneQ12,A6 μC:rapporto2. Mezzo reciproco,uno ignora,quattro quadra,zero confonde ΔQ nulla con Q nulla.',
'Scarto+6 μC.−6 inverte,due rapporto,12proposta,zero sostituisce netta di due piastre alla carica di una.',
'Q₀=sQ ha carica.Q/s è diretta,s/Q carica inversa,s²Q potenzaaggiunta,Q−s differenzia grandezze diverse.',
'κ₁/κ₂ da Q₀/s.Prodotto rende diretto s,inverso scambia ingressi,quadrato aggiunge potenza,somma due sui fattori unitari.',
'Q_A6,Q_B3 μC→1/2. Due reciproco,3/4 soloQ₀,3/2 solo s,uno presume compensazione.',
'Media9/2 μC contro21/5 ai dati medi:scarto3/10. Nove somma,3/2 semidifferenza,zero somma algebrica di armature.',
'Bersaglio3 μC e Q₀B9 richiedono sB3:rapporto3/2.2/3 reciproco,mezzo copia bersaglio,3/4 segueQ₀,2 darebbe9/4 μC.',
'Guadagno3 μC⁻¹,D9→Q3,s3→Q₀9 μC.27trattaDcomeQ,1divideancora,3copiafinale.',
'Guadagno2 μC⁻¹,offset1,D5→Q2,s4→Q₀8 μC.10ometteoffset eD6;16ometteguadagno;2omette inversa fisica.',
'Q₀=(6 μC)s dà Q6 μC per ogni s≥1 nel regime geometrico. Misura ridondante; infinite coppie continue, non soltanto intere, non radici discrete.'
],229:[
'q1 μC,v2 km/s,B3 mT perpendicolari: F6 μN. Kilo e milli si compensano;seiN perde microq,dodici duplica,tre omettev2. Direzione da prodotto vettoriale, non dal modulo.',
'N misura forza. C·(m/s)·T=N; T campo,C carica,J lavoro,V tensione. Forza e campo non sono la stessa grandezza.',
'(v×B)·v=0 implica potenza e variazioneK nulle: rapidità costante. Vettorev può ruotare,posizione cambia,accelerazione generalmente ruota. Moto parallelo è caso particolare, non proprietàuniversale.',
'v dimezzata a B eangolo invariati porta6→3 μN.12inverte,3/2quadra,6ignora e0richiederebbe v0 o direzione parallela, esclusi.',
'v=F/(|q|B)=2 km/s.18moltiplica numeri,mezzo reciproco,sei copi forza senza campo; prefissi vanno convertiti tutti.',
'B=F/(|q|v)=3 mT.12prodotto,1/3reciproco,6copiaF; segno non dedotto dal modulo. Direzione richiede dati vettoriali.',
'B ridotto3→1 mT dàF6→2 μN e rapporto1/3. Tre reciproco,1/9e9quadrati,uno ignoraB.',
'Scarto+6 μN.−6inverte,due rapporto,12proposta,zero confonde potenza magnetica nulla con forza nulla.',
'F/(|q|B) ha m/s. Reciprocoha s/m;FB/|q| eF/(|q|B²) alterano dimensioni;F/B ha C·m/s. Rapidità modulo non prende segnoq.',
'κ₁κ₂ segue prodotto vB. Quozienti invertono dipendenze,κ₁²introduce quadrato,somma fallisce proveidentiche. Entrambe velocità nel regime nonrel dichiarato.',
'F_A6,F_2=4 μN→2/3.3/2reciproco,mezzo solov,4/3soloB,uno compensa senza dati.',
'Media5 μN distinta da21/4 ai dati medi:media meno dato-medio=−1/4.10somma,uno semidifferenza,zero usa cancellazione vettoriale invece media moduli.',
'Bersaglio4 μN e v1 richiedonoB4 mT:rapporto4/3.3/4reciproco,2/3copia rapportoF,mezzo solov,2darebbeF6 μN.',
'Guadagno3 μN⁻¹,D12→F4,B4→v1 km/s.3trattaDcomeF,4copiaF,1/4prediceF1 eD3.',
'Guadagno2 μN⁻¹,offset1,D41→F20,B5→v4 km/s.41/10ometteoffset eD42;8ometteguadagno;20copiaF.',
'β=B/(1mT)>0 porta F/(1μN)=(2/3)β²=6→β²9→β3,v2 km/s.−3violamoduli,9copi quadrato,2copi v; misura fissa scala.'
]}
assumptions={225:'Condensatore lineare ideale isolato da generatore e terra prima dell’inserimento completo; carica libera su ciascuna armatura conservata e positiva in modulo. Capacità C=κC₀, κ≥1 finito reale, tensioni positive, dimensioni invarianti. Isolamento elettrico non esclude scambio meccanico; energia del solo campo non necessariamente conservata. Parametri costanti entro prova, confronti e vincoli fra preparazioni.',226:'Condensatore lineare con generatore ideale mantenuto a 2 V durante ogni inserimento completo. C₀>0 e κ≥1 finiti reali; Q è modulo libero su una sola armatura. Polarizzazione distinta dal trasferimento di carica libera. Il03 assume κ>1; κ=1 è limite separato. Taratura continua e vincoli soltanto fra preparazioni.',227:'Condensatore piano lineare elettricamente isolato, modulo della carica su ciascuna armatura fissato entro prova. Area e permittività costanti, d=s d₀, s≥1, dimensioni laterali grandi rispetto a entrambe le distanze; bordi trascurati. U₀,U positive finite; energia finale del campo distinta dall’energia totale e dall’incremento. Preparazioni iniziali possono differire.',228:'Condensatore piano lineare collegato a generatore ideale, tensione fissata durante ogni allontanamento, non necessariamente identica fra diverse preparazioni oltre ai dati dichiarati. Area e permittività costanti, s=d/d₀≥1 con regime piastre grandi valido in entrambi gli stati. Q₀,Q moduli liberi positivi su una armatura, non netta neutra; scambio di carica col circuito permesso.',229:'Carica positiva assegnata 1 μC e velocità perpendicolare a B nei calcoli; B e rapidità positivi finiti, regime classico non relativistico in ogni preparazione. Campo statico uniforme, nessun lavoro di altra forza/radiazione nel03 autonomo, che ammette anche componente parallela. Forza vettoriale q v×B, modulo distinto dalla potenza. Parametri e display costanti entro configurazione; vincolo16 soltanto fra preparazioni.'}
svg={225:'XML completo e PNG nativo640×1480 letti: sezioni schematiche, Q12 μC su entrambi gli stati,C1→2 μF,V12→6 V. Barre origine150 con larghezze240/120/180 per6/3/9/2 V, scala comune40 coordinate/V. Grafico indipendente x=150+(80/3)V₀,y=1300−(80/3)V, retta fino(470,1140)=(12,6)V con κ2. Origine0 è limite, zeri132 a sinistra, punte e label non coperte.',226:'XML completo e PNG nativo640×1480 letti: batteria2 V collegata con polo lungo positivo verso piastra+;C₀2 μF,κ2,C4 μF,Q8 μC. Barre320/240/280 per8/6/7 μC daorigine150, scala40 coordinate/μC. Grafico aκ2,Vg2: x=150+160C₀,y=1300−20Q, segmento(470,1140)=(2 μF,8 μC), scalaindipendente. Originecome limite,z eri e tutte punte leggibili.',227:'XML completo e PNG nativo640×1480 letti: distanze fra facce interne50 e100 coordinate, d₀→2d₀, area/carica invariate e U2→4 μJ. Barre128/288/208 per4/9/13/2 μJ, comune32 coordinate/μJ. Grafico aU₀2: x=150+100s,y=1300−20U, segmento s1..3 da(250,1260) a(450,1180), punto iniziale chiuso. Nessuna falsa retta per s<1.',228:'XML completo e PNG nativo640×1480 letti: due batterie concordi col segno delle piastre,Vg2 V per entrambi gli stati del medesimo processo, gap50→100 eQ12→6 μC. Barre240/120/180 per6/3/9/2 μC, comune40 coordinate/μC. Grafico soltanto tre punti(1,12),(2,6),(3,4),x=150+100s,y=1320−20Q, nessuna interpolazione lineare. Zeri e label liberi, quote schematiche dichiarate.',229:'XML completo e PNG nativo640×1480 letti: q+,vdestra,Bentrante dà Fversoalto; due frecce separate con punte complete e rettangolo ortogonalità, lunghezze non confrontabili fra unità diverse esplicitate. Barre300/200/250 per6/4/5 μN daorigine150, comune50 coordinate/μN. Grafico indipendenteB3mT,q1μC: x=150+160v,y=1310−30F, segmento(470,1130)=(2km/s,6μN); origine aperta esclusa da v>0. Nessuna traiettoriarettilinea inferita dal disegno.'}
# Fix prose spacing in fixed explanations without altering mathematics; final notes are normal Italian text.
svg[226]=svg[226].replace('z eri','zeri')
prep=A/'editorial/reviews/u6-04-independent-model-preparation-225-229-20261125/models_before_keys.py'
helper=A/'tools/corpus_engineering/dielectric_lorentz_review_models.py';assert not helper.exists();shutil.copyfile(prep,helper)
base=(A/'tools/corpus_engineering/force_uniform_electric_field_verifier.py').read_text();verify=base[base.index('def verify('):base.index('\n\nCANDIDATE_REF')]
verify=verify.replace('if digest(package)!=',"if sha(Path(model.__file__).read_bytes())!=REVIEWED_MODEL_SHA256:common.append('Independent physical model dependency changed')\n    if digest(package)!=")
verify=verify.replace("'reviewDependencySha256':{Path(codec.__file__).name:sha(Path(codec.__file__).read_bytes())}","'reviewDependencySha256':{Path(codec.__file__).name:sha(Path(codec.__file__).read_bytes()),Path(model.__file__).name:sha(Path(model.__file__).read_bytes())}")
root=A/'editorial/reviews/u6-independent-225-229-fixtures-20261125';root.mkdir(exist_ok=True)
primary=A/'editorial/reviews/primary-capacitors-magnetism-225-229-before-candidates-20261125.md';assert sha(primary.read_bytes())=='1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a';shutil.copyfile(primary,root/'primary-source-only.md')
raw=subprocess.check_output(['git','show','5cfbdcb055ba3ba136f97fb56e997f06e6cf3605:packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-04.json'],cwd=A);assert sha(raw)=='179bf1cacfb83482e32bb41e99cb78296990faafba1fe9ce3b0e3cbc3a6a09cf';sources=json.loads(raw);sources=sources if isinstance(sources,list)else sources['questions']
from tools.corpus_engineering.pipeline import digest
from tools.corpus_engineering.review_contract import reviewed_rows
oracles={225:'''def oracle():
    V0,V,k,k1,k2,C0=sp.symbols('V0 V k k1 k2 C0',positive=True)
    law=V0/k
    assert sp.solve(sp.Eq(C0*V0,k*C0*V),V)[0]==law
    unique([k*V,V/k,k/V,k*V**2,V-k],sp.solve(sp.Eq(V,V0/k),V0)[0])
    unique([k1/k2,k1*k2,k2/k1,k1/k2**2,k1+k2],sp.cancel(law.subs({V0:k1*V0,k:k2*k})/law))
    assert model.isolated_voltage(12,2)==6 and model.initial_voltage(6,2)==12 and model.dielectric_ratio(12,6)==2
    d=model.primary_only_derivations()[225];out=[d[i]for i in range(1,17)]
    out[1]='V';out[2]='La carica libera su ciascuna armatura';out[3]='Da 6 V a 1/2 V';out[8]='V₀ = κ V';out[9]='κ₁ / κ₂';out[15]='Infinite coppie continue con κ≥1'
    return out
''',226:'''def oracle():
    C0,Q,k,Vg,k1,k2=sp.symbols('C0 Q k Vg k1 k2',positive=True)
    unique([Q/(k*Vg),Q*k/Vg,Q*Vg/k,k*Vg/Q,Q/Vg],sp.solve(sp.Eq(Q,k*C0*Vg),C0)[0])
    unique([k1*k2,k1/k2,k2/k1,k1*k2**2,k1+k2],k1*k2)
    assert model.connected_charge(2,2)==8 and model.initial_capacitance(8,2)==2 and model.connected_dielectric_ratio(8,2)==2
    d=model.primary_only_derivations()[226];out=[d[i]for i in range(1,17)]
    out[1]='C';out[2]='V resta 2 V e il modulo Q aumenta';out[3]='Da 8 μC a 16 μC';out[8]='C₀ = Q / (κ V_g)';out[9]='κ₁ κ₂'
    return out
''',227:'''def oracle():
    U0,U,s,Q,C0,k1,k2=sp.symbols('U0 U s Q C0 k1 k2',positive=True)
    assert sp.cancel((Q**2/(2*(C0/s)))/(Q**2/(2*C0)))==s
    unique([s*U0,U0/s,s**2*U0,U0,U0/s**2],s*U0)
    unique([U/s,s*U,s/U,U/s**2,U-s],sp.solve(sp.Eq(U,s*U0),U0)[0])
    unique([k1*k2,k1/k2,k2/k1,k1*k2**2,k1+k2],k1*k2)
    assert model.isolated_energy(2,2)==4 and model.initial_energy(4,2)==2 and model.energy_separation(4,2)==2
    d=model.primary_only_derivations()[227];out=[d[i]for i in range(1,17)]
    out[1]='J';out[2]='U = s U₀';out[3]='Da 4 μJ a 8 μJ';out[8]='U₀ = U / s';out[9]='κ₁ κ₂'
    return out
''',228:'''def oracle():
    Q0,Q,s,C0,Vg,k1,k2=sp.symbols('Q0 Q s C0 Vg k1 k2',positive=True)
    assert sp.cancel(((C0/s)*Vg)/(C0*Vg))==1/s
    unique([Q0/s,s*Q0,Q0,Q0/s**2,s**2*Q0],Q0/s)
    unique([s*Q,Q/s,s/Q,s**2*Q,Q-s],sp.solve(sp.Eq(Q,Q0/s),Q0)[0])
    unique([k1/k2,k1*k2,k2/k1,k1/k2**2,k1+k2],k1/k2)
    assert model.separated_charge(12,2)==6 and model.initial_charge(6,2)==12 and model.charge_separation(12,6)==2
    d=model.primary_only_derivations()[228];out=[d[i]for i in range(1,17)]
    out[1]='C';out[2]='Q = Q₀ / s';out[3]='Da 6 μC a 1/2 μC';out[8]='Q₀ = s Q';out[9]='κ₁ / κ₂';out[15]='Infinite coppie continue nel regime geometrico dichiarato'
    return out
''',229:'''def oracle():
    F,q,B,k1,k2=sp.symbols('F q B k1 k2',positive=True)
    unique([F/(q*B),q*B/F,F*B/q,F/B,F/(q*B**2)],F/(q*B))
    unique([k1*k2,k1/k2,k2/k1,k1**2*k2,k1+k2],k1*k2)
    vx,vy,vz,bx,by,bz=sp.symbols('vx vy vz bx by bz',real=True)
    velocity=sp.Matrix([vx,vy,vz]);field=sp.Matrix([bx,by,bz]);assert sp.expand(q*velocity.cross(field).dot(velocity))==0
    assert sp.Matrix([1,0,0]).cross(sp.Matrix([0,0,-1]))==sp.Matrix([0,1,0])
    assert model.magnetic_force(2,3)==6 and model.speed_from_force(6,3)==2 and model.field_from_force(6,2)==3
    d=model.primary_only_derivations()[229];out=[d[i]for i in range(1,17)]
    out[1]='N';out[2]='Il modulo della velocità';out[3]='Da 6 μN a 3 μN';out[8]='v = F_B / (|q| B)';out[9]='κ₁ κ₂'
    return out
'''}
def prose(s):
 replacements={'trattaDcomeQ':'tratta D come Q','DcomeQ':'D come Q','daorigine':'da origine','sc ala':'scala','scalaindipendente':'scala indipendente','Forzaortogonale':'Forza ortogonale','velocitàmodulo':'velocità in modulo','potenzamagnetica':'potenza magnetica','proprietàuniversale':'proprietà universale','unitàdiverse':'unità diverse','darebbeF':'darebbe F','prediceF':'predice F','copi forza':'copia la forza','copiafinale':'copia il finale','divideancora':'divide ancora','ometteoffset':'omette l’offset','ometteguadagno':'omette il guadagno','inversafisica':'inversa fisica','segnoq':'segno di q','solov':'solo v','soloB':'solo B','soloQ':'solo Q','solaC':'sola C','daU':'da U','sottoil':'sotto il','vdestra':'v verso destra','Bentrante':'B entrante','Fversoalto':'F verso l’alto','traiettoriarettilinea':'traiettoria rettilinea','proveidentiche':'prove identiche','moduli,9copi':'moduli, 9 copia','radice,2copi':'radice, 2 copia','violamoduli':'viola i moduli','copi quadrato':'copia il quadrato','copi v':'copia v','forza6':'forza 6'}
 for old,new in replacements.items():s=s.replace(old,new)
 s=re.sub(r'(?<=[0-9])(?=[A-Za-zΑ-ω])',' ',s);s=re.sub(r'(?<=[A-Za-zΑ-ω])(?=[0-9])',' ',s)
 s=re.sub(r',(?=[A-Za-zΑ-ω0-9])',', ',s);s=re.sub(r';(?=[A-Za-zΑ-ω0-9])','; ',s)
 return s
contrasts={n:[prose(s)for s in values]for n,values in contrasts.items()}
svg={n:prose(s)for n,s in svg.items()}
for n,(family,ref)in refs.items():
 batch=f'{family}-{n}';D=root/batch;D.mkdir(exist_ok=True)
 for suffix,name in [('.json','package.json'),('-bindings.json','bindings.json')]:
  raw=subprocess.check_output(['git','show',ref+f':officina-di-fisica/editorial/batches/{batch}{suffix}'],cwd=A);assert raw==(Path('/private/tmp/cric-author-b-resident/officina-di-fisica/editorial/batches')/f'{batch}{suffix}').read_bytes();(D/name).write_bytes(raw)
 asset=family+'-progressive.svg';raw=subprocess.check_output(['git','show',ref+':officina-di-fisica/editorial/assets/'+asset],cwd=A);(D/asset).write_bytes(raw)
 render=A/'output/playwright/u6-independent-225-229-a'/batch
 for name in ['full-native.png','render.json','process-terminal-observation.json']:shutil.copyfile(render/name,D/name)
 assert json.loads((D/'render.json').read_text())['sourceSvgSha256']==sha(raw)
 p=json.loads((D/'package.json').read_text());b=json.loads((D/'bindings.json').read_text());tokens={r['id']:t for r,l,t,a,e in reviewed_rows(p,b,{},set(r['id']for r in p['records']),D)}
 skills={i:'C4-L09'if n==229 else'C4-L07'for i in range(1,17)}
 physical={225:'volt',226:'microcoulomb',227:'microjoule',228:'microcoulomb',229:'micronewton'}[n]
 units={i:''for i in range(1,17)};units.update({i:physical for i in [1,2,4,8,12]})
 if n in[225,228]:
  unit='V'if n==225 else'μC';units.update({5:physical,9:physical,14:physical,15:physical});num={1:unit,5:unit,6:'1',14:unit,15:unit};suffix={8:' '+unit,12:' '+unit};non={8:{'2'}}
 elif n==226:
  units.update({5:'microfarad',9:'farad',14:'microfarad',15:'microfarad'});num={1:'μC',5:'μF',6:'1',14:'μF',15:'μF'};suffix={8:' μC',12:' μC'};non={8:{'2'},16:{'Infinite costanti relative'}}
 elif n==227:
  units.update({5:physical,9:physical,14:physical,15:physical});num={1:'μJ',5:'μJ',6:'1',14:'μJ',15:'μJ'};suffix={8:' μJ',12:' μJ'};non={8:{'2'},16:{'Infinite separazioni'}}
 else:
  units.update({5:'kilometer/second',6:'millitesla',9:'meter/second',14:'kilometer/second',15:'kilometer/second',16:'millitesla'});num={1:'μN',5:'km/s',6:'mT',14:'km/s',15:'km/s'};suffix={8:' μN',12:' μN'};non={8:{'2'},16:{'Infinite intensità di campo'}}
 mm=list(manual[family]);mm[1]=mm[1].split('Nessuna')[0].split('Le alternative')[0].strip()+' Nella primaria le alternative non erano aperte; nella successiva lettura tutte e cinque sono state confrontate individualmente.'
 pre=base[:base.index('SOURCE_REF=')]+"from . import dielectric_lorentz_review_models as model\n"+f"SOURCE_REF='5cfbdcb055ba3ba136f97fb56e997f06e6cf3605'\nSOURCE_PATH='packages/engine/lessonos/study/content/physics-semestre-2026-bank/questions/U6-04.json'\nFAMILY={family!r}\nEXPECTED_IDS={{f'AR-u6-{{FAMILY}}-{{n:02}}'for n in range(1,17)}}\nREVIEWED_SKILLS={skills!r}\n"+base[base.index('def unique('):base.index('def calibrate(')]
 code=pre+'\n@lru_cache(maxsize=1)\n'+oracles[n]
 for k,v in {'MANUAL':mm,'DISTRACTORS':contrasts[n],'ASSUMPTIONS':[assumptions[n]]*16,'UNITS':units,'NUMERIC_UNITS':num,'SUFFIX':suffix,'NON_NUMERIC_DISTRACTORS':non,'SVG_REVIEW':svg[n],'CALCULATION_SCOPE':{2:'NO_STUDENT_CALCULATION',3:'NO_STUDENT_CALCULATION'if n in[225,226,229]else'SYMBOLIC_MANUAL_DERIVATION',9:'SYMBOLIC_MANUAL_DERIVATION',10:'SYMBOLIC_MANUAL_DERIVATION'}}.items():code+='\n'+k+'='+repr(v)+'\n'
 code+='\n'+verify+'\n'
 for k,v in {'CANDIDATE_REF':ref,'PRIMARY_SHA256':'1884c8105aca5fd3c3f97999c64257e04c67490b7238cb2910764ad2a830684a','REVIEWED_MODEL_SHA256':sha(helper.read_bytes()),'REVIEWED_LITERAL_CODEC_SHA256':sha((A/'tools/corpus_engineering/electric_exact_literals.py').read_bytes()),'REVIEWED_PACKAGE_SHA256':digest(p),'REVIEWED_BINDINGS_SHA256':digest(b),'REVIEWED_CANDIDATES':tokens,'READ_SOURCE_SHA256':{r['id']:digest(r)for r in sources if r['id'].startswith('u6-'+family+'-')},'SOURCE_READING':'Primaria prompt-only di tutti80 originali U6-04 B225–229 congelata prima di qualunque candidato. Successiva lettura allowlist di tutti80 prompt finali, poi modelli indipendenti scritti ed eseguiti realmente prima delle chiavi. Solo dopo sono stati letti individualmente tutti16 record finali completi, opzioni, formule, hint, feedback, metadata, XML e nuovo PNG nativo integrale. Nessuna esposizione anticipata a chiavi, nessun modulo autore importato o primaria B aperta. UI prodotto e human NOT_RUN; confronto integrato ROOT PENDING.'}.items():code+='\n'+k+'='+repr(v)+'\n'
 target=A/f'tools/corpus_engineering/{family.replace("-","_")}_verifier.py';assert not target.exists();target.write_text(code.rstrip()+'\n')
 (D/'manifest.json').write_text(json.dumps({'candidateCommit':ref,'scope':'Independent final full-record reading and actual full SVG-only native rendering; not product UI','files':{x.name:sha(x.read_bytes())for x in sorted(D.iterdir())if x.is_file()and x.name!='manifest.json'},'humanApproval':'NOT_RUN','publicationAction':'NONE'},ensure_ascii=False,indent=2)+'\n')
 print('FROZEN_AFTER_FINAL_READING',batch)
