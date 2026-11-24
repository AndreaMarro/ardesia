"""Independent review of original C1-E017..020 and C2-E001..004 examples.

No candidate or authoring module imported. Source and historical figure hashes
were frozen after reading every prompt, block and referenced SVG individually.
"""
from fractions import Fraction
from pathlib import Path

import pint
import sympy as sp

from .pipeline import digest, sha

APP=Path(__file__).resolve().parents[2]
SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d'
SOURCE_PATH='officina-di-fisica/content/C1.json'
SOURCE_FILE_SHA256='0a79b1212adbef650733d655d1de2d5ffd7af5eb2be2bde50710a0a1721ab0cf'
SOURCE_FILES={SOURCE_PATH:SOURCE_FILE_SHA256,
 'officina-di-fisica/content/C2.json':'7f2d3cf84a46d5d0086fd9cd6318b923ee073febc110a52fbc8f682edd995b23'}
READ_SOURCE_SHA256={
 'C1-E017':'af066f803cfa281a955b951d439b91bddc809465fd1942e5e2bf18a5a3df1ac1',
 'C1-E018':'803d1e0b3fd728c70e52541ea09ace41d460b3165599589a75a3b7ced793a56d',
 'C1-E019':'e21ec19bc649f93ee8efb56012dcca940ee5673e1e574b901a6bde7b3c505d8d',
 'C1-E020':'fe6f77e518f0a96cc9af42e77b52974dc558a3663bc2ffcb9f1ffd15f2275b1f',
 'C2-E001':'d65274b8635a663da2c2bffdbf1226f94bf621bb3cb8d56a10be353c75171444',
 'C2-E002':'41aa637013b76d7e559642a8a28a2d847926cd471ea223815b434e8e48d56454',
 'C2-E003':'d123a3563b4d8a791827318d3dbff1f4af56eff21ac9dda57bb534ba4b3128ba',
 'C2-E004':'62a44af04a479a8e175ac243ba00080d24b5a02d1271757f949fe857ef96004c',
}
READ_ASSETS={
 'C1-impulso.svg':'da0e022c6e42c1509d6a7c3f5721cc633f046ff164b2ab06878cab7b931f8402',
 'C1-aggancio.svg':'94627f0e1d0c8ad0326d7ccf7894ab420ad9a5b8a40772809b4176362773db95',
 'C1-leva.svg':'e708c2fc539832a2dc4f5de2015f9b3cba8584883f3a7900ba2e1ad74a6f1d41',
 'C1-cdm.svg':'3906b02224c15b11aa2dd7ec3dae9d455eeb3c2f44c15ebaeb3490c8d077ef77',
 'C2-membrana.svg':'772b8d0bfb56f06eb29bf1e5d3fd29ea669f2ec099393f2866fc9bc5fb117ebd',
 'C2-manometro.svg':'6422c8e2f436ca33deee8b7d18294ffed0c4095e40d3fba6205dd616ea0bd90c',
 'C2-strati.svg':'f46f81593447ebc68faa77ba1f0537cf8ff0714beb4f43e5c058aa17f01dc87a',
}
FIGURE_BY_ID={'C1-E017':'C1-impulso.svg','C1-E018':'C1-aggancio.svg',
 'C1-E019':'C1-leva.svg','C1-E020':'C1-cdm.svg','C2-E002':'C2-membrana.svg',
 'C2-E003':'C2-manometro.svg','C2-E004':'C2-strati.svg'}
SI=pint.UnitRegistry(non_int_type=Fraction)


def check(label,result,printed,unit):
    residual=sp.simplify(result-printed)
    return {'claim':label,'independentExact':str(result),'printedValue':str(printed),
            'unit':unit,'dimension':{str(k):str(v) for k,v in SI.Unit(unit).dimensionality.items()},
            'relation':'exact','residual':str(residual),'ok':residual==0}


def independent_checks():
    Q=SI.Quantity
    # Construct force pulses directly from the described linear endpoints.
    t=sp.Symbol('time',real=True)
    end_half=sp.Rational(1,10)
    end=sp.Rational(1,5)
    rise=40*t/end_half
    fall=40*(end-t)/(end-end_half)
    j1=sp.integrate(rise,(t,0,end_half))
    j2=sp.integrate(fall,(t,end_half,end))
    vf=sp.solve(sp.Eq(2*sp.Symbol('v'),j1+j2),sp.Symbol('v'))[0]
    impulse_units=(Q(Fraction(1,2),'')*Q(Fraction(1,5),'s')*Q(40,'N')).to('kg*m/s').magnitude
    pulse_speed=(Q(impulse_units,'kg*m/s')/Q(2,'kg')).to('m/s').magnitude
    # Isolated horizontal two-body system, common post-collision velocity.
    common=sp.Symbol('common',real=True)
    final=sp.solve(sp.Eq(2*3+1*(-1),(2+1)*common),common)[0]
    ki=sp.Rational(1,2)*(2*3**2+1*(-1)**2)
    kf=sp.Rational(1,2)*3*final**2
    reduced=sp.Rational(2*1,2+1)
    loss_relative=sp.Rational(1,2)*reduced*(3-(-1))**2
    energy_units=(Q(Fraction(1,2),'')*Q(3,'kg')*Q(Fraction(5,3),'m/s')**2).to('J').magnitude
    # Torque and force equations of a massless forearm about a pinned elbow.
    muscle,reaction=sp.symbols('muscle reaction',real=True)
    solution=sp.solve([sp.Eq(muscle*sp.Rational(9,200)-18*sp.Rational(3,10),0),
                       sp.Eq(reaction+muscle-18,0)],(muscle,reaction))
    torque=(Q(18,'N')*Q(Fraction(3,10),'m')).to('N*m').magnitude
    muscle_units=(Q(torque,'N*m')/Q(Fraction(9,200),'m')).to('N').magnitude
    # Point-mass centre of mass and uniform-gravity torque balance.
    masses=[Fraction(3),Fraction(1)]
    positions=[Fraction(-1,5),Fraction(3,5)]
    moment=sum(m*x for m,x in zip(masses,positions))
    xcm=moment/sum(masses)
    left_torque=-(Q(positions[0],'m')*Q(masses[0],'kg')*Q(10,'m/s**2')).to('N*m').magnitude
    right_torque=-(Q(positions[1],'m')*Q(masses[1],'kg')*Q(10,'m/s**2')).to('N*m').magnitude
    support=(sum(Q(m,'kg')*Q(10,'m/s**2') for m in masses)).to('N').magnitude
    # Fluid sample: subtract container before the intensive-property ratio.
    sample=(Q(Fraction(99,2),'g')-Q(24,'g')).to('kg')
    volume=Q(30,'mL').to('m**3')
    density=(sample/volume).to('kg/m**3').magnitude
    # Opposing uniform pressure forces on one and the same plane area.
    area=Q(6,'cm**2').to('m**2')
    pressure_left=Q(104,'kPa').to('Pa')
    pressure_right=Q(100,'kPa').to('Pa')
    force_left=(pressure_left*area).to('N').magnitude
    force_right=(pressure_right*area).to('N').magnitude
    # Hydrostatic dp/dh=rho*g, integrated downwards in connected static fluid.
    depth=sp.Symbol('depth',real=True)
    manometer=sp.integrate(1000*sp.Rational(49,5),(depth,0,sp.Rational(3,25)))
    manometer_units=(Q(1000,'kg/m**3')*Q(Fraction(49,5),'m/s**2')*Q(12,'cm')).to('Pa').magnitude
    oil=sp.integrate(800*10,(depth,0,sp.Rational(1,10)))
    water=sp.integrate(1000*10,(depth,0,sp.Rational(1,4)))
    layers_units=(Q(800,'kg/m**3')*Q(10,'m/s**2')*Q(10,'cm')+
                  Q(1000,'kg/m**3')*Q(10,'m/s**2')*Q(25,'cm')).to('kPa').magnitude
    results={
     'C1-E017':[
       check('impulso tratto crescente da integrale',j1,2,'N*s'),
       check('impulso tratto decrescente ancora positivo',j2,2,'N*s'),
       check('impulso totale',j1+j2,4,'N*s'),
       check('velocita orientata finale da variazione quantita di moto',vf,2,'m/s'),
       check('forza media temporale',(j1+j2)/end,20,'N'),
       check('impulso dimensionale Pint',sp.Rational(impulse_units),4,'kg*m/s'),
       check('velocita da unita impulso/massa',sp.Rational(pulse_speed),vf,'m/s'),
       check('distrattore picco mantenuto darebbe doppia velocita',40*end/2,2*vf,'m/s')],
     'C1-E018':[
       check('quantita di moto totale orientata',sp.Integer(2*3-1),5,'kg*m/s'),
       check('velocita comune da conservazione',final,sp.Rational(5,3),'m/s'),
       check('energia cinetica iniziale',ki,sp.Rational(19,2),'J'),
       check('energia cinetica finale',kf,sp.Rational(25,6),'J'),
       check('perdita di energia cinetica',ki-kf,sp.Rational(16,3),'J'),
       check('perdita da massa ridotta e velocita relativa',loss_relative,ki-kf,'J'),
       check('energia finale dimensionale Pint',sp.Rational(energy_units),kf,'J')],
     'C1-E019':[
       check('forza muscolare da equilibrio dei momenti',solution[muscle],120,'N'),
       check('reazione verticale orientata',solution[reaction],-102,'N'),
       check('modulo momento del carico',sp.Rational(torque),sp.Rational(27,5),'N*m'),
       check('momento muscolare opposto',solution[muscle]*sp.Rational(9,200),sp.Rational(27,5),'N*m'),
       check('risultante verticale',solution[reaction]+solution[muscle]-18,0,'N'),
       check('unita momento diviso braccio',sp.Rational(muscle_units),solution[muscle],'N')],
     'C1-E020':[
       check('primo momento di massa orientato',sp.Rational(moment),0,'kg*m'),
       check('centro di massa',sp.Rational(xcm),0,'m'),
       check('momento sinistro antiorario',sp.Rational(left_torque),6,'N*m'),
       check('momento destro orario',sp.Rational(right_torque),-6,'N*m'),
       check('momento gravitazionale totale',sp.Rational(left_torque+right_torque),0,'N*m'),
       check('reazione del sostegno per equilibrio di forze',sp.Rational(support),40,'N')],
     'C2-E001':[
       check('massa del liquido senza tara',sp.Rational(sample.magnitude),sp.Rational(51,2000),'kg'),
       check('volume in SI',sp.Rational(volume.magnitude),sp.Rational(3,100000),'m**3'),
       check('densita dal rapporto massa liquido/volume',sp.Rational(density),850,'kg/m**3'),
       check('densita in grammi per millilitro',sp.Rational(Q(density,'kg/m**3').to('g/mL').magnitude),sp.Rational(17,20),'g/mL'),
       check('ricostruzione massa totale',sp.Rational(Q(density,'kg/m**3').__mul__(volume).to('g').magnitude)+24,sp.Rational(99,2),'g')],
     'C2-E002':[
       check('area convertita col quadrato del prefisso',sp.Rational(area.magnitude),sp.Rational(3,5000),'m**2'),
       check('differenza pressione assoluta',sp.Rational((pressure_left-pressure_right).magnitude),4000,'Pa'),
       check('forza della camera a104kPa',sp.Rational(force_left),sp.Rational(312,5),'N'),
       check('forza opposta della camera a100kPa',sp.Rational(force_right),60,'N'),
       check('risultante da differenza di forze',sp.Rational(force_left-force_right),sp.Rational(12,5),'N'),
       check('verifica simbolica pressione comune si cancella',sp.simplify((sp.Symbol('p')+4000)*sp.Rational(3,5000)-sp.Symbol('p')*sp.Rational(3,5000)),sp.Rational(12,5),'N')],
     'C2-E003':[
       check('dislivello in SI',sp.Rational(Q(12,'cm').to('m').magnitude),sp.Rational(3,25),'m'),
       check('pressione relativa da integrazione idrostatica',manometer,1176,'Pa'),
       check('conversione dimensionale Pint della colonna',sp.Rational(manometer_units),manometer,'Pa'),
       check('pressione relativa esatta in kPa',sp.Rational(Q(manometer_units,'Pa').to('kPa').magnitude),sp.Rational(147,125),'kPa')],
     'C2-E004':[
       check('contributo olio da integrazione',oil,800,'Pa'),
       check('contributo acqua da integrazione',water,2500,'Pa'),
       check('somma degli incrementi in discesa',oil+water,3300,'Pa'),
       check('conversione SI e somma Pint',sp.Rational(layers_units),sp.Rational(33,10),'kPa'),
       check('spessore totale come controllo non sostituisce le densita',sp.Rational(1,10)+sp.Rational(1,4),sp.Rational(7,20),'m')],
    }
    # Secondary explicitly approximate decimal, supported by integer cross-products.
    lower,upper=sp.Rational(213,40),sp.Rational(1067,200)
    bracket=lower<sp.Rational(16,3)<upper
    results['C1-E018'].append({'claim':'approssimazione secondaria 5,33 J',
      'independentExact':'16/3','printedValue':'5.33','unit':'J',
      'dimension':{str(k):str(v) for k,v in SI.Unit('J').dimensionality.items()},
      'relation':'explicit_approximation_nearest_hundredth','manualBounds':'5.325 < 16/3 < 5.335; 639<640 and 3200<3201',
      'ok':bool(bracket)})
    results['C2-E003'].append({'claim':'approssimazione secondaria1,18kPa',
      'independentExact':'147/125','printedValue':'1.18','unit':'kPa',
      'dimension':{str(k):str(v) for k,v in SI.Unit('kPa').dimensionality.items()},
      'relation':'explicit_approximation_nearest_hundredth',
      'manualBounds':'1.175 < 1.176 < 1.185, or 1175 < 1176 < 1185 after multiplying by1000',
      'ok':bool(sp.Rational(47,40)<sp.Rational(147,125)<sp.Rational(237,200))})
    return results


MANUAL={
 'C1-E017':'0,10=1/10s; ogni triangolo (1/2)*(1/10)*40=2N s; somma4N s. Massa2kg e vi0 danno vf=+4/2=+2m/s. Durata1/5s: media4/(1/5)=20N. Picco40 per tutto1/5s darebbe impulso8 e vf4, doppio.',
 'C1-E018':'pi=2*3+1*(-1)=6-1=5kg m/s; massa3kg, vf=5/3m/s. Ki=9+1/2=19/2J; Kf=(3/2)*(25/9)=25/6J. Perdita57/6-25/6=32/6=16/3J. 16/3=5+1/3=5,333...; arrotondamento5,33 secondario. Soglie5,325=213/40 e5,335=1067/200: 213*3=639<640=16*40 e16*200=3200<3201=1067*3.',
 'C1-E019':'Bracci0,045=9/200m e0,30=3/10m. Momento carico18*(3/10)=27/5=5,4N m; Fm=(27/5)/(9/200)=(27*40)/9=120N. Ry=18-120=-102N. Momento120*(9/200)=27/5, risultante-102+120-18=0. Bracci perpendicolari per forze verticali e avambraccio orizzontale.',
 'C1-E020':'3*(-1/5)+1*(3/5)=-3/5+3/5=0kg m, diviso massa4kg da xCM0. In g10m/s2 pesi30e10N; momenti+30/5=+6 e-10*(3/5)=-6N m. Reazione verticale40N equilibra il peso totale. Stesso risultato per ogni g uniforme positivo per cancellazione del fattore comune.',
}
ASSUMPTIONS={
 'C1-E017':'Riferimento del laboratorio approssimato inerziale; massa2kg costante; forza orizzontale dichiarata netta, positiva e lineare nei due intervalli. Carrello inizialmente fermo; nessun impulso aggiuntivo da sommare alla risultante assegnata.',
 'C1-E018':'Riferimento inerziale della guida e asse positivo verso destra; masse costanti; impulso esterno orizzontale trascurabile durante urto, non necessaria assenza di forze verticali. Aggancio permanente e unica velocita traslazionale finale; sistema comprende entrambi i carrelli.',
 'C1-E019':'Modello statico bidimensionale: avambraccio orizzontale rigido di peso trascurabile; carico18N verticale in basso; muscolo verticale in alto. Gomito come giunto che puo esercitare reazione anche verso il basso, non semplice appoggio unilaterale; nessuna coppia vincolare aggiuntiva nel modello. Distanze dal gomito uguali ai bracci per la perpendicolarita delle forze.',
 'C1-E020':'Masse puntiformi fissate a unasta di massa trascurabile; coordinate orientate sulla medesima retta. Gravita uniforme; sostegno puntiforme verticale nellorigine, con portata sufficiente. Si dimostra equilibrio orizzontale, senza rivendicare stabilita o un momento di richiamo.',
}
PEDAGOGY={
 'C1-E017':'Forza decrescente non significa forza negativa: entrambe le aree sono positive. Picco non uguale a media; usare40N per0,20s raddoppia impulso e velocita. Impulso della risultante, non lavoro o forza istantanea divisa per massa; segno finale coerente con asse dichiarato.',
 'C1-E018':'Quantita di moto algebrica, energia cinetica quadratica: il carrello sinistrorso contribuisce-1kg m/s ma+1/2J. Non si conserva K in urto con aggancio. Sommare i moduli del momento darebbe7/3m/s e violerebbe il momento iniziale5. Radice o trigonometria non necessarie; perdita16/3 esatta prima del decimale esplicito.',
 'C1-E019':'Separati equilibrio dei momenti ed equilibrio delle forze. Reazione non compare nei momenti presi in O, ma non e nulla. Fm120N grande per braccio corto; Ry negativo significa verso il basso, non impossibilita del giunto. Usare Fm18N ignorerebbe il rapporto dei bracci e non bilancerebbe il momento.',
 'C1-E020':'Coordinate negative e positive conservate: media semplice(-0,20+0,60)/2=0,20m sarebbe sbagliata per masse diverse. Centro piu vicino alla massa maggiore; bracci0,20e0,60 in rapporto1:3. Momento nullo richiede anche equilibrio delle forze: conclusione lo ricorda, oracolo ne trova40N per g10.',
}
FIGURE_REVIEW={
 'C1-E017':'Triangolo interamente sopra lasse del tempo, picco40N a0,10s e zeri0e0,20s; basi uguali176px per0,10s. Picco y49, base y165; asse y167, scarto2px da spessore grafico, non ulteriore forza fisica. Area e non lunghezza del perimetro rappresenta impulso. Figura pinned letta e renderizzata.',
 'C1-E018':'Carrello2kg a sinistra con freccia destra+3m/s, carrello1kg a destra con freccia sinistra-1m/s; convergono. Frecce64e22px qualitativamente e quasi proporzionalmente3:1, nessuna scala metrica dichiarata. Dopo i rettangoli si toccano e caption indica velocita unica, senza imporre energia conservata.',
 'C1-E019':'O e giunto al gomito; forza muscolare alta e carico basso danno momenti opposti. Caption dichiara bracci schematici: non si estraggono0,045e0,30m dalle lunghezze in pixel. Simbolo triangolare rappresenta il giunto del modello, non aggiunge un vincolo di reazione solo verso lalto. Nessuna scala quantitativa delle frecce, ne pretesa Fm/carico dal rapporto84/59px.',
 'C1-E020':'Asse x in metri: origine216px, massa3kg a146px e1kg a426px, distanze70e210px esattamente1:3 coerenti con0,20e0,60m (350px/m). Dimensioni dei dischi distinguono simbolicamente masse puntiformi; non sono raggi o ulteriori dati del problema. Segni e origine corretti.',
}


MANUAL.update({
 'C2-E001':'Massa liquido49,5-24,0=25,5g=51/2000kg. Volume30mL=30/1000000m3=3/100000m3. Rapporto(51/2000)/(3/100000)=51*50/3=850kg/m3. In g/mL25,5/30=255/300=17/20=0,850. Ricostruzione850*(3/100000)=51/2000kg=25,5g; piu24g restituisce49,5g.',
 'C2-E002':'1cm2=(1/100m)^2=1/10000m2;6cm2=3/5000m2. Differenza(104-100)kPa=4*1000=4000Pa. Prodotto4000*6/10000=24/10=12/5=2,4N. Forze separate104000*(3/5000)=62,4N e100000*(3/5000)=60N; differenza2,4N verso la camera a100kPa.',
 'C2-E003':'12cm=3/25m;9,8=49/5m/s2. Incremento1000*(49/5)*(3/25)=8*147=1176Pa. In kPa1176/1000=147/125=1,176 esatto, arrotondato1,18;1175<1176<1185 delimita1,175<1,176<1,185 senza calcolatrice. Segno positivo per superficie del gas piu bassa.',
 'C2-E004':'Olio10cm=1/10m:800*10*(1/10)=800Pa. Acqua25cm=1/4m:1000*10/4=2500Pa. Discesa in entrambi:800+2500=3300Pa=33/10kPa=3,3kPa. Spessore totale1/10+1/4=7/20m non giustifica usare ununica densita arbitraria.',
})
ASSUMPTIONS.update({
 'C2-E001':'Liquido omogeneo, recipiente invariato fra tara e misura piena, nessuna massa di tappo o materiale aggiunto;30mL e il volume del solo liquido. Densita media del campione nelle condizioni di misura, non identificazione univoca di una sostanza. Confronto qualitativo con acqua liquida ordinaria a temperatura ambiente, senza usarne un valore preciso nel calcolo.',
 'C2-E002':'Membrana piana, area6cm2 effettiva uguale su entrambe le facce; pressioni uniformi assolute riferite alla stessa convenzione. Si chiede soltanto la risultante dovuta alle pressioni, non tensione della membrana o reazione dei supporti. Spinte normali e opposte, fluido in quiete senza contributi viscosi.',
 'C2-E003':'Acqua connessa in quiete a densita1000kg/m3 costante, gravita uniforme9,8m/s2; superfici misurate a differenza di quota12cm, non spostamento di ciascun ramo. Gas e atmosfera agiscono sulle rispettive superfici; trascurati salti capillari e contributi di colonne di gas. Pressione relativa definita pgas-patm.',
 'C2-E004':'Due liquidi omogenei immiscibili in quiete, olio sopra acqua, densita e g costanti; vaso aperto con superficie a pressione atmosferica. Interfaccia piana con effetti capillari trascurati esplicitamente; pressione continua attraverso interfaccia. Si chiede pressione relativa al fondo, senza aggiungere patm al numero richiesto.',
})
PEDAGOGY.update({
 'C2-E001':'Sottrae tara prima del rapporto; massa piena49,5g al posto di25,5 darebbe1650kg/m3 e non densita del liquido. Volume30mL del solo liquido, fattore10^-6 nella conversione volumica. Risultati850kg/m3 e0,850g/mL equivalenti; densita minore dellacqua ordinaria non identifica automaticamente il materiale.',
 'C2-E002':'Forze opposte sulla stessa area: differenza e non somma delle pressioni. Usare una sola pressione assoluta darebbe62,4 o60N; sommarle122,4N. Convertire6cm2 come6*10^-2m2 produrrebbe errore100; il prefisso della lunghezza va elevato al quadrato.',
 'C2-E003':'Un percorso idrostatico collega livelli: scendere dal ramo atmosferico aumenta p. Quota del gas piu bassa implica pgas>patm. Invertire il segno o usare2*12cm confonderebbe differenza totale di livelli con due spostamenti.1176Pa esatto precede esplicita approssimazione1,18kPa, sostenuta da soli interi.',
 'C2-E004':'Somma gli incrementi a densita diversa e conserva la pressione acquisita nello strato precedente. Usare soltanto acqua per35cm darebbe3500Pa, soltanto olio2800Pa; entrambi diversi da3300. Cambiare segno allo strato inferiore sarebbe errato: si scende ancora. Densita efficace ponderata per spessori funzionerebbe, ma non una densita arbitraria.',
})
FIGURE_REVIEW.update({
 'C2-E002':'Membrana verticale al centro:104kPa a sinistra e100kPa a destra; frecce normali verso le facce opposte. Caption dichiara versi, non scala metrica:77e71px sono schematici e non servono a stimare il rapporto104/100. Area6cm2 esplicita; risultante verso destra corretta.',
 'C2-E003':'Acqua connessa nei due rami; gas a sinistra con interfaccia y104, atmosfera a destra con superficie y64. Quota gas piu bassa, segmenti tratteggiati e simbolo delta_h mostrano una sola differenza verticale40px, non due colonne da sommare. Nessuna scala numerica ulteriore o fluido diverso rappresentato.',
 'C2-E004':'Vaso aperto, olio superiore etichettato10cm e acqua inferiore25cm; spessori grafici40e98px circa in rapporto1:2,5, senza scala quantitativa dichiarata. Confine comune y81, superficie libera e fondo coerenti con discesa attraverso entrambi gli strati. Numeri del prompt governano il calcolo, non misurazioni dello stroke.',
})


def verify(sources,asset_root=None):
    missing=set(READ_SOURCE_SHA256)-set(sources)
    if missing:
        raise ValueError('Missing independently read original examples: '+','.join(sorted(missing)))
    asset_root=Path(asset_root) if asset_root is not None else APP/'static/figures'
    models=independent_checks()
    records=[]
    for key in READ_SOURCE_SHA256:
        row=sources[key];errors=[]
        if row.get('kind')!='example' or digest(row)!=READ_SOURCE_SHA256[key]:
            errors.append('Source differs from the individually read original example')
        name=FIGURE_BY_ID.get(key);expected={'/figures/'+name} if name else set()
        actual={b['src'] for b in row.get('blocks',[]) if b.get('type')=='figure'}
        if actual!=expected:errors.append('Figure references differ from read original')
        assets={}
        if name:
            path=asset_root/name
            asset_hash=sha(path.read_bytes()) if path.is_file() else 'MISSING'
            assets['/figures/'+name]=asset_hash
            if asset_hash!=READ_ASSETS[name]:errors.append('Historical scientific figure changed or missing')
        checks=models[key]
        if not all(c['ok'] for c in checks):errors.append('Independent physical calculation failed')
        records.append({'id':key,'sourceSha256':digest(row),'sourceVersion':row.get('version',1),
         'sourcePath':'officina-di-fisica/content/'+key[:2]+'.json',
         'ok':not errors,'errors':errors,'checks':checks,'dimension':{c['claim']:c['dimension'] for c in checks},
         'calculationScope':'EXACT_MANUAL_CALCULATION','manualArithmetic':MANUAL[key],
         'manualFeasibility':'PASS_AI_EXACT','failedPublishedEdition':False,
         'physicalAssumptions':ASSUMPTIONS[key],'pedagogicalReview':PEDAGOGY[key],
         'assetChecksums':assets,'figureReview':FIGURE_REVIEW.get(key,'No figure in this source record'),
         'verificationMode':'INDEPENDENT_EXISTING_EDITION','originalEditionRetained':True,
         'humanApproval':'NOT_RUN','publicationAction':'NONE'})
    return records


def report(sources):
    records=verify(sources)
    return {'schemaVersion':'1.0.0','batch':'examples-c1-activities-005','records':records,
     'verifierSha256':sha(Path(__file__).read_bytes()),'sourceRef':SOURCE_REF,'sourcePath':SOURCE_PATH,
     'sourceFileSha256':SOURCE_FILE_SHA256,'contractSha256':sha(Path(__file__).with_name('review_contract.py').read_bytes()),
     'acceptedCount':sum(r['ok'] for r in records),'failedCount':sum(not r['ok'] for r in records),
     'draftReviewedCount':0,'failedPublishedEditionIds':[],
     'scopeNote':'Eight original examples: C1-E017..020 and C2-E001..004, from two pinned course files.',
     'sourcePaths':list(SOURCE_FILES),'sourceFileSha256ByPath':SOURCE_FILES,
     'dependencyVersions':{'sympy':sp.__version__,'pint':pint.__version__},
     'reviewer':'separate_AI_reviewer_not_original_author','humanApproval':'NOT_RUN',
     'publicationAction':'NONE','originalEditionRetained':True}
