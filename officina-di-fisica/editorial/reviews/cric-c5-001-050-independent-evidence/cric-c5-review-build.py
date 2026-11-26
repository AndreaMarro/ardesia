from pathlib import Path
from fractions import Fraction
import ast,json,hashlib,subprocess,xml.etree.ElementTree as ET
from tools.corpus_engineering.pipeline import sha,digest,git_bytes
from tools.corpus_engineering.review_contract import reviewed_rows
APP=Path.cwd();A=Path('/private/tmp/cric-author-a-resident/officina-di-fisica')
MODEL_PATH='editorial/reviews/cric-c5-001-050-independent-models.py';PRIMARY_PATH='editorial/reviews/primary-cric-c5-001-050-before-candidates-20261126.md';MODEL_REF='18fd1cd488c90f4d294e4cfc6fb361be9a042d88'
model=(APP/MODEL_PATH).read_text();primary=(APP/PRIMARY_PATH).read_text();assert model.encode()==git_bytes(APP.parent,MODEL_REF,'officina-di-fisica/'+MODEL_PATH)
pure='\n\n'.join('\n'.join(model.splitlines()[n.lineno-1:n.end_lineno])for n in ast.parse(model).body if isinstance(n,ast.FunctionDef))
refs=['cd2c949a12535d7504e92dffb874eddcc71eecee','637af6f6dda9e7c8a58869ca0d3b92d284e3dee2','d409f2cc91e0e4bff841a2d677d29289a3a6d33f','5fb56b5ca057ec0587f8a5e6f26105b2d45d099a','6529aca9064bbd93fbf343f0d9c504beaf08ec57']
# These concepts were separately solved in the prompt-only primary; strings select the final, fully read wording.
concept={4:'Stessa posizione e stesso verso della velocità',5:'Estremo positivo e velocità nulla',7:'La posizione di equilibrio',8:'La velocità',10:'Ampiezza decrescente e periodo osservato quasi costante',12:'Il periodo',13:'Torna alla posizione di equilibrio iniziale',18:'Longitudinale',20:'La lunghezza d’onda',22:'Si separano e continuano nei rispettivi versi',24:'Distruttiva completa',26:'La fase relativa dei contributi cambia con il punto di misura',28:'La condizione di rinforzo o cancellazione in un punto cambia nel tempo',30:'No: servono le ordinate dei due profili nello stesso punto',34:'L’intensità resta uguale e la potenza raddoppia',35:'Tempo',36:'Rimane costante',40:'È la stessa',42:'L’intensità positiva I₀',44:'No: la sensibilità dell’udito dipende anche dalla frequenza',46:'Prima superiore, poi inferiore a quella emessa',47:'Incontra più fronti nell’unità di tempo',49:'Decibel'}
suffix={2:' s',3:' Hz',6:' periodi',9:'',14:' rad',16:'',17:' rad/m',19:' m',25:'',27:'',32:'',33:' m',37:' W',41:' μW/m²',48:' m',50:' dB'}
units={1:'millimeter',2:'second',3:'hertz',6:'dimensionless',9:'dimensionless',11:'centimeter',14:'radian',15:'meter/second',16:'dimensionless',17:'radian/meter',19:'meter',21:'millimeter',23:'millimeter',25:'meter',27:'dimensionless',29:'millisecond',31:'watt/meter**2',32:'dimensionless',33:'meter',37:'watt',38:'dimensionless',39:'watt',41:'microwatt/meter**2',43:'dimensionless',45:'meter/second',48:'meter',50:'dimensionless'}
known={9:{'Raddoppia':'2','Quadruplica':'4','Si dimezza':'1/2','Diventa un quarto':'1/4','Resta uguale':'1'},16:{'Diventa un terzo':'1/3','Triplica':'3','Diventa un nono':'1/9','Resta uguale':'1'},25:{'λ/2':'1/2','λ/4':'1/4','λ':'1','5λ/2':'5/2','2λ':'2'},27:{'Quattro volte':'4','Due volte':'2','Uguale':'1','La metà':'1/2','Zero':'0'}}
# Explicit known mathematical expressions read above; never an expression evaluator or answer-copy oracle.
maths={'π':'sp.pi','2π':'2*sp.pi','π/2':'sp.pi/2','π/4':'sp.pi/4','5/(4π)':'5/(4*sp.pi)','4π/5':'4*sp.pi/5','5π':'5*sp.pi','4π':'4*sp.pi','20 log₁₀(3)':'20*sp.log(3)/sp.log(10)','10 log₁₀(1/3)':'-10*sp.log(3)/sp.log(10)','10 log₁₀(3)':'10*sp.log(3)/sp.log(10)'}
notes=[
'Il percorso fra estremi è 14 mm; ampiezza 7 mm rispetto allo zero. Non si divide ancora per due il massimo modulo.',
'Cinque intervalli fra sei massimi: 0,75/5 s; dividere per sei o usare un istante assoluto non ricostruisce le tacche.',
'Gli attraversamenti opposti sono separati da mezzo periodo; 18 ms come periodo raddoppia f, quattro intervalli la dimezzano.',
'Uguale posizione con verso opposto identifica le due fasi distinte; uguali energia o moduli di velocità e accelerazione non fissano il verso.',
'A t=0 il coseno vale uno e il seno zero: accelerazione verso il centro, non punto con velocità massima.',
'La fase è accumulata: 3π/(2π)=3/2, non fase ridotta a π né conteggio necessariamente intero.',
'Il segno meno confronta accelerazione e spostamento; non implica sempre asse negativo o forza opposta alla velocità.',
'Fra le alternative solo il modulo della velocità è massimo; forza, accelerazione e spostamento sono nulli. K sarebbe anch’essa massima ma non è proposta.',
'Il periodo varia con la radice di m/k: dividere k per quattro raddoppia T, non lo quadruplica.',
'Decadimento dei picchi con rapporti 3/4 e intervalli quasi costanti è compatibile con smorzamento; non identifica da solo la causa.',
'La separazione cresta-valle è mezza lunghezza, non ampiezza verticale; raddoppiare 18 cm produce 36 cm.',
'Un sensore fisso misura separazioni temporali; pressione in pascal è ordinata, non distanza spaziale o traiettoria.',
'La macchia segue la porzione materiale e torna al riposo nel modello trasversale lineare senza residuo; il massimo della forma prosegue.',
'La separazione vale un quarto di ciclo, cioè π/2 rad; 1/4 senza 2π non è il valore in radianti.',
'Dividere differenze dà 1,20/0,08=15 m/s; 20 usa posizione finale senza sottrarre il primo evento.',
'A v costante λ è inversa di f; triplicare entrambi darebbe fattore nove nel prodotto, non v fissata.',
'k=2π/λ=4π/5 rad/m; 2/5 è il numero di cicli per metro, reciproci e prodotti hanno altra dipendenza.',
'La geometria del moto materiale parallelo al vettore di propagazione definisce longitudinale, non un’onda stazionaria.',
'La fase costante impone 6Δx=12Δt: verso positivo, 0,60 m; invertire il rapporto dà 0,15 m.',
'Una fotografia calibrata nello spazio offre λ; senza tempi o dinamica non dà f, T o velocità. Ampiezza possibile ma assente fra le scelte.',
'Le ordinate concordi si sommano con segno: 2 mm; la media è 1 mm e la differenza 0,4 mm.',
'La cancellazione istantanea delle ordinate non annulla le due soluzioni o l’energia cinetica; gli impulsi si separano.',
'Opposizione permanente e ampiezze diverse lasciano |5−3|=2 mm; 8 richiede fase uguale, zero ampiezze uguali.',
'Cammini uguali mantengono lo sfasamento iniziale π; uguali ampiezze e polarizzazione consentono cancellazione completa.',
'Il semi-intero 5/2 dista 1/2 da entrambi gli interi adiacenti; aumentare un cammino di λ mantiene un minimo.',
'Un nodo locale può dipendere dalla fase relativa spaziale; non spegne le sorgenti né annulla frequenza o velocità del mezzo.',
'Con onde progressive concordi e stesso coefficiente la somma coerente 2A dà 4I; contropropagazione e somma incoerente sono altri modelli.',
'La distribuzione uniforme sul giro annulla la media del coseno senza imporre ampiezze o velocità nulle; ipotesi aggiunta esplicitamente nel finale.',
'Distanza extra su velocità comune dà 3/1000 s=3 ms; cambiare etichetta senza convertire dà 0,003 ms errati.',
'Due massimi lontani non danno automaticamente 8 mm; un controesempio con supporti separati ha massimo 4 mm.',
'12 mJ/3 s=4 mW e area 2·10⁻⁴ m²:20 W/m²; dimenticare l’area non completa il compito.',
'Potenza doppia su area sferica quadrupla dà 1/2; 2 ignora geometria, 1/4 ignora potenza e 8 inverte il fattore geometrico.',
'La radice positiva di nove è tre: 0,80·3=2,4 m; fattore nove sulla distanza darebbe intensità divisa per81.',
'Il campo resta imposto: I invariata, potenza raccolta doppia se area doppia e campo non perturbato.',
'W/m²=J/(s·m²), quindi tempo; frequenza al denominatore moltiplicherebbe per secondi.',
'Potenza e sezione positive costanti danno intensità costante; 1/r² richiede invece espansione sferica.',
'Il denominatore della media include pausa: 4·2/10=4/5 W; inversione della frazione attiva dà 20 W.',
'μ compare linearmente con v,ω,A comuni: rapporto tre. Tensioni uguali sarebbero incompatibili con stessa v e densità diverse.',
'La normale è a60° dal raggio: area efficace4·1/2=2 m², potenza10 W; il caso20 W è incidenza normale.',
'Il guscio senza sorgenti, perdite o accumulo conserva potenza integrata; superficie chiusa non significa barriera.',
'50/10=5 e I=10⁵·10⁻¹²=10⁻⁷ W/m²=0,1 μW/m²;10 μW/m² sarebbe70 dB.',
'Logaritmo nullo significa rapporto uno e I=I₀>0; I=0 è fuori dominio, non0 dB.',
'Un centesimo=10⁻² dà−20 dB; invertire il rapporto cambia segno e omettere dieci dà−2.',
'Uguale intensità e riferimento danno uguale livello fisico ma non obbligano uguale percezione a frequenze diverse.',
'L’eco compie102 m in0,30 s:340 m/s;170 dimentica ritorno e680 conterebbe quattro tratte.',
'Sorgente subsonica con velocità radiali non nulle: avvicinamento aumenta e allontanamento diminuisce la frequenza ricevuta.',
'Il ricevitore va incontro ai fronti già emessi; cambia ritmo degli incontri, non frequenza della sorgente o velocità rispetto all’aria.',
'Interfaccia fissa conserva1000 Hz:λ=1480/1000=1,48 m; uso di1 Hz dà1480 m e doppio prefisso0,00148 m.',
'dB significa decibel; hertz, pascal e joule sono altre grandezze e W/m² misura I, non il suo livello.',
'Le tre intensità incoerenti sommano3I: incremento esatto10 log10 3 positivo;30 dB richiederebbe1000I, non3I.'
]
geom=[
'Tre pannelli integralmente letti nel PNG640×1560 e XML: estremi+7/−7 mm a140 coordinate dal centro, stessa scala20/mm; sei tacche equispaziate rappresentano0,10..0,85 s e cinque intervalli0,15 s; barre160/120/90 rappresentano8/6/4,5 mm a20/mm. Gli indici dei massimi non rappresentano il tempo. Testi, estremi e zeri separati dagli assi.',
'PNG640×1560 e XML completi: creste a150/510 e valle330 rappresentano0/36/18 cm, scala10/cm e ordinata schematica. Cerchio di fase a320,850 r110 e arco r60 indicano un quarto di giro, non moto materiale. Retta delle differenze da140,1430 a500,1190 rappresenta1,20 m in0,08 s; punto medio0,60 m/0,04 s. Zeri, testi e punte leggibili.',
'PNG640×1640 e XML completi: barre120+80=200 a100 coordinate/mm; nel secondo pannello200−120=80 a40/mm con origine comune920 e segni opposti. Coppia di barre di ampiezza100/200 e intensità80/320 usa scale distinte, come dichiarato. Tutti gli zeri e testi sono separati da assi e barre.',
'PNG640×1560 e XML completi: E(t) lineare0→12 mJ in3 s, punto medio6 mJ/1,5 s; barre320/160 indicano I e I/2. Segmento del sensore da150,1265 a410,1415 ha lunghezza300 e proiezione150, con normale a60° dal raggio. L’approssimazione delle coordinate non altera le proporzioni esatte derivate; area laterale non identificata con area fisica. Testi e punte interi.',
'PNG640×1580 e XML completi: tabella0/10/50 dB corrisponde a1/10/100000 volteI₀; frecce sono corrispondenze e non scala lineare. Due percorsi di350 coordinate rappresentano51 m ciascuno con punte opposte visibili. Sinusoide di pressione con creste180/476, distanza296 per1,48 m; pressione schematica non traiettoria materiale. Tutto dentro il riquadro.'
]
sourceRaw=git_bytes(APP.parent,'5d1dc8dc7b601aef959d10d564c75462be74708d','officina-di-fisica/content/C5.json');source={q['id']:q for q in json.loads(sourceRaw)}
base=(APP/'tools/corpus_engineering/cric_c4_l01_verifier.py').read_text();tree=ast.parse(base)
def fn(name):
 n=next(n for n in tree.body if isinstance(n,ast.FunctionDef)and n.name==name);start=min([n.lineno]+[d.lineno for d in n.decorator_list]);return '\n'.join(base.splitlines()[start-1:n.end_lineno])+'\n'
for cohort,ref in enumerate(refs,1):
 offset=10*(cohort-1);batch=f'cric-c5-l{cohort:02}';p=json.loads((A/f'editorial/batches/{batch}.json').read_bytes());b=json.loads((A/f'editorial/batches/{batch}-bindings.json').read_bytes());ids={r['id']for r in p['records']}
 for suffix2 in('.json','-bindings.json'):assert(A/f'editorial/batches/{batch}{suffix2}').read_bytes()==git_bytes(A.parent,ref,f'officina-di-fisica/editorial/batches/{batch}{suffix2}')
 home=APP/f'editorial/reviews/{batch}-svg-independent-evidence';receipt=home/(batch+'-terminal.json');visual=json.loads(receipt.read_bytes());assert(visual['exitCode'],visual['signal'])==(0,None);assert visual['assetSha256']==sha((A/f'editorial/assets/{batch}-progressive.svg').read_bytes());visual.update(fullImageReadByReviewer=True,fullXmlReadByReviewer=True,manualVisualReading=geom[cohort-1]);receipt.write_text(json.dumps(visual,ensure_ascii=False,indent=2)+'\n')
 svg=ET.parse(A/f'editorial/assets/{batch}-progressive.svg').getroot();tokens={r['id']:token for r,z,token,assets,errors in reviewed_rows(p,b,{},ids,A/'editorial/assets')};lesson=source[f'C5-L{cohort:02}'];manual=[primary.split(f'## C5-Q{n:03}\n',1)[1].split('\n## ',1)[0].split('Derivazione indipendente: ',1)[1].strip()for n in range(offset+1,offset+11)]
 const=dict(SOURCE_REF='5d1dc8dc7b601aef959d10d564c75462be74708d',SOURCE_PATH='officina-di-fisica/content/C5.json',EXACT_LITERAL_DEPENDENCY_SHA256='b581aec428c4f4a8118e8ec1713447f758af3d20e6c1b38bf39a605662e141de',INDEPENDENT_MODELS_IMPLEMENTATION_SHA256=sha(model.encode()),MODEL_PATH=MODEL_PATH,MODEL_REF=MODEL_REF,PRIMARY_PATH=PRIMARY_PATH,PRIMARY_SHA256=sha(primary.encode()),CANDIDATE_REF=ref,LESSON_REFERENCE=dict(sourceRef='5d1dc8dc7b601aef959d10d564c75462be74708d',gitPath='officina-di-fisica/content/C5.json',sourceSha256=sha(sourceRaw),primarySkill=lesson['id'],title=lesson['title'],actualLessonPrerequisites=lesson['prerequisites']),FAMILY=batch,BATCH=batch,ASSET_NAME=batch+'-progressive.svg',OFFSET=offset,REVIEWED_PACKAGE_SHA256=digest(p),REVIEWED_BINDINGS_SHA256=digest(b),EXPECTED_IDS=ids,REVIEWED_CANDIDATES=tokens,EXPECTED_CONTEXT={r['id']:{k:source[r['id']].get(k)for k in('id','kind','course','order','skill','family','difficulty','prerequisites','exam','version')}for r in p['records']},NUMERIC_UNITS={int(r['id'][-3:]):r['answer']['unit']for r in p['records']if r['answer']['type']=='numeric'},OPTION_SUFFIX={n:v for n,v in suffix.items()if offset<n<=offset+10},UNITS={n:units.get(n,'dimensionless')for n in range(offset+1,offset+11)},MANUAL=manual,READING_NOTES=notes[offset:offset+10],GEOMETRY_REVIEW=geom[cohort-1],REQUIRED_GEOMETRY=tuple((e.tag,tuple(sorted(e.attrib.items())),e.text or'')for e in svg.iter()),REQUIRED_DOMAIN_FRAGMENTS={r['id']:[s]for r in p['records']for s in []})
 # Only explicitly reviewed physical exclusions; removing one must fail after every token is rebound.
 allDomains={3:['volte consecutive','versi opposti'],4:['stesso oscillatore','lontani dagli estremi'],5:['A>0','ω>0'],6:['accumulata'],8:['ampiezza non nulla'],9:['k₁>0'],13:['senza lasciare deformazione residua'],16:['positiva e costante'],23:['stessa frequenza','sempre in opposizione'],24:['uguale ampiezza e stessa polarizzazione'],25:['λ>0'],27:['A>0','C>0','nello stesso verso'],28:['distribuzione uniforme su un giro'],32:['potenza positiva','r>0'],33:['potenza costante positiva'],34:['senza perturbarlo'],36:['potenza positiva e sezione costanti'],38:['v>0','A>0','f>0'],40:['non ci sono assorbimenti, altre sorgenti o accumulo'],42:['I₀ è positivo'],43:['intensità positiva'],46:['subsonica','velocità radiali non nulle'],47:['positiva minore'],48:['interfaccia fissa e lineare'],50:['positiva I','media nulla']}
 for r in p['records']:
  n=int(r['id'][-3:]);fragments=allDomains.get(n,[])
  # Stop on editorial mismatch rather than silently declaring a nonexistent guard.
  for s in fragments:assert s in r['prompt'],(r['id'],s)
  const['REQUIRED_DOMAIN_FRAGMENTS'][r['id']]=fragments
 concepts={n:v for n,v in concept.items()if offset<n<=offset+10};const['CONCEPTS']=concepts;const['KNOWN_OPTIONS']={n:v for n,v in known.items()if offset<n<=offset+10}
 code='''"""Distinct source-first C5 review; concepts separately read; no authoring imports."""\nfrom fractions import Fraction\nfrom functools import lru_cache\nimport json,re,xml.etree.ElementTree as ET\nfrom pathlib import Path\nimport sympy as sp\nimport pint,hypothesis\nfrom .pipeline import canonical,digest,git_bytes,sha\nfrom .review_contract import reviewed_rows\nfrom . import exact_arithmetic_literals as exact_numbers\nSI=pint.UnitRegistry(non_int_type=Fraction)\n'''+''.join(k+'='+repr(v)+'\n'for k,v in const.items())+'\n'+pure+'\n'+fn('_finite_exact')+fn('_rational_exact')+fn('equivalent_literal')+fn('parse_literal')+fn('source_records')
 code+='KNOWN_MATH={'+','.join(repr(k)+':'+v for k,v in maths.items())+'}\n'
 code+='''def mapped_literal(raw):
    if not isinstance(raw,str):raise ValueError('Exact source lexeme required')
    if raw in KNOWN_MATH:return _finite_exact(KNOWN_MATH[raw])
    return parse_literal(raw)
def parse_option(number,option):
    if type(number)is not int or not OFFSET<number<=OFFSET+10 or not isinstance(option,str):raise ValueError('Reviewed option ID and string required')
    if option in KNOWN_OPTIONS.get(number,{}):return parse_literal(KNOWN_OPTIONS[number][option])
    suffix=OPTION_SUFFIX.get(number,'')
    if suffix and not option.endswith(suffix):raise ValueError('Required literal physical unit absent')
    return mapped_literal(option.removesuffix(suffix)if suffix else option)
def alternative_identity(option,number=None):
    if not isinstance(option,str):return None
    if number in KNOWN_OPTIONS and option in KNOWN_OPTIONS[number]:return 'normalized',parse_option(number,option)
    for suffix,dimension,scale in [(' μW/m²','intensity',sp.Rational(1,10**6)),(' W/m²','intensity',sp.Integer(1)),(' mW','power',sp.Rational(1,1000)),(' W','power',sp.Integer(1)),(' rad/m','wavenumber',sp.Integer(1)),(' rad','phase',sp.Integer(1)),(' Hz','frequency',sp.Integer(1)),(' periodi','count',sp.Integer(1)),(' m/s','speed',sp.Integer(1)),(' mm','length',sp.Rational(1,1000)),(' cm','length',sp.Rational(1,100)),(' m','length',sp.Integer(1)),(' ms','time',sp.Rational(1,1000)),(' s','time',sp.Integer(1)),(' dB','level',sp.Integer(1)),('','normalized',sp.Integer(1))]:
        if suffix and not option.endswith(suffix):continue
        try:value=mapped_literal(option.removesuffix(suffix)if suffix else option)
        except (ValueError,TypeError):continue
        return dimension,sp.simplify(value*scale)
    return None
@lru_cache(maxsize=1)
def oracle():
    main()
    values=source_only_predictions();physics.check_independent_laws(values);values['C5-Q016']=sp.Rational(1,3)
    return [CONCEPTS[n]if n in CONCEPTS else values[f'C5-Q{n:03}']for n in range(OFFSET+1,OFFSET+11)]
def asset_geometry(asset_root):
    root=ET.parse(asset_root/ASSET_NAME).getroot()
    actual=tuple((e.tag,tuple(sorted(e.attrib.items())),e.text or'')for e in root.iter())
    if actual!=REQUIRED_GEOMETRY:raise ValueError('Independent physical scale or reviewed SVG quantity labels/accessibility changed')
    return GEOMETRY_REVIEW
'''
 verify=fn('verify').replace('cric_c4_l01_authoring',batch.replace('-','_')+'_authoring').replace('editorial/reviews/cric-c4-001-020-partial-models.py',MODEL_PATH).replace('expected[number-1]','expected[number-OFFSET-1]').replace('MANUAL[number-1]','MANUAL[number-OFFSET-1]').replace('"physicalAssumptions":ASSUMPTIONS[number-1],"distractors":DISTRACTORS[number-1]','"physicalAssumptions":READING_NOTES[number-OFFSET-1],"distractors":READING_NOTES[number-OFFSET-1]').replace('PEDAGOGY[number-1]','READING_NOTES[number-OFFSET-1]').replace('SymPy_source_prompt_only_charge_conservation_and_Coulomb_scaling','SymPy_frozen_prompt_only_wave_models_and_separate_concepts').replace('Pint_charge_force_distance_dimensions_and_exact_Fraction_lexemes','Pint_exact_wave_dimensions_and_Fraction_lexemes')
 code+='from . import cric_c5_wave_physics as physics\nWAVE_PHYSICS_SHA256='+repr(sha((APP/'tools/corpus_engineering/cric_c5_wave_physics.py').read_bytes()))+'\n'
 verify=verify.replace('common=[]','common=[]\n    if sha(Path(physics.__file__).read_bytes())!=WAVE_PHYSICS_SHA256:common.append("Independent wave-law dependency edition mismatch")')
 code+=verify
 report=fn('report').replace('editorial/reviews/cric-c4-001-020-partial-models.py',MODEL_PATH).replace('719bbd0fbc114937438b80a74d787297c5249336',MODEL_REF).replace('editorial/reviews/primary-cric-c4-001-020-partial-before-candidates-20261126.md',PRIMARY_PATH).replace('SOURCE_REFERENCE','"Fifty original prompts derived before candidate answers; final cohort fully read separately."').replace('All functions in the frozen source-only C4 partial model','All functions in the frozen source-only C5 model')
 report=report.replace('"reviewDependencySha256":{"exact_arithmetic_literals.py":sha(Path(exact_numbers.__file__).read_bytes())}', '"reviewDependencySha256":{"exact_arithmetic_literals.py":sha(Path(exact_numbers.__file__).read_bytes()),"cric_c5_wave_physics.py":sha(Path(physics.__file__).read_bytes())}')
 code+=report
 ast.parse(code);(APP/f'tools/corpus_engineering/{batch.replace("-","_")}_verifier.py').write_text(code)
 print('FROZEN_READ',batch,ref,flush=True)
